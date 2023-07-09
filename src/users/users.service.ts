import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { ValidRoles } from 'src/auth/enums/valid-roles';
import { PaginationArgs, SearchArgs } from 'src/common/args';
import { Repository } from 'typeorm';
import { UpdateUserInput } from './dto';
import { User } from './entities/user.entity';
import { UserStatus } from './enums/user-status';

@Injectable()
export class UsersService {
  private logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, phone, ...userData } = createUserDto;

    const parsedNumber = parsePhoneNumberFromString(phone, 'AU');

    if (!parsedNumber) {
      throw new BadRequestException('invalid_phone_number');
    }

    const existUser = await this.findOneByEmailOrPhone(
      userData.email,
      parsedNumber.number,
    );

    let newUser;
    if (existUser) {
      if (existUser.status === UserStatus.Pending) {
        // user is under revision
        throw new UnauthorizedException('user_is_being_reviewed');
      }

      if (existUser.status !== UserStatus.Incomplete) {
        throw new BadRequestException('user_already_exist');
      }

      newUser = await this.userRepository.preload({
        ...createUserDto,
        id: existUser.id,
      });
    } else {
      newUser = this.userRepository.create({
        ...userData,
        phone: parsedNumber.number,
        password: password ? bcrypt.hashSync(password, 10) : null,
      });
    }

    await this.userRepository.save(newUser);

    const user = await this.findOneByEmail(newUser.email);
    delete user.password;

    return user;
  }

  async findAll(
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<User[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .skip(offset)
      .take(limit);

    if (search) {
      queryBuilder.andWhere(
        `user.fullName ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search`,
        {
          search: `%${search}%`,
        },
      );
    }

    return queryBuilder.getMany();
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) throw new NotFoundException(`user_not_found`);
    delete user.password;

    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'fullName', 'roles', 'status'],
    });

    if (!user) throw new NotFoundException(`user_not_found`);

    return user;
  }

  async findOneByEmailOrPhone(email: string, phone: string): Promise<User> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .orWhere('user.phone = :phone', { phone });

    return await queryBuilder.getOne();
  }

  async update(
    id: string,
    updateUserInput: UpdateUserInput,
    currentUser: User,
  ): Promise<User> {
    if (
      currentUser.id !== id &&
      !currentUser.roles.includes(ValidRoles.admin)
    ) {
      throw new BadRequestException('cannot_perform_this_action');
    }

    await this.findOneById(id);

    const { ...rest } = updateUserInput;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .update()
      .set(rest)
      .where('"id" = :id', { id });

    await queryBuilder.execute();
    return await this.findOneById(id);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  private handleDBError(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException('Email already exists');
    }
    if (error.code === '23502') {
      throw new BadRequestException('Email is required');
    }
    if (error.code === 'error-001') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new BadRequestException('Check server logs');
  }
}

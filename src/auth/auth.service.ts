import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { UserStatus } from 'src/users/enums/user-status';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ValidRoles } from './enums/valid-roles';
import { JwtPayload } from './interfaces/jwt-payload.interfaces';
import { AuthResponse } from './types/auth-response.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<AuthResponse> {
    const user = await this.usersService.create(createUserDto);

    return {
      user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async login(loginUserDto: LoginUserDto): Promise<AuthResponse> {
    const { password, email } = loginUserDto;

    const user = await this.usersService.findOneByEmail(email);

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('invalid_credentials');
    }

    delete user.password;

    return {
      user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async validateUser(id: string): Promise<User> {
    const user = await this.usersService.findOneById(id);

    if (!user) throw new UnauthorizedException('token_invalid');
    if (
      user.roles.includes(ValidRoles.user) &&
      user.status !== UserStatus.Active
    ) {
      throw new UnauthorizedException('user_is_not_active');
    }

    return user;
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}

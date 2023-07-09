import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PaginationArgs, SearchArgs } from 'src/common/args';
import { UpdateUserInput } from './dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  async findAll(
    @Args() pagination: PaginationArgs,
    @Args() search: SearchArgs,
    @CurrentUser([ValidRoles.admin]) _user: User,
  ): Promise<User[]> {
    return this.usersService.findAll(pagination, search);
  }

  @Query(() => User, { name: 'getUser' })
  async findOneById(
    @CurrentUser([ValidRoles.admin]) _user: User,
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Mutation(() => User, { name: 'updateUser' })
  updateUser(
    @CurrentUser([ValidRoles.user, ValidRoles.admin])
    user: User,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ) {
    return this.usersService.update(updateUserInput.id, updateUserInput, user);
  }
}

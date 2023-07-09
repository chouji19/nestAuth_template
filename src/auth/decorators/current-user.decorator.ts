import {
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { ValidRoles } from '../enums/valid-roles';

export const CurrentUser = createParamDecorator(
  (roles: ValidRoles[] = [ValidRoles.user], context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const user: User = ctx.getContext().req.user;

    if (!user) {
      throw new InternalServerErrorException('no user found in context');
    }

    if (roles.length === 0) return user;

    for (const role of user.roles) {
      if (roles.includes(role as ValidRoles)) return user;
    }
    throw new ForbiddenException(
      'User does not have the required role(s) to access this resource',
    );
  },
);

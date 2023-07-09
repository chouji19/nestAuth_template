import { registerEnumType } from '@nestjs/graphql';

export enum UserStatus {
  Active = 'Active',
  Pending = 'Pending',
  Blocked = 'Blocked',
  Incomplete = 'Incomplete',
}

registerEnumType(UserStatus, { name: 'UserStatus' });

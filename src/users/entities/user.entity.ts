import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { ValidRoles } from 'src/auth/enums/valid-roles';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserStatus } from '../enums/user-status';

@Entity('users')
@ObjectType()
export class User {
  @ApiProperty({
    example: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
    description: 'The unique identifier of the user',
  })
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, {
    description: 'The id of the user',
  })
  id: string;

  @ApiProperty({
    example: 'test@test.com',
    description: 'The email of the user',
  })
  @Column('text', { unique: true })
  @Field(() => String, { description: 'Email of the user' })
  email: string;

  @ApiProperty({
    example: 'Password123',
    description: 'The password of the user',
  })
  @Column('text', {
    select: false,
    nullable: true,
  })
  // @Field(() => String, { description: 'Password of the user' })
  password?: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user',
  })
  @Column('text')
  @Field(() => String, { description: 'Full name of the user' })
  fullName: string;

  @ApiProperty({
    example: '1234567890',
    description: 'The phone number of the user',
  })
  @Column('text', { unique: true })
  @Field(() => String, { description: 'Phone number of the user' })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.Incomplete,
  })
  @Field(() => UserStatus, { description: 'Status of the user' })
  status: UserStatus;

  @Column({
    array: true,
    default: [ValidRoles.user],
    type: 'text',
  })
  @Field(() => [ValidRoles], { description: "User's roles" })
  roles: ValidRoles[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updated_at: Date;

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }
}

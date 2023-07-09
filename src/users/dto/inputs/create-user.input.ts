import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateUserInput {
  @ApiProperty({
    example: 'test@test.com',
    description: 'The email of the user',
  })
  @Field(() => String)
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'test@test.com',
    description: "User's full name",
  })
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    example: '1234567890',
    description: 'The phone number of the user',
  })
  @Field(() => String)
  @IsString()
  phone: string;
}

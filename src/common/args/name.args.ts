import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@ArgsType()
export class NameArgs {
  @Field(() => String, { nullable: true, description: 'Name field in entity' })
  @IsOptional()
  @IsString()
  name?: string;
}

import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@ArgsType()
export class SearchArgs {
  @Field(() => String, { nullable: true, description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;
}

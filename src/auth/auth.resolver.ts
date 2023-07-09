import { UseGuards } from '@nestjs/common';
import { Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Resolver()
@UseGuards(JwtAuthGuard)
export class AuthResolver {}

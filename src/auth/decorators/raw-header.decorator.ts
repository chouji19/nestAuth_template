import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';

export const RawHeader = createParamDecorator((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const headers = req.rawHeaders;
  if (!headers) throw new InternalServerErrorException('headers not found');

  return headers;
});

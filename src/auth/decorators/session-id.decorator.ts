import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtResponseDto } from '../dto';

interface RequestWithUser extends Request {
  user?: JwtResponseDto;
}

export const SessionId = createParamDecorator((data: unknown, ctx: ExecutionContext): string | undefined => {
  const request = ctx.switchToHttp().getRequest<RequestWithUser>();
  return request.user?.sid;
});

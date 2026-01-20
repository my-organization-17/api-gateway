import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserResponseDto } from 'src/common/dto';

interface RequestWithUser extends Request {
  user?: UserResponseDto;
}

export const UserId = createParamDecorator((data: unknown, ctx: ExecutionContext): string | undefined => {
  const request = ctx.switchToHttp().getRequest<RequestWithUser>();
  return request.user?.id;
});

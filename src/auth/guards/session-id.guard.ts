import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtResponseDto } from '../dto';

interface RequestWithUser extends Request {
  user?: JwtResponseDto;
}

@Injectable()
export class SessionIdGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (!request.user?.sid) {
      throw new UnauthorizedException('Unauthorized: No current session ID found');
    }
    return true;
  }
}

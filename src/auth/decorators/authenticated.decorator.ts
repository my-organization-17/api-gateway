import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

export const Authenticated = () => {
  return applyDecorators(ApiBearerAuth(), UseGuards(JwtAuthGuard));
};

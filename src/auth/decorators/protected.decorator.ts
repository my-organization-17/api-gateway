import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { UserRole } from 'src/generated-types/user';
import { RolesGuard } from '../guards';
import { Roles } from './roles.decorator';

export const Protected = (...roles: UserRole[]) => {
  if (roles.length === 0) return applyDecorators(ApiBearerAuth(), UseGuards(JwtAuthGuard));

  return applyDecorators(ApiBearerAuth(), Roles(...roles), UseGuards(JwtAuthGuard, RolesGuard));
};

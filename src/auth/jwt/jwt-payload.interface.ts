import { UserRole } from 'src/generated-types/user';

export interface JwtPayload {
  sub: string; // userId
  isBanned: boolean;
  role: UserRole;
  iat: number;
  exp: number;
}

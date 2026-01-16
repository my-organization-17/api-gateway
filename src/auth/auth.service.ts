import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import {
  AUTH_SERVICE_NAME,
  type AuthResponse,
  type AuthServiceClient,
  type RefreshTokensResponse,
  type SignInRequest,
  type SignUpRequest,
} from 'src/generated-types/auth';
import { type User, USER_SERVICE_NAME, type UserServiceClient } from 'src/generated-types/user';

@Injectable()
export class AuthService implements OnModuleInit {
  private userService: UserServiceClient;
  private authService: AuthServiceClient;
  protected readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject('USER_MICROSERVICE')
    private readonly userMicroserviceClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.userService = this.userMicroserviceClient.getService<UserServiceClient>(USER_SERVICE_NAME);
    this.authService = this.userMicroserviceClient.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  signUp(data: SignUpRequest): Observable<User> {
    this.logger.log(`Signing up user with email: ${data.email}`);
    try {
      return this.authService.signUp(data);
    } catch (error) {
      this.logger.error(`Failed to sign up user: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }

  verifyEmail(token: string): Observable<AuthResponse> {
    this.logger.log(`Verifying email with token: ${token}`);
    try {
      return this.authService.verifyEmail({ token });
    } catch (error) {
      this.logger.error(`Failed to verify email: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }

  signIn(data: SignInRequest): Observable<AuthResponse> {
    this.logger.log(`Signing in user with email: ${data.email}`);
    try {
      return this.authService.signIn(data);
    } catch (error) {
      this.logger.error(`Failed to sign in user: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }

  refreshTokens(refreshToken: string): Observable<RefreshTokensResponse> {
    this.logger.log(`Refreshing tokens with refresh token: ${refreshToken}`);
    try {
      return this.authService.refreshTokens({ token: refreshToken });
    } catch (error) {
      this.logger.error(`Failed to refresh tokens: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }
}

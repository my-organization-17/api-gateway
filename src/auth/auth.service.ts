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
import type { StatusResponse, User } from 'src/generated-types/user';

@Injectable()
export class AuthService implements OnModuleInit {
  private authService: AuthServiceClient;
  protected readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject('USER_MICROSERVICE')
    private readonly userMicroserviceClient: ClientGrpc,
  ) {}

  onModuleInit() {
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

  resendConfirmationEmail(email: string): Observable<StatusResponse> {
    this.logger.log(`Resending confirmation email to: ${email}`);
    try {
      return this.authService.resendConfirmationEmail({ email });
    } catch (error) {
      this.logger.error(`Failed to resend confirmation email: ${(error as Error).message || 'Unknown error'}`);
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

  initResetPassword(email: string): Observable<StatusResponse> {
    this.logger.log(`Initiating reset password for email: ${email}`);
    try {
      return this.authService.initResetPassword({ email });
    } catch (error) {
      this.logger.error(`Failed to initiate reset password: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }

  resendResetPasswordEmail(email: string): Observable<StatusResponse> {
    this.logger.log(`Resending reset password email to: ${email}`);
    try {
      return this.authService.resendResetPasswordEmail({ email });
    } catch (error) {
      this.logger.error(`Failed to resend reset password email: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }

  setNewPassword(token: string, password: string): Observable<StatusResponse> {
    this.logger.log(`Setting new password with token: ${token}`);
    try {
      return this.authService.setNewPassword({ token, password });
    } catch (error) {
      this.logger.error(`Failed to set new password: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }
}

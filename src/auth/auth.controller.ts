import {
  Body,
  Controller,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Request, Response } from 'express';

import { SerializeInterceptor } from 'src/utils/serialize.interceptor';
import { PasswordRequestDto, UserResponseDto } from 'src/common/dto';
import { AuthResponseDto, EmailRequestDto, SignInRequestDto, SignUpRequestDto, TokenResponseDto } from './dto';
import { AuthService } from './auth.service';
import { Protected, SessionId, UserId } from './decorators';

import type { StatusResponse } from 'src/generated-types/user';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}
  protected readonly logger = new Logger(AuthController.name);

  // User Sign-Up
  @UseInterceptors(new SerializeInterceptor(UserResponseDto))
  @Post('signup')
  @ApiOperation({
    summary: 'User Sign-Up',
    description: 'Registers a new user with the provided details',
  })
  @ApiBody({ type: SignUpRequestDto })
  @ApiResponse({
    status: 201,
    type: UserResponseDto,
    description: 'The user has been successfully registered',
  })
  public signUp(@Body() data: SignUpRequestDto): Observable<UserResponseDto> {
    this.logger.log('Received sign-up request');
    return this.authService.signUp(data);
  }

  // Resend Confirmation Email
  @Post('resend-confirmation-email')
  @ApiOperation({
    summary: 'Resend Confirmation Email',
    description: 'Resend the email confirmation link to the specified email address',
  })
  @ApiBody({ type: EmailRequestDto })
  @ApiResponse({
    status: 200,
    description: 'The confirmation email has been successfully resent',
  })
  public resendConfirmationEmail(@Body() { email }: EmailRequestDto): Observable<StatusResponse> {
    this.logger.log(`Received request to resend confirmation email to: ${email}`);
    return this.authService.resendConfirmationEmail(email);
  }

  // Verify Email
  @UseInterceptors(new SerializeInterceptor(AuthResponseDto))
  @Post('verify-email')
  @ApiOperation({
    summary: 'Verify Email',
    description: "Verifies a user's email using a token",
  })
  @ApiQuery({
    name: 'token',
    required: true,
    description: 'The email verification token',
  })
  @ApiResponse({
    status: 200,
    type: AuthResponseDto,
    description: 'The email has been successfully verified',
  })
  public verifyEmail(
    @Query('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ): Observable<AuthResponseDto> {
    this.logger.log('Received email verification request');
    return this.authService.verifyEmail(token).pipe(
      tap((response) => {
        res.cookie('refresh_token', response.refreshToken, {
          httpOnly: true,
          secure: this.configService.getOrThrow<string>('NODE_ENV') === 'production',
          domain: this.configService.getOrThrow<string>('COOKIE_DOMAIN'),
          sameSite: 'lax',
          maxAge: this.configService.getOrThrow<number>('COOKIE_TTL') * 1000, // 7 days
        });
      }),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      map(({ refreshToken, ...rest }) => ({ ...rest })),
    );
  }

  // User Sign-In
  @UseInterceptors(new SerializeInterceptor(AuthResponseDto))
  @Post('signin')
  @ApiOperation({
    summary: 'User Sign-In',
    description: 'Authenticates a user and returns access and refresh tokens',
  })
  @ApiBody({ type: SignInRequestDto })
  @ApiResponse({
    status: 200,
    type: AuthResponseDto,
    description: 'The user has been successfully authenticated',
  })
  public signIn(
    @Body() data: SignInRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Observable<AuthResponseDto> {
    this.logger.log('Received sign-in request');

    // Extract client info
    const clientInfo = {
      ipAddress: this.getClientIp(req),
      userAgent: req.headers['user-agent'] || 'Unknown',
    };
    return this.authService.signIn({ ...data, clientInfo }).pipe(
      tap((response) => {
        res.cookie('refresh_token', response.refreshToken, {
          httpOnly: true,
          secure: this.configService.get<string>('NODE_ENV') === 'production',
          domain: this.configService.get<string>('COOKIE_DOMAIN'),
          sameSite: 'lax',
          maxAge: this.configService.getOrThrow<number>('COOKIE_TTL') * 1000, // 7 days
        });
      }),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      map(({ refreshToken, ...rest }) => ({ ...rest })),
    );
  }

  // Refresh Tokens
  @Post('refresh-tokens')
  @ApiOperation({
    summary: 'Refresh Tokens',
    description: 'Refreshes the access and refresh tokens using the provided refresh token',
  })
  @ApiResponse({
    status: 200,
    type: TokenResponseDto,
    description: 'The tokens have been successfully refreshed',
  })
  public refreshTokens(@Req() req: Request, @Res({ passthrough: true }) res: Response): Observable<TokenResponseDto> {
    this.logger.log('Received token refresh request');
    const refreshToken = (req.cookies as Record<string, string>)['refresh_token'];
    // const refreshToken = req.cookies?.refresh_token as string;
    if (!refreshToken) {
      this.logger.warn('No refresh token found in cookies');
      throw new UnauthorizedException('Unauthorized: No refresh token provided');
    }

    return this.authService.refreshTokens(refreshToken).pipe(
      tap((response) => {
        res.cookie('refresh_token', response.refreshToken, {
          httpOnly: true,
          secure: this.configService.get<string>('NODE_ENV') === 'production',
          domain: this.configService.get<string>('COOKIE_DOMAIN'),
          sameSite: 'lax',
          maxAge: this.configService.getOrThrow<number>('COOKIE_TTL') * 1000, // 7 days
        });
      }),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      map(({ refreshToken, ...rest }) => ({ ...rest })),
    );
  }

  // Initiate Reset Password
  @Post('init-reset-password')
  @ApiOperation({
    summary: 'Initiate Reset Password',
    description: 'Sends a password reset email to the specified email address',
  })
  @ApiBody({ type: EmailRequestDto })
  @ApiResponse({
    status: 200,
    description: 'The password reset email has been successfully sent',
  })
  public initResetPassword(@Body() { email }: EmailRequestDto): Observable<StatusResponse> {
    this.logger.log(`Received request to initiate password reset for email: ${email}`);
    return this.authService.initResetPassword(email);
  }

  // Resend Reset Password Email
  @Post('resend-reset-password-email')
  @ApiOperation({
    summary: 'Resend Reset Password Email',
    description: 'Resend the password reset email to the specified email address',
  })
  @ApiBody({ type: EmailRequestDto })
  @ApiResponse({
    status: 200,
    description: 'The password reset email has been successfully resent',
  })
  public resendResetPasswordEmail(@Body() { email }: EmailRequestDto): Observable<StatusResponse> {
    this.logger.log(`Received request to resend password reset email to: ${email}`);
    return this.authService.resendResetPasswordEmail(email);
  }

  // Set New Password
  @Post('set-new-password')
  @ApiOperation({
    summary: 'Set New Password',
    description: 'Sets a new password using the provided token and password',
  })
  @ApiQuery({
    name: 'token',
    required: true,
    description: 'The password reset token',
  })
  @ApiBody({ type: PasswordRequestDto })
  @ApiResponse({
    status: 200,
    description: 'The password has been successfully updated',
  })
  public setNewPassword(
    @Query('token') token: string,
    @Body() { password }: PasswordRequestDto,
  ): Observable<StatusResponse> {
    this.logger.log('Received request to set new password');
    return this.authService.setNewPassword(token, password);
  }

  // User Logout
  @Post('logout')
  @ApiOperation({
    summary: 'User Logout',
    description: 'Logs out the user by clearing the refresh token cookie',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully logged out',
  })
  public logout(@Res({ passthrough: true }) res: Response): void {
    this.logger.log('Received logout request');
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      domain: this.configService.get<string>('COOKIE_DOMAIN'),
      sameSite: 'lax',
    });
  }

  // Sign Out Other Devices
  @Post('signout-other-devices')
  @Protected()
  @ApiOperation({
    summary: 'Sign Out Other Devices',
    description:
      'Signs out the user from all other devices except the current one by invalidating other refresh tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully signed out from other devices',
  })
  public signOutOtherDevices(@UserId() userId: string, @SessionId() sessionId: string): Observable<StatusResponse> {
    this.logger.log(`Received request to sign out other devices for user ID: ${userId}`);
    if (!sessionId) {
      this.logger.warn('No current session ID found in request');
      throw new UnauthorizedException('Unauthorized: No current session ID found');
    }
    return this.authService.signOutOtherDevices(userId, sessionId);
  }

  // Sign Out All Devices
  @Post('signout-all-devices')
  @Protected()
  @ApiOperation({
    summary: 'Sign Out All Devices',
    description: 'Signs out the user from all devices by invalidating all refresh tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully signed out from all devices',
  })
  public signOutAllDevices(@UserId() id: string): Observable<StatusResponse> {
    this.logger.log(`Received request to sign out all devices for user ID: ${id}`);
    return this.authService.signOutAllDevices(id);
  }

  // Helper method to get client IP address
  private getClientIp(req: Request): string {
    // Handle proxies (X-Forwarded-For header)
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
      return ips.trim();
    }
    return req.ip || req.socket.remoteAddress || 'Unknown';
  }
}

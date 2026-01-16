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
import { UserResponseDto } from 'src/common/dto/user.response.dto';
import { AuthService } from './auth.service';
import { SignUpRequestDto } from './dto/signup.request.dto';
import { AuthResponseDto } from './dto/auth.response.dto';
import { TokenResponseDto } from './dto/token.response.dto';
import { SignInRequestDto } from './dto/signin.request.dto';

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
          secure: this.configService.get<string>('NODE_ENV') === 'production',
          domain: this.configService.get<string>('COOKIE_DOMAIN'),
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
    @Res({ passthrough: true }) res: Response,
  ): Observable<AuthResponseDto> {
    this.logger.log('Received sign-in request');
    return this.authService.signIn(data).pipe(
      tap((response) => {
        res.cookie('refresh_token', response.refreshToken, {
          httpOnly: true,
          secure: this.configService.get<string>('NODE_ENV') === 'production',
          domain: this.configService.get<string>('COOKIE_DOMAIN'),
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
      }),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      map(({ refreshToken, ...rest }) => ({ ...rest })),
    );
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
}

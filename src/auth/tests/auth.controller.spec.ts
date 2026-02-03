import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { firstValueFrom, of } from 'rxjs';
import { Request, Response } from 'express';

import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { UserRole, type StatusResponse, type User } from 'src/generated-types/user';

describe('AuthController', () => {
  let controller: AuthController;

  const mockUser: User = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    phoneNumber: null,
    role: UserRole.USER,
    avatarUrl: null,
    passwordHash: 'hashed-password',
    isEmailVerified: true,
    lastLogin: null,
    isBanned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthResponse = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: mockUser,
  };

  const mockStatusResponse: StatusResponse = {
    success: true,
    message: 'Operation successful',
  };

  const mockRefreshTokensResponse = {
    accessToken: 'new-access-token',
    refreshToken: 'new-refresh-token',
  };

  const signUpMock = jest.fn();
  const signInMock = jest.fn();
  const verifyEmailMock = jest.fn();
  const resendConfirmationEmailMock = jest.fn();
  const refreshTokensMock = jest.fn();
  const initResetPasswordMock = jest.fn();
  const resendResetPasswordEmailMock = jest.fn();
  const setNewPasswordMock = jest.fn();
  const configGetMock = jest.fn();
  const cookieMock = jest.fn();
  const clearCookieMock = jest.fn();

  const mockResponse = {
    cookie: cookieMock,
    clearCookie: clearCookieMock,
  } as unknown as Response;

  beforeEach(async () => {
    signUpMock.mockReturnValue(of(mockUser));
    signInMock.mockReturnValue(of(mockAuthResponse));
    verifyEmailMock.mockReturnValue(of(mockAuthResponse));
    resendConfirmationEmailMock.mockReturnValue(of(mockStatusResponse));
    refreshTokensMock.mockReturnValue(of(mockRefreshTokensResponse));
    initResetPasswordMock.mockReturnValue(of(mockStatusResponse));
    resendResetPasswordEmailMock.mockReturnValue(of(mockStatusResponse));
    setNewPasswordMock.mockReturnValue(of(mockStatusResponse));
    configGetMock.mockImplementation((key: string) => {
      if (key === 'NODE_ENV') return 'test';
      if (key === 'COOKIE_DOMAIN') return 'localhost';
      return undefined;
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signUp: signUpMock,
            signIn: signInMock,
            verifyEmail: verifyEmailMock,
            resendConfirmationEmail: resendConfirmationEmailMock,
            refreshTokens: refreshTokensMock,
            initResetPassword: initResetPasswordMock,
            resendResetPasswordEmail: resendResetPasswordEmailMock,
            setNewPassword: setNewPasswordMock,
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: configGetMock,
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should call authService.signUp and return user', async () => {
      const signUpData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const result = await firstValueFrom(controller.signUp(signUpData));

      expect(result).toEqual(mockUser);
      expect(signUpMock).toHaveBeenCalledWith(signUpData);
    });
  });

  describe('resendConfirmationEmail', () => {
    it('should call authService.resendConfirmationEmail', async () => {
      const email = 'test@example.com';

      const result = await firstValueFrom(controller.resendConfirmationEmail({ email }));

      expect(result).toEqual(mockStatusResponse);
      expect(resendConfirmationEmailMock).toHaveBeenCalledWith(email);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email, set cookie, and return response without refreshToken', async () => {
      const token = 'verification-token';

      const result = await firstValueFrom(controller.verifyEmail(token, mockResponse));

      expect(result).toEqual({
        accessToken: mockAuthResponse.accessToken,
        user: mockAuthResponse.user,
      });
      expect(verifyEmailMock).toHaveBeenCalledWith(token);
      expect(cookieMock).toHaveBeenCalledWith(
        'refresh_token',
        mockAuthResponse.refreshToken,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
        }),
      );
    });
  });

  describe('signIn', () => {
    it('should sign in, set cookie, and return response without refreshToken', async () => {
      const signInData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await firstValueFrom(controller.signIn(signInData, mockResponse));

      expect(result).toEqual({
        accessToken: mockAuthResponse.accessToken,
        user: mockAuthResponse.user,
      });
      expect(signInMock).toHaveBeenCalledWith(signInData);
      expect(cookieMock).toHaveBeenCalledWith(
        'refresh_token',
        mockAuthResponse.refreshToken,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
        }),
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens and set new cookie', async () => {
      const mockRequest = {
        cookies: { refresh_token: 'old-refresh-token' },
      } as unknown as Request;

      const result = await firstValueFrom(controller.refreshTokens(mockRequest, mockResponse));

      expect(result).toEqual({
        accessToken: mockRefreshTokensResponse.accessToken,
      });
      expect(refreshTokensMock).toHaveBeenCalledWith('old-refresh-token');
      expect(cookieMock).toHaveBeenCalledWith(
        'refresh_token',
        mockRefreshTokensResponse.refreshToken,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
        }),
      );
    });

    it('should throw UnauthorizedException when no refresh token in cookies', () => {
      const mockRequest = {
        cookies: {},
      } as unknown as Request;

      expect(() => controller.refreshTokens(mockRequest, mockResponse)).toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should clear the refresh token cookie', () => {
      controller.logout(mockResponse);

      expect(clearCookieMock).toHaveBeenCalledWith(
        'refresh_token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
        }),
      );
    });
  });

  describe('initResetPassword', () => {
    it('should call authService.initResetPassword', async () => {
      const email = 'test@example.com';

      const result = await firstValueFrom(controller.initResetPassword({ email }));

      expect(result).toEqual(mockStatusResponse);
      expect(initResetPasswordMock).toHaveBeenCalledWith(email);
    });
  });

  describe('resendResetPasswordEmail', () => {
    it('should call authService.resendResetPasswordEmail', async () => {
      const email = 'test@example.com';

      const result = await firstValueFrom(controller.resendResetPasswordEmail({ email }));

      expect(result).toEqual(mockStatusResponse);
      expect(resendResetPasswordEmailMock).toHaveBeenCalledWith(email);
    });
  });

  describe('setNewPassword', () => {
    it('should call authService.setNewPassword', async () => {
      const token = 'reset-token';
      const password = 'new-password123';

      const result = await firstValueFrom(controller.setNewPassword(token, { password }));

      expect(result).toEqual(mockStatusResponse);
      expect(setNewPasswordMock).toHaveBeenCalledWith(token, password);
    });
  });
});

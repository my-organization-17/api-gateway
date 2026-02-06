import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom, of } from 'rxjs';

import { AuthService } from '../auth.service';
import { UserRole, type StatusResponse, type User } from 'src/generated-types/user';
import { MetricsService } from 'src/supervision/metrics/metrics.service';

describe('AuthService', () => {
  let service: AuthService;

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
  const signOutOtherDevicesMock = jest.fn();
  const signOutAllDevicesMock = jest.fn();

  const passthrough =
    <T>() =>
    (source: import('rxjs').Observable<T>) =>
      source;

  const mockMetricsService = {
    trackGrpcCall: jest.fn().mockReturnValue(passthrough()),
    trackAuthAttempt: jest.fn().mockReturnValue(passthrough()),
  };

  beforeEach(async () => {
    signUpMock.mockReturnValue(of(mockUser));
    signInMock.mockReturnValue(of(mockAuthResponse));
    verifyEmailMock.mockReturnValue(of(mockAuthResponse));
    resendConfirmationEmailMock.mockReturnValue(of(mockStatusResponse));
    refreshTokensMock.mockReturnValue(of(mockRefreshTokensResponse));
    initResetPasswordMock.mockReturnValue(of(mockStatusResponse));
    resendResetPasswordEmailMock.mockReturnValue(of(mockStatusResponse));
    setNewPasswordMock.mockReturnValue(of(mockStatusResponse));
    signOutOtherDevicesMock.mockReturnValue(of(mockStatusResponse));
    signOutAllDevicesMock.mockReturnValue(of(mockStatusResponse));

    const mockAuthServiceClient = {
      signUp: signUpMock,
      signIn: signInMock,
      verifyEmail: verifyEmailMock,
      resendConfirmationEmail: resendConfirmationEmailMock,
      refreshTokens: refreshTokensMock,
      initResetPassword: initResetPasswordMock,
      resendResetPasswordEmail: resendResetPasswordEmailMock,
      setNewPassword: setNewPasswordMock,
      signOutOtherDevices: signOutOtherDevicesMock,
      signOutAllDevices: signOutAllDevicesMock,
    };

    const mockGrpcClient = {
      getService: jest.fn().mockReturnValue(mockAuthServiceClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'AUTH_CLIENT',
          useValue: mockGrpcClient,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should call authService.signUp with correct data', async () => {
      const signUpData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const result = await firstValueFrom(service.signUp(signUpData));

      expect(result).toEqual(mockUser);
      expect(signUpMock).toHaveBeenCalledWith(signUpData);
      expect(mockMetricsService.trackGrpcCall).toHaveBeenCalledWith('user-microservice', 'signUp');
      expect(mockMetricsService.trackAuthAttempt).toHaveBeenCalledWith('signup');
    });
  });

  describe('resendConfirmationEmail', () => {
    it('should call authService.resendConfirmationEmail with correct email', async () => {
      const email = 'test@example.com';

      const result = await firstValueFrom(service.resendConfirmationEmail(email));

      expect(result).toEqual(mockStatusResponse);
      expect(resendConfirmationEmailMock).toHaveBeenCalledWith({ email });
      expect(mockMetricsService.trackGrpcCall).toHaveBeenCalledWith('user-microservice', 'resendConfirmationEmail');
    });
  });

  describe('verifyEmail', () => {
    it('should call authService.verifyEmail with correct token', async () => {
      const token = 'verification-token';

      const result = await firstValueFrom(service.verifyEmail(token));

      expect(result).toEqual(mockAuthResponse);
      expect(verifyEmailMock).toHaveBeenCalledWith({ token });
      expect(mockMetricsService.trackGrpcCall).toHaveBeenCalledWith('user-microservice', 'verifyEmail');
      expect(mockMetricsService.trackAuthAttempt).toHaveBeenCalledWith('verify_email');
    });
  });

  describe('signIn', () => {
    it('should call authService.signIn with correct data', async () => {
      const signInData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await firstValueFrom(service.signIn(signInData));

      expect(result).toEqual(mockAuthResponse);
      expect(signInMock).toHaveBeenCalledWith(signInData);
      expect(mockMetricsService.trackGrpcCall).toHaveBeenCalledWith('user-microservice', 'signIn');
      expect(mockMetricsService.trackAuthAttempt).toHaveBeenCalledWith('signin');
    });
  });

  describe('refreshTokens', () => {
    it('should call authService.refreshTokens with correct token', async () => {
      const refreshToken = 'refresh-token';

      const result = await firstValueFrom(service.refreshTokens(refreshToken));

      expect(result).toEqual(mockRefreshTokensResponse);
      expect(refreshTokensMock).toHaveBeenCalledWith({ token: refreshToken });
      expect(mockMetricsService.trackGrpcCall).toHaveBeenCalledWith('user-microservice', 'refreshTokens');
      expect(mockMetricsService.trackAuthAttempt).toHaveBeenCalledWith('refresh_tokens');
    });
  });

  describe('initResetPassword', () => {
    it('should call authService.initResetPassword with correct email', async () => {
      const email = 'test@example.com';

      const result = await firstValueFrom(service.initResetPassword(email));

      expect(result).toEqual(mockStatusResponse);
      expect(initResetPasswordMock).toHaveBeenCalledWith({ email });
      expect(mockMetricsService.trackGrpcCall).toHaveBeenCalledWith('user-microservice', 'initResetPassword');
      expect(mockMetricsService.trackAuthAttempt).toHaveBeenCalledWith('reset_password');
    });
  });

  describe('resendResetPasswordEmail', () => {
    it('should call authService.resendResetPasswordEmail with correct email', async () => {
      const email = 'test@example.com';

      const result = await firstValueFrom(service.resendResetPasswordEmail(email));

      expect(result).toEqual(mockStatusResponse);
      expect(resendResetPasswordEmailMock).toHaveBeenCalledWith({ email });
      expect(mockMetricsService.trackGrpcCall).toHaveBeenCalledWith('user-microservice', 'resendResetPasswordEmail');
    });
  });

  describe('setNewPassword', () => {
    it('should call authService.setNewPassword with correct data', async () => {
      const token = 'reset-token';
      const password = 'new-password123';

      const result = await firstValueFrom(service.setNewPassword(token, password));

      expect(result).toEqual(mockStatusResponse);
      expect(setNewPasswordMock).toHaveBeenCalledWith({ token, password });
      expect(mockMetricsService.trackGrpcCall).toHaveBeenCalledWith('user-microservice', 'setNewPassword');
    });
  });

  describe('signOutOtherDevices', () => {
    it('should call authService.signOutOtherDevices with correct data', async () => {
      const userId = 'test-user-id';
      const currentSessionId = 'current-session-id';

      const result = await firstValueFrom(service.signOutOtherDevices(userId, currentSessionId));

      expect(result).toEqual(mockStatusResponse);
      expect(signOutOtherDevicesMock).toHaveBeenCalledWith({ userId, currentSessionId });
      expect(mockMetricsService.trackGrpcCall).toHaveBeenCalledWith('user-microservice', 'signOutOtherDevices');
    });
  });

  describe('signOutAllDevices', () => {
    it('should call authService.signOutAllDevices with correct data', async () => {
      const id = 'test-user-id';

      const result = await firstValueFrom(service.signOutAllDevices(id));

      expect(result).toEqual(mockStatusResponse);
      expect(signOutAllDevicesMock).toHaveBeenCalledWith({ id });
      expect(mockMetricsService.trackGrpcCall).toHaveBeenCalledWith('user-microservice', 'signOutAllDevices');
    });
  });
});

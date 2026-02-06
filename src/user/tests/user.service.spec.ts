import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { firstValueFrom, of } from 'rxjs';

import { UserService } from '../user.service';
import {
  UserRole,
  type User,
  type StatusResponse,
  type AllUsersResponse,
  type GetBannedUsersResponse,
  type BanDetailsResponse,
} from 'src/generated-types/user';
import { MetricsService } from 'src/supervision/metrics/metrics.service';

describe('UserService', () => {
  let service: UserService;

  const mockUser: User = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    phoneNumber: '+1234567890',
    role: UserRole.USER,
    avatarUrl: 'https://example.com/avatar.jpg',
    passwordHash: 'hashed-password',
    isEmailVerified: true,
    lastLogin: new Date(),
    isBanned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockStatusResponse: StatusResponse = {
    success: true,
    message: 'Operation successful',
  };

  const mockAllUsersResponse: AllUsersResponse = {
    users: [mockUser],
    meta: {
      page: 1,
      limit: 10,
      totalItems: 1,
      totalPages: 1,
    },
  };

  const mockBannedUsersResponse: GetBannedUsersResponse = {
    users: [],
  };

  const mockBanDetailsResponse: BanDetailsResponse = {
    banDetails: [],
  };

  const getUserByIdMock = jest.fn();
  const getAllUsersMock = jest.fn();
  const updateUserMock = jest.fn();
  const deleteUserMock = jest.fn();
  const confirmPasswordMock = jest.fn();
  const changePasswordMock = jest.fn();
  const banUserMock = jest.fn();
  const unbanUserMock = jest.fn();
  const getBannedUsersMock = jest.fn();
  const getBanDetailsByUserIdMock = jest.fn();
  const changeUserRoleMock = jest.fn();

  const passthrough =
    <T>() =>
    (source: import('rxjs').Observable<T>) =>
      source;

  const mockMetricsService = {
    trackGrpcCall: jest.fn().mockReturnValue(passthrough()),
  };

  beforeEach(async () => {
    getUserByIdMock.mockReturnValue(of(mockUser));
    getAllUsersMock.mockReturnValue(of(mockAllUsersResponse));
    updateUserMock.mockReturnValue(of(mockUser));
    deleteUserMock.mockReturnValue(of(mockStatusResponse));
    confirmPasswordMock.mockReturnValue(of(mockStatusResponse));
    changePasswordMock.mockReturnValue(of(mockStatusResponse));
    banUserMock.mockReturnValue(of({ ...mockUser, isBanned: true }));
    unbanUserMock.mockReturnValue(of(mockUser));
    getBannedUsersMock.mockReturnValue(of(mockBannedUsersResponse));
    getBanDetailsByUserIdMock.mockReturnValue(of(mockBanDetailsResponse));
    changeUserRoleMock.mockReturnValue(of({ ...mockUser, role: UserRole.ADMIN }));

    const mockUserServiceClient = {
      getUserById: getUserByIdMock,
      getAllUsers: getAllUsersMock,
      updateUser: updateUserMock,
      deleteUser: deleteUserMock,
      confirmPassword: confirmPasswordMock,
      changePassword: changePasswordMock,
      banUser: banUserMock,
      unbanUser: unbanUserMock,
      getBannedUsers: getBannedUsersMock,
      getBanDetailsByUserId: getBanDetailsByUserIdMock,
      changeUserRole: changeUserRoleMock,
    };

    const mockGrpcClient = {
      getService: jest.fn().mockReturnValue(mockUserServiceClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'USER_CLIENT',
          useValue: mockGrpcClient,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserById', () => {
    it('should return user when id matches currentUserId', async () => {
      const id = 'test-user-id';

      const result = await firstValueFrom(service.getUserById(id, id));

      expect(result).toEqual(mockUser);
      expect(getUserByIdMock).toHaveBeenCalledWith({ id });
    });

    it('should throw BadRequestException when id does not match currentUserId', () => {
      const id = 'test-user-id';
      const currentUserId = 'different-user-id';

      expect(() => service.getUserById(id, currentUserId)).toThrow(BadRequestException);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users with pagination', async () => {
      const paginationData = { page: 1, limit: 10, totalItems: 0, totalPages: 0 };

      const result = await firstValueFrom(service.getAllUsers(paginationData));

      expect(result).toEqual(mockAllUsersResponse);
      expect(getAllUsersMock).toHaveBeenCalledWith(paginationData);
    });
  });

  describe('updateUser', () => {
    it('should update user with valid data', async () => {
      const updateData = {
        id: 'test-user-id',
        name: 'Updated Name',
      };

      const result = await firstValueFrom(service.updateUser(updateData));

      expect(result).toEqual(mockUser);
      expect(updateUserMock).toHaveBeenCalledWith(updateData);
    });

    it('should throw BadRequestException when no update fields provided', () => {
      const updateData = {
        id: 'test-user-id',
      };

      expect(() => service.updateUser(updateData)).toThrow(BadRequestException);
    });
  });

  describe('deleteUser', () => {
    it('should delete user by id', async () => {
      const id = 'test-user-id';

      const result = await firstValueFrom(service.deleteUser(id));

      expect(result).toEqual(mockStatusResponse);
      expect(deleteUserMock).toHaveBeenCalledWith({ id });
    });
  });

  describe('confirmPassword', () => {
    it('should confirm password', async () => {
      const passwordData = { id: 'test-user-id', password: 'password123' };

      const result = await firstValueFrom(service.confirmPassword(passwordData));

      expect(result).toEqual(mockStatusResponse);
      expect(confirmPasswordMock).toHaveBeenCalledWith(passwordData);
    });
  });

  describe('changePassword', () => {
    it('should change password', async () => {
      const passwordData = { id: 'test-user-id', password: 'newpassword123' };

      const result = await firstValueFrom(service.changePassword(passwordData));

      expect(result).toEqual(mockStatusResponse);
      expect(changePasswordMock).toHaveBeenCalledWith(passwordData);
    });
  });

  describe('banUser', () => {
    it('should ban user', async () => {
      const banData = { id: 'test-user-id', bannedBy: 'admin-id', reason: 'Violation' };

      const result = await firstValueFrom(service.banUser(banData));

      expect(result.isBanned).toBe(true);
      expect(banUserMock).toHaveBeenCalledWith(banData);
    });
  });

  describe('unbanUser', () => {
    it('should unban user', async () => {
      const unbanData = { id: 'test-user-id', bannedBy: 'admin-id' };

      const result = await firstValueFrom(service.unbanUser(unbanData));

      expect(result.isBanned).toBe(false);
      expect(unbanUserMock).toHaveBeenCalledWith(unbanData);
    });
  });

  describe('getBannedUsers', () => {
    it('should return all banned users', async () => {
      const result = await firstValueFrom(service.getBannedUsers());

      expect(result).toEqual(mockBannedUsersResponse);
      expect(getBannedUsersMock).toHaveBeenCalledWith({});
    });
  });

  describe('getBanDetailsByUserId', () => {
    it('should return ban details for user', async () => {
      const id = 'test-user-id';

      const result = await firstValueFrom(service.getBanDetailsByUserId(id));

      expect(result).toEqual(mockBanDetailsResponse);
      expect(getBanDetailsByUserIdMock).toHaveBeenCalledWith({ id });
    });
  });

  describe('changeUserRole', () => {
    it('should change user role', async () => {
      const roleData = { id: 'test-user-id', role: UserRole.ADMIN };

      const result = await firstValueFrom(service.changeUserRole(roleData));

      expect(result.role).toBe(UserRole.ADMIN);
      expect(changeUserRoleMock).toHaveBeenCalledWith(roleData);
    });
  });
});

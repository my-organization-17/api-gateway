import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom, of } from 'rxjs';

import { AdminController } from '../admin.controller';
import { UserService } from '../user.service';
import {
  UserRole,
  type User,
  type AllUsersResponse,
  type BanDetailsResponse,
  type GetBannedUsersResponse,
  type PaginationMeta,
} from 'src/generated-types/user';

describe('AdminController', () => {
  let controller: AdminController;

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

  const mockBannedUser: User = {
    ...mockUser,
    id: 'banned-user-id',
    isBanned: true,
  };

  const mockPaginationMeta: PaginationMeta = {
    page: 1,
    limit: 10,
    totalItems: 1,
    totalPages: 1,
  };

  const mockAllUsersResponse: AllUsersResponse = {
    users: [mockUser],
    meta: mockPaginationMeta,
  };

  const mockGetBannedUsersResponse: GetBannedUsersResponse = {
    users: [mockBannedUser],
  };

  const mockBanDetailsResponse: BanDetailsResponse = {
    banDetails: [
      {
        id: 'ban-detail-id',
        userId: 'test-user-id',
        isBanned: true,
        bannedBy: 'admin-id',
        banReason: 'Violation of terms',
        banUntil: new Date(),
        createdAt: new Date(),
      },
    ],
  };

  const getUserByIdMock = jest.fn();
  const getAllUsersMock = jest.fn();
  const banUserMock = jest.fn();
  const unbanUserMock = jest.fn();
  const changeUserRoleMock = jest.fn();
  const getBannedUsersMock = jest.fn();
  const getBanDetailsByUserIdMock = jest.fn();

  beforeEach(async () => {
    getUserByIdMock.mockReturnValue(of(mockUser));
    getAllUsersMock.mockReturnValue(of(mockAllUsersResponse));
    banUserMock.mockReturnValue(of(mockBannedUser));
    unbanUserMock.mockReturnValue(of(mockUser));
    changeUserRoleMock.mockReturnValue(of(mockUser));
    getBannedUsersMock.mockReturnValue(of(mockGetBannedUsersResponse));
    getBanDetailsByUserIdMock.mockReturnValue(of(mockBanDetailsResponse));

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUserById: getUserByIdMock,
            getAllUsers: getAllUsersMock,
            banUser: banUserMock,
            unbanUser: unbanUserMock,
            changeUserRole: changeUserRoleMock,
            getBannedUsers: getBannedUsersMock,
            getBanDetailsByUserId: getBanDetailsByUserIdMock,
          },
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const userId = 'test-user-id';
      const adminId = 'admin-id';

      const result = await firstValueFrom(controller.getUserById(userId, adminId));

      expect(result).toEqual(mockUser);
      expect(getUserByIdMock).toHaveBeenCalledWith(userId, userId);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users with pagination', async () => {
      const query: PaginationMeta = { page: 1, limit: 10, totalItems: 0, totalPages: 0 };
      const adminId = 'admin-id';

      const result = await firstValueFrom(controller.getAllUsers(query, adminId));

      expect(result).toEqual(mockAllUsersResponse);
      expect(getAllUsersMock).toHaveBeenCalledWith(query);
    });
  });

  describe('banUser', () => {
    it('should ban a user with correct details', async () => {
      const adminId = 'admin-id';
      const banDetails = {
        id: 'test-user-id',
        reason: 'Violation of terms',
        banUntil: new Date(),
      };

      const result = await firstValueFrom(controller.banUser(adminId, banDetails));

      expect(result).toEqual(mockBannedUser);
      expect(banUserMock).toHaveBeenCalledWith({ bannedBy: adminId, ...banDetails });
    });

    it('should ban a user without optional fields', async () => {
      const adminId = 'admin-id';
      const banDetails = {
        id: 'test-user-id',
      };

      await firstValueFrom(controller.banUser(adminId, banDetails));

      expect(banUserMock).toHaveBeenCalledWith({ bannedBy: adminId, ...banDetails });
    });
  });

  describe('unbanUser', () => {
    it('should unban a user', async () => {
      const adminId = 'admin-id';
      const unbanDetails = {
        id: 'banned-user-id',
      };

      const result = await firstValueFrom(controller.unbanUser(adminId, unbanDetails));

      expect(result).toEqual(mockUser);
      expect(unbanUserMock).toHaveBeenCalledWith({ bannedBy: adminId, ...unbanDetails });
    });
  });

  describe('changeUserRole', () => {
    it('should change user role', async () => {
      const userId = 'test-user-id';
      const adminId = 'admin-id';
      const roleDetails = { role: UserRole.MODERATOR };

      const result = await firstValueFrom(controller.changeUserRole(userId, adminId, roleDetails));

      expect(result).toEqual(mockUser);
      expect(changeUserRoleMock).toHaveBeenCalledWith({ id: userId, role: roleDetails.role });
    });

    it('should change user role to admin', async () => {
      const userId = 'test-user-id';
      const adminId = 'admin-id';
      const roleDetails = { role: UserRole.ADMIN };

      await firstValueFrom(controller.changeUserRole(userId, adminId, roleDetails));

      expect(changeUserRoleMock).toHaveBeenCalledWith({ id: userId, role: UserRole.ADMIN });
    });
  });

  describe('getBannedUsers', () => {
    it('should return all banned users', async () => {
      const adminId = 'admin-id';

      const result = await firstValueFrom(controller.getBannedUsers(adminId));

      expect(result).toEqual([mockBannedUser]);
      expect(getBannedUsersMock).toHaveBeenCalled();
    });

    it('should return empty array when no banned users', async () => {
      const adminId = 'admin-id';
      getBannedUsersMock.mockReturnValue(of({ users: [] }));

      const result = await firstValueFrom(controller.getBannedUsers(adminId));

      expect(result).toEqual([]);
    });
  });

  describe('getBanDetailsByUserId', () => {
    it('should return ban details for a user', async () => {
      const userId = 'test-user-id';
      const adminId = 'admin-id';

      const result = await firstValueFrom(controller.getBanDetailsByUserId(userId, adminId));

      expect(result).toEqual(mockBanDetailsResponse);
      expect(getBanDetailsByUserIdMock).toHaveBeenCalledWith(userId);
    });
  });
});

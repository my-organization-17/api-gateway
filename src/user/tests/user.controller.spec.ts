import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom, of } from 'rxjs';

import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { UserRole, type User, type StatusResponse } from 'src/generated-types/user';

describe('UserController', () => {
  let controller: UserController;

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

  const getUserByIdMock = jest.fn();
  const updateUserMock = jest.fn();
  const deleteUserMock = jest.fn();
  const confirmPasswordMock = jest.fn();
  const changePasswordMock = jest.fn();

  beforeEach(async () => {
    getUserByIdMock.mockReturnValue(of(mockUser));
    updateUserMock.mockReturnValue(of(mockUser));
    deleteUserMock.mockReturnValue(of(mockStatusResponse));
    confirmPasswordMock.mockReturnValue(of(mockStatusResponse));
    changePasswordMock.mockReturnValue(of(mockStatusResponse));

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUserById: getUserByIdMock,
            updateUser: updateUserMock,
            deleteUser: deleteUserMock,
            confirmPassword: confirmPasswordMock,
            changePassword: changePasswordMock,
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return current user profile', async () => {
      const userId = 'test-user-id';

      const result = await firstValueFrom(controller.getProfile(userId));

      expect(result).toEqual(mockUser);
      expect(getUserByIdMock).toHaveBeenCalledWith(userId, userId);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const id = 'test-user-id';
      const currentUserId = 'test-user-id';

      const result = await firstValueFrom(controller.getUserById(id, currentUserId));

      expect(result).toEqual(mockUser);
      expect(getUserByIdMock).toHaveBeenCalledWith(id, currentUserId);
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      const userId = 'test-user-id';
      const updateData = {
        name: 'Updated Name',
        phoneNumber: '+9876543210',
        avatarUrl: 'https://example.com/new-avatar.jpg',
      };

      const result = await firstValueFrom(controller.updateUser(userId, updateData));

      expect(result).toEqual(mockUser);
      expect(updateUserMock).toHaveBeenCalledWith({ id: userId, ...updateData });
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      const userId = 'test-user-id';

      const result = await firstValueFrom(controller.deleteUser(userId));

      expect(result).toEqual(mockStatusResponse);
      expect(deleteUserMock).toHaveBeenCalledWith(userId);
    });
  });

  describe('confirmPassword', () => {
    it('should confirm password', async () => {
      const userId = 'test-user-id';
      const passwordData = { password: 'password123' };

      const result = await firstValueFrom(controller.confirmPassword(userId, passwordData));

      expect(result).toEqual(mockStatusResponse);
      expect(confirmPasswordMock).toHaveBeenCalledWith({ id: userId, ...passwordData });
    });
  });

  describe('changePassword', () => {
    it('should change password', async () => {
      const userId = 'test-user-id';
      const passwordData = { password: 'newpassword123' };

      const result = await firstValueFrom(controller.changePassword(userId, passwordData));

      expect(result).toEqual(mockStatusResponse);
      expect(changePasswordMock).toHaveBeenCalledWith({ id: userId, ...passwordData });
    });
  });
});

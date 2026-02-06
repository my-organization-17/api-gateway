import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { of, throwError } from 'rxjs';

import { MediaService } from '../media.service';
import { MetricsService } from 'src/supervision/metrics/metrics.service';

describe('MediaService', () => {
  let service: MediaService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    avatarUrl: 'avatar-key-123.jpg',
  };

  const mockUserWithoutAvatar = {
    id: 'user-456',
    email: 'test2@example.com',
    avatarUrl: '',
  };

  const mockFileUrl = { fileUrl: 'https://example.com/avatar/avatar-key-123.jpg' };

  const getImageUrlMock = jest.fn();
  const uploadAvatarMock = jest.fn();
  const deleteAvatarMock = jest.fn();
  const getUserByIdMock = jest.fn();
  const updateUserMock = jest.fn();

  const passthrough =
    <T>() =>
    (source: import('rxjs').Observable<T>) =>
      source;

  const mockMetricsService = {
    trackGrpcCall: jest.fn().mockReturnValue(passthrough()),
  };

  beforeEach(async () => {
    getImageUrlMock.mockReturnValue(of(mockFileUrl));
    uploadAvatarMock.mockReturnValue(of(mockFileUrl));
    deleteAvatarMock.mockReturnValue(of({ success: true }));
    getUserByIdMock.mockReturnValue(of(mockUser));
    updateUserMock.mockReturnValue(of({ ...mockUser, avatarUrl: mockFileUrl.fileUrl }));

    const mockMediaService = {
      getImageUrl: getImageUrlMock,
      uploadAvatar: uploadAvatarMock,
      deleteAvatar: deleteAvatarMock,
    };

    const mockUserService = {
      getUserById: getUserByIdMock,
      updateUser: updateUserMock,
    };

    const mockMediaClient = {
      getService: jest.fn().mockReturnValue(mockMediaService),
    };

    const mockUserClient = {
      getService: jest.fn().mockReturnValue(mockUserService),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: 'MEDIA_CLIENT',
          useValue: mockMediaClient,
        },
        {
          provide: 'USER_CLIENT',
          useValue: mockUserClient,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getImageUrl', () => {
    it('should return image URL when user exists and has avatar', async () => {
      const result = await service.getImageUrl('user-123');

      expect(getUserByIdMock).toHaveBeenCalledWith({ id: 'user-123' });
      expect(getImageUrlMock).toHaveBeenCalledWith({ fileKey: 'avatar/' + mockUser.avatarUrl });
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when user not found', async () => {
      getUserByIdMock.mockReturnValue(of(null));

      await expect(service.getImageUrl('non-existent')).rejects.toThrow(BadRequestException);
      await expect(service.getImageUrl('non-existent')).rejects.toThrow('User not found');
    });

    it('should throw BadRequestException when user has no avatar', async () => {
      getUserByIdMock.mockReturnValue(of(mockUserWithoutAvatar));

      await expect(service.getImageUrl('user-456')).rejects.toThrow(BadRequestException);
      await expect(service.getImageUrl('user-456')).rejects.toThrow('User does not have an avatar');
    });

    it('should rethrow error when service call fails', async () => {
      getUserByIdMock.mockReturnValue(throwError(() => new Error('Connection failed')));

      await expect(service.getImageUrl('user-123')).rejects.toThrow('Connection failed');
    });
  });

  describe('uploadAvatar', () => {
    const uploadRequest = {
      id: 'user-123',
      buffer: new Uint8Array([1, 2, 3, 4]),
      fieldName: 'avatar',
      originalName: 'avatar.jpg',
      mimeType: 'image/jpeg',
      size: 4,
    };

    it('should upload avatar successfully when user exists without existing avatar', async () => {
      getUserByIdMock.mockReturnValue(of(mockUserWithoutAvatar));

      const result = await service.uploadAvatar({ ...uploadRequest, id: 'user-456' });

      expect(getUserByIdMock).toHaveBeenCalledWith({ id: 'user-456' });
      expect(deleteAvatarMock).not.toHaveBeenCalled();
      expect(uploadAvatarMock).toHaveBeenCalledWith({ ...uploadRequest, id: 'user-456' });
      expect(updateUserMock).toHaveBeenCalledWith({ id: 'user-456', avatarUrl: mockFileUrl.fileUrl });
      expect(result).toEqual(mockFileUrl);
    });

    it('should delete old avatar and upload new one when user already has avatar', async () => {
      const result = await service.uploadAvatar(uploadRequest);

      expect(getUserByIdMock).toHaveBeenCalledWith({ id: 'user-123' });
      expect(deleteAvatarMock).toHaveBeenCalledWith({ fileKey: 'avatar/' + mockUser.avatarUrl });
      expect(uploadAvatarMock).toHaveBeenCalledWith(uploadRequest);
      expect(updateUserMock).toHaveBeenCalledWith({ id: 'user-123', avatarUrl: mockFileUrl.fileUrl });
      expect(result).toEqual(mockFileUrl);
    });

    it('should throw BadRequestException when user not found', async () => {
      getUserByIdMock.mockReturnValue(of(null));

      await expect(service.uploadAvatar(uploadRequest)).rejects.toThrow(BadRequestException);
      await expect(service.uploadAvatar(uploadRequest)).rejects.toThrow('User not found');
    });

    it('should throw ServiceUnavailableException when upload returns no fileUrl', async () => {
      uploadAvatarMock.mockReturnValue(of(null));

      await expect(service.uploadAvatar(uploadRequest)).rejects.toThrow(ServiceUnavailableException);
      await expect(service.uploadAvatar(uploadRequest)).rejects.toThrow(
        'Failed to upload avatar, no file URL returned',
      );
    });

    it('should throw ServiceUnavailableException when upload returns empty fileUrl', async () => {
      uploadAvatarMock.mockReturnValue(of({ fileUrl: '' }));

      await expect(service.uploadAvatar(uploadRequest)).rejects.toThrow(ServiceUnavailableException);
    });

    it('should rethrow error when service call fails', async () => {
      getUserByIdMock.mockReturnValue(throwError(() => new Error('Connection failed')));

      await expect(service.uploadAvatar(uploadRequest)).rejects.toThrow('Connection failed');
    });
  });

  describe('removeAvatar', () => {
    it('should remove avatar successfully when user exists and has avatar', async () => {
      const result = await service.removeAvatar('user-123');

      expect(getUserByIdMock).toHaveBeenCalledWith({ id: 'user-123' });
      expect(deleteAvatarMock).toHaveBeenCalledWith({ fileKey: 'avatar/' + mockUser.avatarUrl });
      expect(updateUserMock).toHaveBeenCalledWith({ id: 'user-123', avatarUrl: '' });
      expect(result).toEqual({
        success: true,
        message: 'Avatar removed successfully',
      });
    });

    it('should throw BadRequestException when user not found', async () => {
      getUserByIdMock.mockReturnValue(of(null));

      await expect(service.removeAvatar('non-existent')).rejects.toThrow(BadRequestException);
      await expect(service.removeAvatar('non-existent')).rejects.toThrow('User not found');
    });

    it('should throw BadRequestException when user has no avatar to remove', async () => {
      getUserByIdMock.mockReturnValue(of(mockUserWithoutAvatar));

      await expect(service.removeAvatar('user-456')).rejects.toThrow(BadRequestException);
      await expect(service.removeAvatar('user-456')).rejects.toThrow('User does not have an avatar to remove');
    });

    it('should rethrow error when service call fails', async () => {
      getUserByIdMock.mockReturnValue(throwError(() => new Error('Connection failed')));

      await expect(service.removeAvatar('user-123')).rejects.toThrow('Connection failed');
    });
  });
});

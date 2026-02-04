import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';

import { MediaController } from '../media.controller';
import { MediaService } from '../media.service';

describe('MediaController', () => {
  let controller: MediaController;

  const mockFileUrl = { fileUrl: 'https://example.com/avatar/avatar-key-123.jpg' };
  const mockStatusResponse = { success: true, message: 'Avatar removed successfully' };

  const getImageUrlMock = jest.fn();
  const uploadAvatarMock = jest.fn();
  const removeAvatarMock = jest.fn();

  beforeEach(async () => {
    getImageUrlMock.mockResolvedValue(of(mockFileUrl));
    uploadAvatarMock.mockResolvedValue(mockFileUrl);
    removeAvatarMock.mockResolvedValue(mockStatusResponse);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        {
          provide: MediaService,
          useValue: {
            getImageUrl: getImageUrlMock,
            uploadAvatar: uploadAvatarMock,
            removeAvatar: removeAvatarMock,
          },
        },
      ],
    }).compile();

    controller = module.get<MediaController>(MediaController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getImageUrl', () => {
    it('should return image URL for authenticated user', async () => {
      const result = await controller.getImageUrl('user-123');

      expect(getImageUrlMock).toHaveBeenCalledWith('user-123');
      expect(result).toBeDefined();
    });
  });

  describe('uploadAvatar', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'avatar',
      originalname: 'avatar.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test'),
      size: 4,
      destination: '',
      filename: '',
      path: '',
      stream: null as never,
    };

    it('should upload avatar for authenticated user', async () => {
      const result = await controller.uploadAvatar(mockFile, 'user-123');

      expect(uploadAvatarMock).toHaveBeenCalledWith({
        id: 'user-123',
        fieldName: mockFile.fieldname,
        originalName: mockFile.originalname,
        mimeType: mockFile.mimetype,
        buffer: mockFile.buffer,
        size: mockFile.size,
      });
      expect(result).toEqual(mockFileUrl);
    });
  });

  describe('removeAvatar', () => {
    it('should remove avatar for authenticated user', async () => {
      const result = await controller.removeAvatar('user-123');

      expect(removeAvatarMock).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockStatusResponse);
    });
  });
});

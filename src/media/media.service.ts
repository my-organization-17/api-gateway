import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

import {
  MEDIA_SERVICE_NAME,
  type FileUrl,
  type MediaServiceClient,
  type StatusResponse,
  type UploadAvatarRequest,
} from 'src/generated-types/media';
import type { UserServiceClient } from 'src/generated-types/user';

@Injectable()
export class MediaService implements OnModuleInit {
  private mediaService: MediaServiceClient;
  private userService: UserServiceClient;

  constructor(
    @Inject('MEDIA_CLIENT') private readonly mediaClient: ClientGrpc,
    @Inject('USER_CLIENT') private readonly userClient: ClientGrpc,
  ) {}

  protected readonly logger = new Logger(MediaService.name);

  onModuleInit() {
    this.mediaService = this.mediaClient.getService<MediaServiceClient>(MEDIA_SERVICE_NAME);
    this.userService = this.userClient.getService<UserServiceClient>('UserService');
  }

  async getImageUrl(userId: string): Promise<Observable<FileUrl>> {
    this.logger.log(`Fetching image URL for user ID: ${userId}`);
    try {
      const user = await firstValueFrom(this.userService.getUserById({ id: userId }));
      if (!user) {
        this.logger.warn(`User with ID ${userId} not found`);
        throw new BadRequestException('User not found');
      }
      if (!user.avatarUrl) {
        this.logger.warn(`User with ID ${userId} does not have an avatar`);
        throw new BadRequestException('User does not have an avatar');
      }
      return this.mediaService.getImageUrl({ fileKey: 'avatar/' + user.avatarUrl });
    } catch (error) {
      this.logger.error(`Failed to fetch image URL: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }

  async uploadAvatar(data: UploadAvatarRequest): Promise<FileUrl> {
    this.logger.log(`Uploading avatar for user ID: ${data.id}`);
    try {
      const user = await firstValueFrom(this.userService.getUserById({ id: data.id }));
      if (!user) {
        this.logger.warn(`User with ID ${data.id} not found`);
        throw new BadRequestException('User not found');
      }
      if (user.avatarUrl) {
        this.logger.log(`User with ID ${data.id} already has an avatar, removing old avatar`);
        await firstValueFrom(this.mediaService.deleteAvatar({ fileKey: 'avatar/' + user.avatarUrl }));
      }
      const fileKey = await firstValueFrom(this.mediaService.uploadAvatar(data));
      if (!fileKey || !fileKey.fileUrl) {
        throw new ServiceUnavailableException('Failed to upload avatar, no file URL returned');
      }
      await firstValueFrom(this.userService.updateUser({ id: data.id, avatarUrl: fileKey.fileUrl }));
      return fileKey;
    } catch (error) {
      this.logger.error(`Failed to upload avatar: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }

  async removeAvatar(userId: string): Promise<StatusResponse> {
    this.logger.log(`Removing avatar for user ID: ${userId}`);
    try {
      const user = await firstValueFrom(this.userService.getUserById({ id: userId }));
      if (!user) {
        this.logger.warn(`User with ID ${userId} not found`);
        throw new BadRequestException('User not found');
      }
      if (!user.avatarUrl) {
        this.logger.warn(`User with ID ${userId} does not have an avatar to remove`);
        throw new BadRequestException('User does not have an avatar to remove');
      }
      await firstValueFrom(this.mediaService.deleteAvatar({ fileKey: 'avatar/' + user.avatarUrl }));
      await firstValueFrom(this.userService.updateUser({ id: userId, avatarUrl: '' }));

      this.logger.log(`Successfully removed avatar for user ID: ${userId}`);
      return {
        success: true,
        message: 'Avatar removed successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to remove avatar: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }
}

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
import { MetricsService } from 'src/supervision/metrics/metrics.service';

const USER_SERVICE = 'user-microservice';
const MEDIA_SERVICE = 'media-microservice';

@Injectable()
export class MediaService implements OnModuleInit {
  private mediaService: MediaServiceClient;
  private userService: UserServiceClient;
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @Inject('MEDIA_CLIENT') private readonly mediaClient: ClientGrpc,
    @Inject('USER_CLIENT') private readonly userClient: ClientGrpc,
    private readonly metricsService: MetricsService,
  ) {}

  onModuleInit() {
    this.mediaService = this.mediaClient.getService<MediaServiceClient>(MEDIA_SERVICE_NAME);
    this.userService = this.userClient.getService<UserServiceClient>('UserService');
  }

  async getImageUrl(userId: string): Promise<Observable<FileUrl>> {
    this.logger.log(`Fetching image URL for user ID: ${userId}`);
    const user = await firstValueFrom(
      this.userService.getUserById({ id: userId }).pipe(this.metricsService.trackGrpcCall(USER_SERVICE, 'getUserById')),
    );
    if (!user) {
      this.logger.warn(`User with ID ${userId} not found`);
      throw new BadRequestException('User not found');
    }
    if (!user.avatarUrl) {
      this.logger.warn(`User with ID ${userId} does not have an avatar`);
      throw new BadRequestException('User does not have an avatar');
    }
    return this.mediaService
      .getImageUrl({ fileKey: 'avatar/' + user.avatarUrl })
      .pipe(this.metricsService.trackGrpcCall(MEDIA_SERVICE, 'getImageUrl'));
  }

  async uploadAvatar(data: UploadAvatarRequest): Promise<FileUrl> {
    this.logger.log(`Uploading avatar for user ID: ${data.id}`);
    const user = await firstValueFrom(
      this.userService
        .getUserById({ id: data.id })
        .pipe(this.metricsService.trackGrpcCall(USER_SERVICE, 'getUserById')),
    );
    if (!user) {
      this.logger.warn(`User with ID ${data.id} not found`);
      throw new BadRequestException('User not found');
    }
    if (user.avatarUrl) {
      this.logger.log(`User with ID ${data.id} already has an avatar, removing old avatar`);
      await firstValueFrom(
        this.mediaService
          .deleteAvatar({ fileKey: 'avatar/' + user.avatarUrl })
          .pipe(this.metricsService.trackGrpcCall(MEDIA_SERVICE, 'deleteAvatar')),
      );
    }
    const fileKey = await firstValueFrom(
      this.mediaService.uploadAvatar(data).pipe(this.metricsService.trackGrpcCall(MEDIA_SERVICE, 'uploadAvatar')),
    );
    if (!fileKey || !fileKey.fileUrl) {
      throw new ServiceUnavailableException('Failed to upload avatar, no file URL returned');
    }
    await firstValueFrom(
      this.userService
        .updateUser({ id: data.id, avatarUrl: fileKey.fileUrl })
        .pipe(this.metricsService.trackGrpcCall(USER_SERVICE, 'updateUser')),
    );
    return fileKey;
  }

  async removeAvatar(userId: string): Promise<StatusResponse> {
    this.logger.log(`Removing avatar for user ID: ${userId}`);
    const user = await firstValueFrom(
      this.userService.getUserById({ id: userId }).pipe(this.metricsService.trackGrpcCall(USER_SERVICE, 'getUserById')),
    );
    if (!user) {
      this.logger.warn(`User with ID ${userId} not found`);
      throw new BadRequestException('User not found');
    }
    if (!user.avatarUrl) {
      this.logger.warn(`User with ID ${userId} does not have an avatar to remove`);
      throw new BadRequestException('User does not have an avatar to remove');
    }
    await firstValueFrom(
      this.mediaService
        .deleteAvatar({ fileKey: 'avatar/' + user.avatarUrl })
        .pipe(this.metricsService.trackGrpcCall(MEDIA_SERVICE, 'deleteAvatar')),
    );
    await firstValueFrom(
      this.userService
        .updateUser({ id: userId, avatarUrl: '' })
        .pipe(this.metricsService.trackGrpcCall(USER_SERVICE, 'updateUser')),
    );

    this.logger.log(`Successfully removed avatar for user ID: ${userId}`);
    return {
      success: true,
      message: 'Avatar removed successfully',
    };
  }
}

import {
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserId } from 'src/auth/decorators/user-id.decorator';
import { Protected } from 'src/auth/decorators';
import { MediaService } from './media.service';

import type { FileUrl, StatusResponse } from 'src/generated-types/media';
import type { Observable } from 'rxjs';

@ApiTags('media')
@Protected()
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('avatar-url')
  @ApiOperation({
    summary: 'Get user avatar URL',
    description: 'Retrieves the avatar URL for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar URL retrieved successfully',
    type: Promise<Observable<FileUrl>>,
  })
  getImageUrl(@UserId() userId: string): Promise<Observable<FileUrl>> {
    return this.mediaService.getImageUrl(userId);
  }

  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({
    summary: 'Upload user avatar',
    description: 'Uploads an avatar image for the authenticated user',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar image file',
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Avatar uploaded successfully',
  })
  uploadAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024, errorMessage: 'File size should not exceed 1MB' }), // 1MB
          new FileTypeValidator({
            fileType: 'image/jpeg|image/png|image/gif|image/webp',
            errorMessage: 'Only image files (jpeg, png, gif, webp) are allowed',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @UserId() userId: string,
  ): Promise<FileUrl> {
    return this.mediaService.uploadAvatar({
      id: userId,
      fieldName: file.fieldname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      buffer: file.buffer,
      size: file.size,
    });
  }

  @Delete('remove-avatar')
  @ApiOperation({
    summary: 'Remove user avatar',
    description: 'Removes the avatar image for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar removed successfully',
  })
  removeAvatar(@UserId() userId: string): Promise<StatusResponse> {
    return this.mediaService.removeAvatar(userId);
  }
}

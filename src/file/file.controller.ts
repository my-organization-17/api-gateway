import {
  Controller,
  Delete,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserId } from 'src/auth/decorators/user-id.decorator';
import { Protected } from 'src/auth/decorators';
import { FileService } from './file.service';

@ApiTags('file')
@Protected()
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({
    summary: 'Upload user avatar',
    description: 'Uploads an avatar image for the authenticated user',
  })
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
  ) {
    this.fileService.uploadAvatar(file, userId);
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
  removeAvatar(@UserId() userId: string) {
    this.fileService.removeAvatar(userId);
  }
}

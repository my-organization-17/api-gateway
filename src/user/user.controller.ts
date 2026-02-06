import { Body, Controller, Delete, Get, Logger, Param, ParseUUIDPipe, Post, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { Protected, UserId } from 'src/auth/decorators';
import { PasswordRequestDto, UserResponseDto } from '../common/dto';
import { SerializeInterceptor } from '../utils/serialize.interceptor';
import { UserUpdateRequestDto } from './dto';
import { UserService } from './user.service';

import type { StatusResponse } from 'src/generated-types/user';

@ApiTags('user')
@Protected()
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService) {}

  // Get the profile of the currently authenticated user
  @UseInterceptors(new SerializeInterceptor(UserResponseDto))
  @Get('/me')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Retrieves the profile of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    type: UserResponseDto,
    description: 'Returns the profile of the currently authenticated user',
  })
  getProfile(@UserId() userId: string): Observable<UserResponseDto> {
    this.logger.log('Received request to get user profile');
    return this.userService.getUserById(userId, userId);
  }

  // Get a user by their unique ID
  @UseInterceptors(new SerializeInterceptor(UserResponseDto))
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves a user by their unique ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the user',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    type: UserResponseDto,
    description: 'Returns the user corresponding to the provided ID',
  })
  getUserById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserId() currentUserId: string,
  ): Observable<UserResponseDto> {
    this.logger.log(`Received request to get user by ID: ${id}`);
    return this.userService.getUserById(id, currentUserId);
  }

  // Update user
  @UseInterceptors(new SerializeInterceptor(UserResponseDto))
  @Post('/update')
  @ApiOperation({
    summary: 'Update user',
    description: 'Updates the details of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    type: UserResponseDto,
    description: 'Returns the updated user details',
  })
  updateUser(@UserId() userId: string, @Body() data: UserUpdateRequestDto): Observable<UserResponseDto> {
    this.logger.log(`Received request to update user with ID: ${userId}`);
    return this.userService.updateUser({ id: userId, ...data });
  }

  // Delete user
  @Delete('/delete')
  @ApiOperation({
    summary: 'Delete user',
    description: 'Deletes the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully deleted',
  })
  deleteUser(@UserId() userId: string): Observable<StatusResponse> {
    this.logger.log(`Received request to delete user with ID: ${userId}`);
    return this.userService.deleteUser(userId);
  }

  // Confirm password
  @Post('/confirm-password')
  @ApiOperation({
    summary: 'Confirm password',
    description: 'Confirms the password of the currently authenticated user',
  })
  @ApiBody({ type: PasswordRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Password successfully confirmed',
  })
  confirmPassword(@UserId() userId: string, @Body() data: PasswordRequestDto): Observable<StatusResponse> {
    this.logger.log(`Received request to confirm password for user ID: ${userId}`);
    return this.userService.confirmPassword({ id: userId, ...data });
  }

  // Change password
  @Post('/change-password')
  @ApiOperation({
    summary: 'Change password',
    description: 'Changes the password of the currently authenticated user',
  })
  @ApiBody({ type: PasswordRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Password successfully changed',
  })
  changePassword(@UserId() userId: string, @Body() data: PasswordRequestDto): Observable<StatusResponse> {
    this.logger.log(`Received request to change password for user ID: ${userId}`);
    return this.userService.changePassword({ id: userId, ...data });
  }
}

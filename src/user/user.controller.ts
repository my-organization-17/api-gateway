import { Controller, Get, Logger, Param, ParseUUIDPipe, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { Protected, UserId } from 'src/auth/decorators';
import { UserResponseDto } from '../common/dto/user.response.dto';
import { SerializeInterceptor } from '../utils/serialize.interceptor';
import { UserService } from './user.service';

@ApiTags('user')
@Protected()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  protected readonly logger = new Logger(UserController.name);

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
    return this.userService.getUserById(userId);
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
  getUserById(@Param('id', new ParseUUIDPipe()) id: string): Observable<UserResponseDto> {
    this.logger.log(`Received request to get user by ID: ${id}`);
    return this.userService.getUserById(id);
  }
}

import { Controller, Get, Logger, Param, ParseUUIDPipe, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { UserService } from './user.service';
import { UserResponseDto } from '../common/dto/user.response.dto';
import { SerializeInterceptor } from '../utils/serialize.interceptor';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  protected readonly logger = new Logger(UserController.name);

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

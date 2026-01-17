import { Body, Controller, Get, Logger, Param, ParseUUIDPipe, Post, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { Protected, UserId } from 'src/auth/decorators';
import { UserRole } from 'src/generated-types/user';
import { SerializeInterceptor } from '../utils/serialize.interceptor';
import { UserService } from './user.service';
import { AdminResponseDto } from './dto/admin.response.dto';

@ApiTags('admin')
@Protected(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly userService: UserService) {}
  protected readonly logger = new Logger(AdminController.name);

  // Get user by their unique ID
  @UseInterceptors(new SerializeInterceptor(AdminResponseDto))
  @Get('user/:id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Fetches a user by their unique ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the user',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    type: AdminResponseDto,
    description: 'Returns the user information',
  })
  getUserById(@Param('id', new ParseUUIDPipe()) id: string, @UserId() adminId: string): Observable<AdminResponseDto> {
    this.logger.log(`Admin ${adminId} requested info for user with ID: ${id}`);
    return this.userService.getUserById(id);
  }

  // Ban a user by their unique ID
  @UseInterceptors(new SerializeInterceptor(AdminResponseDto))
  @Post('ban/:id')
  @ApiOperation({
    summary: 'Ban user by ID',
    description: 'Bans a user by their unique ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the user to be banned',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    type: AdminResponseDto,
    description: 'Returns the banned user information',
  })
  banUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserId() adminId: string,
    @Body() banDetails: { reason?: string | null },
  ): Observable<AdminResponseDto> {
    this.logger.log(`Admin ${adminId} requested to ban user with ID: ${id}`);
    return this.userService.banUser({ id, reason: banDetails?.reason });
  }

  // Unban a user by their unique ID
  @UseInterceptors(new SerializeInterceptor(AdminResponseDto))
  @Post('unban/:id')
  @ApiOperation({
    summary: 'Unban user by ID',
    description: 'Unbans a user by their unique ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the user to be unbanned',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    type: AdminResponseDto,
    description: 'Returns the unbanned user information',
  })
  unbanUser(@Param('id', new ParseUUIDPipe()) id: string, @UserId() adminId: string): Observable<AdminResponseDto> {
    this.logger.log(`Admin ${adminId} requested to unban user with ID: ${id}`);
    return this.userService.unbanUser(id);
  }

  // Change a user's role by their unique ID
  @UseInterceptors(new SerializeInterceptor(AdminResponseDto))
  @Post('change-role/:id')
  @ApiOperation({
    summary: 'Change user role by ID',
    description: "Changes a user's role by their unique ID",
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the user whose role is to be changed',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    type: AdminResponseDto,
    description: 'Returns the user information with updated role',
  })
  changeUserRole(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserId() adminId: string,
    @Body() roleDetails: { role: UserRole },
  ): Observable<AdminResponseDto> {
    this.logger.log(
      `Admin ${adminId} requested to change role of user with ID: ${id} to ${UserRole[roleDetails.role]}`,
    );
    return this.userService.changeUserRole({ id, role: roleDetails.role });
  }
}

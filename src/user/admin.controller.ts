import { Body, Controller, Get, Logger, Param, ParseUUIDPipe, Post, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { map, Observable } from 'rxjs';

import { Protected, UserId } from 'src/auth/decorators';
import { BanDetailsResponse, UserRole } from 'src/generated-types/user';
import { SerializeInterceptor } from '../utils/serialize.interceptor';
import { UserService } from './user.service';
import { FullUserResponseDto } from './dto/full-user.response.dto';
import { BanUserRequestDto } from './dto/ban-user.request.dto';

@ApiTags('admin')
@Protected(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly userService: UserService) {}
  protected readonly logger = new Logger(AdminController.name);

  // Get user by their unique ID
  @UseInterceptors(new SerializeInterceptor(FullUserResponseDto))
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
    type: FullUserResponseDto,
    description: 'Returns the user information',
  })
  getUserById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserId() adminId: string,
  ): Observable<FullUserResponseDto> {
    this.logger.log(`Admin ${adminId} requested info for user with ID: ${id}`);
    return this.userService.getUserById(id);
  }

  // Ban a user by their unique ID
  @UseInterceptors(new SerializeInterceptor(FullUserResponseDto))
  @Post('ban')
  @ApiOperation({
    summary: 'Ban user by ID',
    description: 'Bans a user by their unique ID',
  })
  @ApiBody({ type: BanUserRequestDto })
  @ApiResponse({
    status: 200,
    type: FullUserResponseDto,
    description: 'Returns the banned user information',
  })
  banUser(@UserId() adminId: string, @Body() banDetails: BanUserRequestDto): Observable<FullUserResponseDto> {
    this.logger.log(`Admin ${adminId} requested to ban user with ID: ${banDetails.id}`);
    return this.userService.banUser({ bannedBy: adminId, ...banDetails });
  }

  // Unban a user by their unique ID
  @UseInterceptors(new SerializeInterceptor(FullUserResponseDto))
  @Post('unban')
  @ApiOperation({
    summary: 'Unban user by ID',
    description: 'Unbans a user by their unique ID',
  })
  @ApiBody({ type: BanUserRequestDto })
  @ApiResponse({
    status: 200,
    type: FullUserResponseDto,
    description: 'Returns the unbanned user information',
  })
  unbanUser(@UserId() adminId: string, @Body() unbanDetails: BanUserRequestDto): Observable<FullUserResponseDto> {
    this.logger.log(`Admin ${adminId} requested to unban user with ID: ${unbanDetails.id}`);
    return this.userService.unbanUser({ bannedBy: adminId, ...unbanDetails });
  }

  // Change a user's role by their unique ID
  @UseInterceptors(new SerializeInterceptor(FullUserResponseDto))
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
    type: FullUserResponseDto,
    description: 'Returns the user information with updated role',
  })
  changeUserRole(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserId() adminId: string,
    @Body() roleDetails: { role: UserRole },
  ): Observable<FullUserResponseDto> {
    this.logger.log(
      `Admin ${adminId} requested to change role of user with ID: ${id} to ${UserRole[roleDetails.role]}`,
    );
    return this.userService.changeUserRole({ id, role: roleDetails.role });
  }

  // Get all banned users
  @UseInterceptors(new SerializeInterceptor(FullUserResponseDto))
  @Get('banned-users')
  @ApiOperation({
    summary: 'Get all banned users',
    description: 'Fetches a list of all banned users',
  })
  @ApiResponse({
    status: 200,
    type: [FullUserResponseDto],
    description: 'Returns a list of banned users',
  })
  getBannedUsers(@UserId() adminId: string): Observable<FullUserResponseDto[]> {
    this.logger.log(`Admin ${adminId} requested the list of all banned users`);
    return this.userService.getBannedUsers().pipe(
      // Assuming GetBannedUsersResponse has a 'users' property which is an array of User
      map((response) => response.users),
    );
  }

  // Get ban details for a specific user by their unique ID
  @Get('ban-details/:id')
  @ApiOperation({
    summary: 'Get ban details by user ID',
    description: 'Fetches ban details for a specific user by their unique ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the user',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the ban details of the user',
  })
  getBanDetailsByUserId(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserId() adminId: string,
  ): Observable<BanDetailsResponse> {
    this.logger.log(`Admin ${adminId} requested ban details for user with ID: ${id}`);
    return this.userService.getBanDetailsByUserId(id);
  }
}

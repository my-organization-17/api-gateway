import { BadRequestException, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import {
  USER_SERVICE_NAME,
  UserRole,
  type AllUsersResponse,
  type BanDetailsResponse,
  type BanUserRequest,
  type GetBannedUsersResponse,
  type PaginationMeta,
  type PasswordRequest,
  type StatusResponse,
  type UpdateUserRequest,
  type User,
  type UserRoleRequest,
  type UserServiceClient,
} from 'src/generated-types/user';

@Injectable()
export class UserService implements OnModuleInit {
  private userService: UserServiceClient;
  protected readonly logger = new Logger(UserService.name);

  constructor(
    @Inject('USER_CLIENT')
    private readonly userMicroserviceClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.userService = this.userMicroserviceClient.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  getUserById(id: string): Observable<User> {
    this.logger.log(`Fetching user by ID: ${id}`);
    try {
      return this.userService.getUserById({ id });
    } catch (error) {
      this.logger.error(`Failed to fetch user by ID: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }

  getAllUsers(data: PaginationMeta): Observable<AllUsersResponse> {
    this.logger.log(`Fetching all users with page: ${data.page}, limit: ${data.limit}`);
    try {
      return this.userService.getAllUsers(data);
    } catch (error) {
      this.logger.error(`Failed to fetch all users: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }

  updateUser(data: UpdateUserRequest): Observable<User> {
    this.logger.log(`Updating user with ID: ${data.id}`);
    if (!data.name && !data.phoneNumber && !data.avatarUrl) {
      this.logger.warn(`No update fields provided for user ID: ${data.id}`);
      throw new BadRequestException('At least one field (name, phoneNumber, avatarUrl) must be provided for update.');
    }
    try {
      return this.userService.updateUser(data);
    } catch (error) {
      this.logger.error(`Failed to update user with ID ${data.id}: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }

  deleteUser(id: string): Observable<StatusResponse> {
    this.logger.log(`Deleting user with ID: ${id}`);
    try {
      return this.userService.deleteUser({ id });
    } catch (error) {
      this.logger.error(`Failed to delete user with ID ${id}: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }

  confirmPassword(data: PasswordRequest): Observable<StatusResponse> {
    this.logger.log(`Confirming password for user ID: ${data.id}`);
    try {
      return this.userService.confirmPassword(data);
    } catch (error) {
      this.logger.error(
        `Failed to confirm password for user ID ${data.id}: ${(error as Error).message || 'Unknown error'}`,
      );
      throw error;
    }
  }

  changePassword(data: PasswordRequest): Observable<StatusResponse> {
    this.logger.log(`Changing password for user ID: ${data.id}`);
    try {
      return this.userService.changePassword(data);
    } catch (error) {
      this.logger.error(
        `Failed to change password for user ID ${data.id}: ${(error as Error).message || 'Unknown error'}`,
      );
      throw error;
    }
  }

  banUser(data: BanUserRequest): Observable<User> {
    this.logger.log(`Banning user with ID: ${data.id}`);
    try {
      return this.userService.banUser(data);
    } catch (error) {
      this.logger.error(`Failed to ban user with ID ${data.id}: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }

  unbanUser(data: BanUserRequest): Observable<User> {
    this.logger.log(`Unbanning user with ID: ${data.id}`);
    try {
      return this.userService.unbanUser(data);
    } catch (error) {
      this.logger.error(`Failed to unban user with ID ${data.id}: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }

  getBannedUsers(): Observable<GetBannedUsersResponse> {
    this.logger.log(`Fetching all banned users`);
    try {
      return this.userService.getBannedUsers({});
    } catch (error) {
      this.logger.error(`Failed to fetch banned users: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }

  getBanDetailsByUserId(id: string): Observable<BanDetailsResponse> {
    this.logger.log(`Fetching ban details for user ID: ${id}`);
    try {
      return this.userService.getBanDetailsByUserId({ id });
    } catch (error) {
      this.logger.error(
        `Failed to fetch ban details for user ID ${id}: ${(error as Error).message || 'Unknown error'}`,
      );
      throw error;
    }
  }

  changeUserRole(data: UserRoleRequest): Observable<User> {
    this.logger.log(`Changing role for user ID: ${data.id} to ${UserRole[data.role]}`);
    try {
      return this.userService.changeUserRole(data);
    } catch (error) {
      this.logger.error(`Failed to change role for user ID ${data.id}: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }
}

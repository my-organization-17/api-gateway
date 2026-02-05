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
import { MetricsService } from 'src/supervision/metrics/metrics.service';

const TARGET_SERVICE = 'user-microservice';

@Injectable()
export class UserService implements OnModuleInit {
  private userService: UserServiceClient;
  protected readonly logger = new Logger(UserService.name);

  constructor(
    @Inject('USER_CLIENT')
    private readonly userMicroserviceClient: ClientGrpc,
    private readonly metricsService: MetricsService,
  ) {}

  onModuleInit() {
    this.userService = this.userMicroserviceClient.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  getUserById(id: string, currentUserId: string): Observable<User> {
    this.logger.log(`Fetching user by ID: ${id}`);
    if (id !== currentUserId) {
      this.logger.warn(`User ID mismatch: requested ID ${id} does not match current user ID ${currentUserId}`);
      throw new BadRequestException('You can only fetch your own user profile.');
    }
    return this.userService.getUserById({ id }).pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'getUserById'));
  }

  getAllUsers(data: PaginationMeta): Observable<AllUsersResponse> {
    this.logger.log(`Fetching all users with page: ${data.page}, limit: ${data.limit}`);
    return this.userService.getAllUsers(data).pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'getAllUsers'));
  }

  updateUser(data: UpdateUserRequest): Observable<User> {
    this.logger.log(`Updating user with ID: ${data.id}`);
    if (!data.name && !data.phoneNumber) {
      this.logger.warn(`No update fields provided for user ID: ${data.id}`);
      throw new BadRequestException('At least one field (name, phoneNumber) must be provided for update.');
    }
    return this.userService.updateUser(data).pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'updateUser'));
  }

  deleteUser(id: string): Observable<StatusResponse> {
    this.logger.log(`Deleting user with ID: ${id}`);
    return this.userService.deleteUser({ id }).pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'deleteUser'));
  }

  confirmPassword(data: PasswordRequest): Observable<StatusResponse> {
    this.logger.log(`Confirming password for user ID: ${data.id}`);
    return this.userService
      .confirmPassword(data)
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'confirmPassword'));
  }

  changePassword(data: PasswordRequest): Observable<StatusResponse> {
    this.logger.log(`Changing password for user ID: ${data.id}`);
    return this.userService
      .changePassword(data)
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'changePassword'));
  }

  banUser(data: BanUserRequest): Observable<User> {
    this.logger.log(`Banning user with ID: ${data.id}`);
    return this.userService.banUser(data).pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'banUser'));
  }

  unbanUser(data: BanUserRequest): Observable<User> {
    this.logger.log(`Unbanning user with ID: ${data.id}`);
    return this.userService.unbanUser(data).pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'unbanUser'));
  }

  getBannedUsers(): Observable<GetBannedUsersResponse> {
    this.logger.log(`Fetching all banned users`);
    return this.userService
      .getBannedUsers({})
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'getBannedUsers'));
  }

  getBanDetailsByUserId(id: string): Observable<BanDetailsResponse> {
    this.logger.log(`Fetching ban details for user ID: ${id}`);
    return this.userService
      .getBanDetailsByUserId({ id })
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'getBanDetailsByUserId'));
  }

  changeUserRole(data: UserRoleRequest): Observable<User> {
    this.logger.log(`Changing role for user ID: ${data.id} to ${UserRole[data.role]}`);
    return this.userService
      .changeUserRole(data)
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'changeUserRole'));
  }
}

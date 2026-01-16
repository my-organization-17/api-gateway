import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import { type User, USER_SERVICE_NAME, type UserServiceClient } from 'src/generated-types/user';

@Injectable()
export class UserService implements OnModuleInit {
  private userService: UserServiceClient;
  protected readonly logger = new Logger(UserService.name);

  constructor(
    @Inject('USER_MICROSERVICE')
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
}

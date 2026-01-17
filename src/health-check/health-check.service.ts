import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { HEALTH_CHECK_SERVICE_NAME, HealthCheckServiceClient } from 'src/generated-types/health-check';

@Injectable()
export class HealthCheckService implements OnModuleInit {
  private menuHealthCheckService: HealthCheckServiceClient;
  private userHealthCheckService: HealthCheckServiceClient;
  protected readonly logger = new Logger(HealthCheckService.name);

  constructor(
    @Inject('MENU_HEALTH_CHECK_MICROSERVICE')
    private readonly menuMicroserviceClient: ClientGrpc,
    @Inject('USER_HEALTH_CHECK_MICROSERVICE')
    private readonly userMicroserviceClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.menuHealthCheckService =
      this.menuMicroserviceClient.getService<HealthCheckServiceClient>(HEALTH_CHECK_SERVICE_NAME);
    this.userHealthCheckService =
      this.userMicroserviceClient.getService<HealthCheckServiceClient>(HEALTH_CHECK_SERVICE_NAME);
  }

  async checkMenuMicroserviceHealth() {
    this.logger.log('Checking Menu microservice health...');
    try {
      const appHealth = await firstValueFrom(this.menuHealthCheckService.checkAppHealth({}));
      const dbHealth = await firstValueFrom(this.menuHealthCheckService.checkDatabaseConnection({}));
      return { appHealth, dbHealth };
    } catch (error) {
      this.logger.error(`Menu microservice health check failed: ${(error as Error).message || 'Unknown error'}`);
      return {
        appHealth: { serving: false, message: 'Menu microservice app is unavailable' },
        dbHealth: { serving: false, message: 'Menu microservice database is unavailable' },
      };
    }
  }

  async checkUserMicroserviceHealth() {
    this.logger.log('Checking User microservice health...');
    try {
      const appHealth = await firstValueFrom(this.userHealthCheckService.checkAppHealth({}));
      const dbHealth = await firstValueFrom(this.userHealthCheckService.checkDatabaseConnection({}));
      return { appHealth, dbHealth };
    } catch (error) {
      this.logger.error(`User microservice health check failed: ${(error as Error).message || 'Unknown error'}`);
      return {
        appHealth: { serving: false, message: 'User microservice app is unavailable' },
        dbHealth: { serving: false, message: 'User microservice database is unavailable' },
      };
    }
  }
}

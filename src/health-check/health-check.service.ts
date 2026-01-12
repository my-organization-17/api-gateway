import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { HEALTH_CHECK_SERVICE_NAME, HealthCheckServiceClient } from 'src/generated-types/health-check';

@Injectable()
export class HealthCheckService implements OnModuleInit {
  private menuHealthCheckService: HealthCheckServiceClient;
  protected readonly logger = new Logger(HealthCheckService.name);

  constructor(
    @Inject('MENU_HEALTH_CHECK_MICROSERVICE')
    private readonly menuMicroserviceClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.menuHealthCheckService =
      this.menuMicroserviceClient.getService<HealthCheckServiceClient>(HEALTH_CHECK_SERVICE_NAME);
  }

  async checkMenuMicroserviceHealth() {
    this.logger.log('Checking Menu microservice health...');
    try {
      return await firstValueFrom(this.menuHealthCheckService.checkAppHealth({}));
    } catch (error) {
      this.logger.error(`Menu microservice health check failed: ${(error as Error).message || 'Unknown error'}`);
      return { serving: false, message: 'Menu microservice is unavailable' };
    }
  }
}

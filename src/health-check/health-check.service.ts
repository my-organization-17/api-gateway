import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { HEALTH_CHECK_SERVICE_NAME, HealthCheckServiceClient } from 'src/generated-types/health-check';
import { MessageBrokerService } from 'src/transport/message-broker/message-broker.service';

interface ServiceResponse {
  serving: boolean;
  message: string;
}

@Injectable()
export class HealthCheckService implements OnModuleInit {
  private menuHealthCheckService: HealthCheckServiceClient;
  private userHealthCheckService: HealthCheckServiceClient;
  protected readonly logger = new Logger(HealthCheckService.name);

  constructor(
    @Inject('MENU_HEALTH_CHECK_CLIENT')
    private readonly menuMicroserviceClient: ClientGrpc,
    @Inject('USER_HEALTH_CHECK_CLIENT')
    private readonly userMicroserviceClient: ClientGrpc,
    private readonly messageBrokerService: MessageBrokerService,
  ) {}

  onModuleInit() {
    this.menuHealthCheckService =
      this.menuMicroserviceClient.getService<HealthCheckServiceClient>(HEALTH_CHECK_SERVICE_NAME);
    this.userHealthCheckService =
      this.userMicroserviceClient.getService<HealthCheckServiceClient>(HEALTH_CHECK_SERVICE_NAME);
  }

  async checkMenuMicroserviceHealth(): Promise<{ appHealth: ServiceResponse; dbHealth: ServiceResponse }> {
    this.logger.log('Checking Menu microservice health...');
    try {
      const [appHealth, dbHealth] = await Promise.all([
        firstValueFrom(this.menuHealthCheckService.checkAppHealth({})),
        firstValueFrom(this.menuHealthCheckService.checkDatabaseConnection({})),
      ]);
      return { appHealth, dbHealth };
    } catch (error) {
      this.logger.error(`Menu microservice health check failed: ${(error as Error).message || 'Unknown error'}`);
      return {
        appHealth: { serving: false, message: 'Menu microservice app is unavailable' },
        dbHealth: { serving: false, message: 'Menu microservice database is unavailable' },
      };
    }
  }

  async checkUserMicroserviceHealth(): Promise<{ appHealth: ServiceResponse; dbHealth: ServiceResponse }> {
    this.logger.log('Checking User microservice health...');
    try {
      const [appHealth, dbHealth] = await Promise.all([
        firstValueFrom(this.userHealthCheckService.checkAppHealth({})),
        firstValueFrom(this.userHealthCheckService.checkDatabaseConnection({})),
      ]);
      return { appHealth, dbHealth };
    } catch (error) {
      this.logger.error(`User microservice health check failed: ${(error as Error).message || 'Unknown error'}`);
      return {
        appHealth: { serving: false, message: 'User microservice app is unavailable' },
        dbHealth: { serving: false, message: 'User microservice database is unavailable' },
      };
    }
  }

  async checkNotificationMicroserviceHealth(): Promise<ServiceResponse> {
    this.logger.log('Checking Notification microservice health...');
    try {
      return await firstValueFrom(
        this.messageBrokerService.sendMessage<object, ServiceResponse>('health.check', {}, 3000),
      );
    } catch (error) {
      this.logger.error(
        `Notification microservice health check failed: ${(error as Error).message || 'Unknown error'}`,
      );
      return { serving: false, message: 'Notification microservice app is unavailable' };
    }
  }
}

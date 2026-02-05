import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { HEALTH_CHECK_SERVICE_NAME, HealthCheckServiceClient } from 'src/generated-types/health-check';
import { MetricsService } from 'src/supervision/metrics/metrics.service';
import { MessageBrokerService } from 'src/transport/message-broker/message-broker.service';

interface ServiceResponse {
  serving: boolean;
  message: string;
}

@Injectable()
export class HealthCheckService implements OnModuleInit {
  private menuHealthCheckService: HealthCheckServiceClient;
  private userHealthCheckService: HealthCheckServiceClient;
  private mediaHealthCheckService: HealthCheckServiceClient;
  protected readonly logger = new Logger(HealthCheckService.name);

  constructor(
    @Inject('MENU_HEALTH_CHECK_CLIENT')
    private readonly menuMicroserviceClient: ClientGrpc,
    @Inject('USER_HEALTH_CHECK_CLIENT')
    private readonly userMicroserviceClient: ClientGrpc,
    @Inject('MEDIA_HEALTH_CHECK_CLIENT')
    private readonly mediaMicroserviceClient: ClientGrpc,
    private readonly messageBrokerService: MessageBrokerService,
    private readonly metricsService: MetricsService,
  ) {}

  onModuleInit() {
    this.menuHealthCheckService =
      this.menuMicroserviceClient.getService<HealthCheckServiceClient>(HEALTH_CHECK_SERVICE_NAME);
    this.userHealthCheckService =
      this.userMicroserviceClient.getService<HealthCheckServiceClient>(HEALTH_CHECK_SERVICE_NAME);
    this.mediaHealthCheckService =
      this.mediaMicroserviceClient.getService<HealthCheckServiceClient>(HEALTH_CHECK_SERVICE_NAME);
  }

  async checkMenuMicroserviceHealth(): Promise<{ appHealth: ServiceResponse; dbHealth: ServiceResponse }> {
    this.logger.log('Checking Menu microservice health...');
    try {
      const [appHealth, dbHealth] = await Promise.all([
        firstValueFrom(
          this.menuHealthCheckService
            .checkAppHealth({})
            .pipe(this.metricsService.trackGrpcCall('menu-microservice', 'checkAppHealth')),
        ),
        firstValueFrom(
          this.menuHealthCheckService
            .checkDatabaseConnection({})
            .pipe(this.metricsService.trackGrpcCall('menu-microservice', 'checkDatabaseConnection')),
        ),
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
        firstValueFrom(
          this.userHealthCheckService
            .checkAppHealth({})
            .pipe(this.metricsService.trackGrpcCall('user-microservice', 'checkAppHealth')),
        ),
        firstValueFrom(
          this.userHealthCheckService
            .checkDatabaseConnection({})
            .pipe(this.metricsService.trackGrpcCall('user-microservice', 'checkDatabaseConnection')),
        ),
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

  async checkMediaMicroserviceHealth(): Promise<{ appHealth: ServiceResponse }> {
    this.logger.log('Checking Media microservice health...');
    try {
      const appHealth = await firstValueFrom(
        this.mediaHealthCheckService
          .checkAppHealth({})
          .pipe(this.metricsService.trackGrpcCall('media-microservice', 'checkAppHealth')),
      );
      return { appHealth };
    } catch (error) {
      this.logger.error(`Media microservice health check failed: ${(error as Error).message || 'Unknown error'}`);
      return {
        appHealth: { serving: false, message: 'Media microservice app is unavailable' },
      };
    }
  }
}

import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { MetricsService } from 'src/supervision/metrics/metrics.service';
import { MessageBrokerService } from 'src/transport/message-broker/message-broker.service';

import {
  HEALTH_CHECK_SERVICE_NAME,
  ReadinessResponse,
  type HealthCheckResponse,
  type HealthCheckServiceClient,
} from 'src/generated-types/health-check';

export interface AllAppsResponse {
  menuMicroservice: HealthCheckResponse;
  userMicroservice: HealthCheckResponse;
  notificationMicroservice: HealthCheckResponse;
  mediaMicroservice: HealthCheckResponse;
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

  async checkAllMicroservicesHealth(): Promise<AllAppsResponse> {
    const [menuHealth, userHealth, notificationHealth, mediaHealth] = await Promise.all([
      firstValueFrom(
        this.menuHealthCheckService
          .checkAppHealth({})
          .pipe(this.metricsService.trackGrpcCall('menu-microservice', 'checkAppHealth')),
      ).catch((error) => {
        this.logger.error(`Menu microservice health check failed: ${(error as Error).message || 'Unknown error'}`);
        return { serving: false, message: 'Menu microservice app is unavailable' };
      }),
      firstValueFrom(
        this.userHealthCheckService
          .checkAppHealth({})
          .pipe(this.metricsService.trackGrpcCall('user-microservice', 'checkAppHealth')),
      ).catch((error) => {
        this.logger.error(`User microservice health check failed: ${(error as Error).message || 'Unknown error'}`);
        return { serving: false, message: 'User microservice app is unavailable' };
      }),
      firstValueFrom(
        this.messageBrokerService.sendMessage<object, HealthCheckResponse>('health.check', {}, 3000),
      ).catch((error) => {
        this.logger.error(
          `Notification microservice health check failed: ${(error as Error).message || 'Unknown error'}`,
        );
        return { serving: false, message: 'Notification microservice app is unavailable' };
      }),
      firstValueFrom(
        this.mediaHealthCheckService
          .checkAppHealth({})
          .pipe(this.metricsService.trackGrpcCall('media-microservice', 'checkAppHealth')),
      ).catch((error) => {
        this.logger.error(`Media microservice health check failed: ${(error as Error).message || 'Unknown error'}`);
        return { serving: false, message: 'Media microservice app is unavailable' };
      }),
    ]);

    return {
      menuMicroservice: menuHealth,
      userMicroservice: userHealth,
      notificationMicroservice: notificationHealth,
      mediaMicroservice: mediaHealth,
    };
  }

  async checkMenuMicroserviceConnections(): Promise<ReadinessResponse> {
    try {
      const response = await firstValueFrom(
        this.menuHealthCheckService
          .checkAppConnections({})
          .pipe(this.metricsService.trackGrpcCall('menu-microservice', 'checkConnections')),
      );
      return response;
    } catch (error) {
      this.logger.error(`Menu microservice connections check failed: ${(error as Error).message || 'Unknown error'}`);
      return { serving: false, message: 'Menu microservice connections are not healthy', dependencies: [] };
    }
  }

  async checkUserMicroserviceConnections(): Promise<ReadinessResponse> {
    try {
      const response = await firstValueFrom(
        this.userHealthCheckService
          .checkAppConnections({})
          .pipe(this.metricsService.trackGrpcCall('user-microservice', 'checkConnections')),
      );
      return response;
    } catch (error) {
      this.logger.error(`User microservice connections check failed: ${(error as Error).message || 'Unknown error'}`);
      return { serving: false, message: 'User microservice connections are not healthy', dependencies: [] };
    }
  }
}

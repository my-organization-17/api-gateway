import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { HealthCheckService } from './health-check.service';
import type { HealthCheckResponse } from 'src/generated-types/health-check';

interface AllHealthCheckResponse {
  menuMicroservice: {
    appHealth: HealthCheckResponse;
    dbHealth: HealthCheckResponse;
  };
  userMicroservice: {
    appHealth: HealthCheckResponse;
    dbHealth: HealthCheckResponse;
  };
  notificationMicroservice: HealthCheckResponse;
  mediaMicroservice: {
    appHealth: HealthCheckResponse;
  };
}

@ApiTags('health-check')
@Controller('health-check')
export class HealthCheckController {
  private readonly logger = new Logger(HealthCheckController.name);
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Get()
  @ApiOperation({
    summary: 'Check microservices connection',
    description: 'Checks the health status of all connected microservices',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the health status of all connected microservices',
    examples: {
      example1: {
        summary: 'Healthy microservices',
        value: {
          menuMicroservice: {
            appHealth: { serving: true, message: 'Menu microservice app is healthy' },
            dbHealth: { serving: true, message: 'Menu microservice database is healthy' },
          },
          userMicroservice: {
            appHealth: { serving: true, message: 'User microservice app is healthy' },
            dbHealth: { serving: true, message: 'User microservice database is healthy' },
          },
          notificationMicroservice: { serving: true, message: 'Notification microservice app is healthy' },
          mediaMicroservice: { appHealth: { serving: true, message: 'Media microservice app is healthy' } },
        },
      },
      example2: {
        summary: 'Unhealthy microservices',
        value: {
          menuMicroservice: {
            appHealth: { serving: false, message: 'Menu microservice app is unavailable' },
            dbHealth: { serving: false, message: 'Menu microservice database is unavailable' },
          },
          userMicroservice: {
            appHealth: { serving: false, message: 'User microservice app is unavailable' },
            dbHealth: { serving: false, message: 'User microservice database is unavailable' },
          },
          notificationMicroservice: { serving: false, message: 'Notification microservice app is unavailable' },
          mediaMicroservice: { appHealth: { serving: false, message: 'Media microservice app is unavailable' } },
        },
      },
    },
  })
  async checkHealth(): Promise<AllHealthCheckResponse> {
    this.logger.log('Health check requested at API Gateway');

    const [menuMicroservice, userMicroservice, notificationMicroservice, mediaMicroservice] = await Promise.all([
      this.healthCheckService.checkMenuMicroserviceHealth(),
      this.healthCheckService.checkUserMicroserviceHealth(),
      this.healthCheckService.checkNotificationMicroserviceHealth(),
      this.healthCheckService.checkMediaMicroserviceHealth(),
    ]);

    return {
      menuMicroservice,
      userMicroservice,
      notificationMicroservice,
      mediaMicroservice,
    };
  }
}

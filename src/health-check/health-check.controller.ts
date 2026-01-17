import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { HealthCheckService } from './health-check.service';

interface ServiceResponse {
  serving: boolean;
  message: string;
}

interface HealthCheckResponse {
  menuMicroservice: {
    appHealth: ServiceResponse;
    dbHealth: ServiceResponse;
  };
  userMicroservice: {
    appHealth: ServiceResponse;
    dbHealth: ServiceResponse;
  };
}

@ApiTags('health-check')
@Controller('health-check')
export class HealthCheckController {
  constructor(private readonly healthCheckService: HealthCheckService) {}
  protected readonly logger = new Logger(HealthCheckController.name);

  @Get()
  @ApiOperation({
    summary: 'Check microservices connection',
    description: 'Checks the health status of all connected microservices',
  })
  @ApiResponse({
    status: 200,
    type: Promise<HealthCheckResponse>,
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
        },
      },
    },
  })
  async checkHealth(): Promise<HealthCheckResponse> {
    this.logger.log('Health check requested at API Gateway');

    const menuMicroservice = await this.healthCheckService.checkMenuMicroserviceHealth();
    const userMicroservice = await this.healthCheckService.checkUserMicroserviceHealth();

    return {
      menuMicroservice,
      userMicroservice,
    };
  }
}

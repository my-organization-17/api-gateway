import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { HealthCheckResponse } from 'src/generated-types/health-check';
import { HealthCheckService } from './health-check.service';

@ApiTags('health-check')
@Controller('health-check')
export class HealthCheckController {
  constructor(private readonly healthCheckService: HealthCheckService) {}
  protected readonly logger = new Logger(HealthCheckController.name);

  @Get()
  @ApiOperation({
    summary: 'Check microservices connection',
    description: 'Checks the health status of the Menu microservice',
  })
  @ApiResponse({
    status: 200,
    type: Promise<HealthCheckResponse>,
    description: 'Returns the health status of the Menu microservice',
    examples: {
      healthy: {
        summary: 'Healthy',
        value: { serving: true, message: 'Menu microservice is healthy' },
      },
      unhealthy: {
        summary: 'Unhealthy',
        value: {
          serving: false,
          message: 'Menu microservice is unavailable',
        },
      },
    },
  })
  async checkHealth(): Promise<HealthCheckResponse> {
    this.logger.log('Health check requested at API Gateway');
    return await this.healthCheckService.checkMenuMicroserviceHealth();
  }
}

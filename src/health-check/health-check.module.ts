import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { GrpcConfig } from 'src/configs/grpc.config';
import { HealthCheckService } from './health-check.service';
import { HealthCheckController } from './health-check.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([GrpcConfig.menuHealthCheckClientOptions(), GrpcConfig.userHealthCheckClientOptions()]),
  ],
  controllers: [HealthCheckController],
  providers: [HealthCheckService],
})
export class HealthCheckModule {}

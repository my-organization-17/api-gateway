import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

import { HealthCheckService } from './health-check.service';
import { HealthCheckController } from './health-check.controller';
import { HEALTH_CHECK_V1_PACKAGE_NAME } from 'src/generated-types/health-check';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'MENU_HEALTH_CHECK_MICROSERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.getOrThrow<string>('MENU_MICROSERVICE_GRPC_URL'),
            package: HEALTH_CHECK_V1_PACKAGE_NAME,
            protoPath: 'proto/health-check.proto',
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [HealthCheckController],
  providers: [HealthCheckService],
})
export class HealthCheckModule {}

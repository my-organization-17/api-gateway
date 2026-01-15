import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

import { AUTH_V1_PACKAGE_NAME } from 'src/generated-types/auth';
import { USER_V1_PACKAGE_NAME } from 'src/generated-types/user';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'USER_MICROSERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.getOrThrow<string>('USER_MICROSERVICE_GRPC_URL'),
            package: [AUTH_V1_PACKAGE_NAME, USER_V1_PACKAGE_NAME],
            protoPath: ['proto/auth.proto', 'proto/user.proto'],
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

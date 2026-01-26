import { ClientsProviderAsyncOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

import { HEALTH_CHECK_V1_PACKAGE_NAME } from 'src/generated-types/health-check';
import { MENU_CATEGORY_V1_PACKAGE_NAME } from 'src/generated-types/menu-category';
import { MENU_ITEM_V1_PACKAGE_NAME } from 'src/generated-types/menu-item';
import { AUTH_V1_PACKAGE_NAME } from 'src/generated-types/auth';
import { USER_V1_PACKAGE_NAME } from 'src/generated-types/user';

export class GrpcConfig {
  static createGrpcClientOptions({
    serviceName,
    protoPath,
    packageName,
    urlConfigKey,
  }: {
    serviceName: string;
    protoPath: string | string[];
    packageName: string | string[];
    urlConfigKey: string;
  }): ClientsProviderAsyncOptions {
    return {
      name: serviceName,
      useFactory: (configService: ConfigService) => ({
        transport: Transport.GRPC,
        options: {
          url: configService.getOrThrow<string>(urlConfigKey),
          package: packageName,
          protoPath: protoPath,
        },
      }),
      inject: [ConfigService],
    };
  }

  static menuHealthCheckClientOptions(): ClientsProviderAsyncOptions {
    return GrpcConfig.createGrpcClientOptions({
      serviceName: 'MENU_HEALTH_CHECK_CLIENT',
      protoPath: 'proto/health-check.proto',
      packageName: HEALTH_CHECK_V1_PACKAGE_NAME,
      urlConfigKey: 'MENU_MICROSERVICE_GRPC_URL',
    });
  }

  static userHealthCheckClientOptions(): ClientsProviderAsyncOptions {
    return GrpcConfig.createGrpcClientOptions({
      serviceName: 'USER_HEALTH_CHECK_CLIENT',
      protoPath: 'proto/health-check.proto',
      packageName: HEALTH_CHECK_V1_PACKAGE_NAME,
      urlConfigKey: 'USER_MICROSERVICE_GRPC_URL',
    });
  }

  static authClientOptions(): ClientsProviderAsyncOptions {
    return GrpcConfig.createGrpcClientOptions({
      serviceName: 'AUTH_CLIENT',
      protoPath: 'proto/auth.proto',
      packageName: AUTH_V1_PACKAGE_NAME,
      urlConfigKey: 'USER_MICROSERVICE_GRPC_URL',
    });
  }

  static menuCategoryClientOptions(): ClientsProviderAsyncOptions {
    return GrpcConfig.createGrpcClientOptions({
      serviceName: 'MENU_CATEGORY_CLIENT',
      protoPath: 'proto/menu-category.proto',
      packageName: MENU_CATEGORY_V1_PACKAGE_NAME,
      urlConfigKey: 'MENU_MICROSERVICE_GRPC_URL',
    });
  }

  static menuItemClientOptions(): ClientsProviderAsyncOptions {
    return GrpcConfig.createGrpcClientOptions({
      serviceName: 'MENU_ITEM_CLIENT',
      protoPath: 'proto/menu-item.proto',
      packageName: MENU_ITEM_V1_PACKAGE_NAME,
      urlConfigKey: 'MENU_MICROSERVICE_GRPC_URL',
    });
  }

  static userClientOptions(): ClientsProviderAsyncOptions {
    return GrpcConfig.createGrpcClientOptions({
      serviceName: 'USER_CLIENT',
      protoPath: 'proto/user.proto',
      packageName: USER_V1_PACKAGE_NAME,
      urlConfigKey: 'USER_MICROSERVICE_GRPC_URL',
    });
  }
}

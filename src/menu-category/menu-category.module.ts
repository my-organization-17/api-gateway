import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

import { MENU_CATEGORY_V1_PACKAGE_NAME } from 'src/generated-types/menu-category';
import { MenuCategoryService } from './menu-category.service';
import { MenuCategoryController } from './menu-category.controller';
import { FullMenuController } from './full-menu.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'MENU_CATEGORY_MICROSERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.getOrThrow<string>('MENU_MICROSERVICE_GRPC_URL'),
            package: MENU_CATEGORY_V1_PACKAGE_NAME,
            protoPath: 'proto/menu-category.proto',
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [MenuCategoryController, FullMenuController],
  providers: [MenuCategoryService],
})
export class MenuCategoryModule {}

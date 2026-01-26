import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { GrpcConfig } from 'src/configs/grpc.config';
import { MenuCategoryService } from './menu-category.service';
import { MenuCategoryController } from './menu-category.controller';
import { FullMenuController } from './full-menu.controller';

@Module({
  imports: [ClientsModule.registerAsync([GrpcConfig.menuCategoryClientOptions()])],
  controllers: [MenuCategoryController, FullMenuController],
  providers: [MenuCategoryService],
})
export class MenuCategoryModule {}

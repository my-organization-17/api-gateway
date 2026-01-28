import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { GrpcConfig } from 'src/configs/grpc.config';
import { MenuItemService } from './menu-item.service';
import { MenuItemController } from './menu-item.controller';

@Module({
  imports: [ClientsModule.registerAsync([GrpcConfig.menuItemClientOptions()])],
  controllers: [MenuItemController],
  providers: [MenuItemService],
})
export class MenuItemModule {}

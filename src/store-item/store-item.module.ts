import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { GrpcConfig } from 'src/configs/grpc.config';
import { StoreItemService } from './store-item.service';
import { StoreItemAdminController } from './store-item-admin.controller';
import { StoreItemPublicController } from './store-item-public.controller';

@Module({
  imports: [ClientsModule.registerAsync([GrpcConfig.storeItemClientOptions()])],
  controllers: [StoreItemAdminController, StoreItemPublicController],
  providers: [StoreItemService],
})
export class StoreItemModule {}

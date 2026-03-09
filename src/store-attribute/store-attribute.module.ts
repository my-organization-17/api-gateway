import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { GrpcConfig } from 'src/configs/grpc.config';
import { StoreAttributeService } from './store-attribute.service';
import { StoreAttributeController } from './store-attribute.controller';

@Module({
  imports: [ClientsModule.registerAsync([GrpcConfig.storeAttributeClientOptions()])],
  controllers: [StoreAttributeController],
  providers: [StoreAttributeService],
})
export class StoreAttributeModule {}

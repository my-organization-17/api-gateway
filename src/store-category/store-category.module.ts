import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { GrpcConfig } from 'src/configs/grpc.config';
import { StoreCategoryService } from './store-category.service';
import { StoreCategoryController } from './store-category.controller';

@Module({
  imports: [ClientsModule.registerAsync([GrpcConfig.storeCategoryClientOptions()])],
  controllers: [StoreCategoryController],
  providers: [StoreCategoryService],
})
export class StoreCategoryModule {}

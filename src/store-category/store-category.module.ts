import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { GrpcConfig } from 'src/configs/grpc.config';
import { StoreCategoryService } from './store-category.service';
import { StoreCategoryPublicController } from './store-category-public.controller';
import { StoreCategoryAdminController } from './store-category-admin.controller';

@Module({
  imports: [ClientsModule.registerAsync([GrpcConfig.storeCategoryClientOptions()])],
  controllers: [StoreCategoryAdminController, StoreCategoryPublicController],
  providers: [StoreCategoryService],
})
export class StoreCategoryModule {}

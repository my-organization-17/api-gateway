import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { GrpcConfig } from 'src/configs/grpc.config';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';

@Module({
  imports: [ClientsModule.registerAsync([GrpcConfig.mediaClientOptions(), GrpcConfig.userClientOptions()])],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}

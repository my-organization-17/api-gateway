import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { GrpcConfig } from 'src/configs/grpc.config';
import { UserService } from './user.service';
import { AdminController } from './admin.controller';
import { UserController } from './user.controller';

@Module({
  imports: [ClientsModule.registerAsync([GrpcConfig.userClientOptions()])],
  controllers: [AdminController, UserController],
  providers: [UserService],
})
export class UserModule {}

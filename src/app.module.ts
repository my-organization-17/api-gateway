import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

import { HealthCheckModule } from './health-check/health-check.module';
import { MenuCategoryModule } from './menu-category/menu-category.module';
import { validateEnv } from './utils/env-validator';
import { EnvironmentVariables } from './common/dto';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MessageBrokerModule } from './transport/message-broker/message-broker.module';
import { MenuItemModule } from './menu-item/menu-item.module';
import { MetricsModule } from './supervision/metrics/metrics.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local'],
      validate: (config) => validateEnv(config, EnvironmentVariables),
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 10 * 1000, // 10 seconds
    }),
    HealthCheckModule,
    MessageBrokerModule,
    MenuCategoryModule,
    UserModule,
    AuthModule,
    MenuItemModule,
    MetricsModule,
    MediaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

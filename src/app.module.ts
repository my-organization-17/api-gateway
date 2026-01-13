import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

import { HealthCheckModule } from './health-check/health-check.module';
import { MenuCategoryModule } from './menu-category/menu-category.module';
import { validateEnv } from './utils/env-validator';
import { EnvironmentVariables } from './common/dto/env.dto';

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
    MenuCategoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

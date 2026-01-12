import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthCheckModule } from './health-check/health-check.module';
import { MenuCategoryModule } from './menu-category/menu-category.module';
import { validateEnv } from './utils/env-validator';
import { EnvironmentVariables } from './utils/env.dto';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local'],
      validate: (config) => validateEnv(config, EnvironmentVariables),
    }),
    HealthCheckModule,
    MenuCategoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

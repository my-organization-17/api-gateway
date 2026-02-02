import { initTracing } from './supervision/tracing/tracing';

// Initialize tracing BEFORE any other imports to ensure proper instrumentation
initTracing();

import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { GrpcExceptionFilter } from './utils/grpc-exception-filter';

const logger = new Logger('Main');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production' ? ['error'] : ['log', 'debug', 'warn', 'error', 'verbose'],
  });
  const configService = app.get(ConfigService);
  const PORT = configService.get<string>('HTTP_PORT');

  app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new GrpcExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('API for CoffeeDoor Gateway Service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(PORT || 4000);
  logger.log(`API Gateway service is running on ${PORT || 4000}`);
}
void bootstrap();

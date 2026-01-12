import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { GrpcExceptionFilter } from './errors/grpc-exception-filter';

const logger = new Logger('main.ts');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const configService = app.get(ConfigService);
  const PORT = configService.get<string>('HTTP_PORT');

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

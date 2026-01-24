import { IsInt, IsNotEmpty, IsString, Max } from 'class-validator';

export class EnvironmentVariables {
  @IsInt()
  @IsNotEmpty()
  @Max(65535)
  readonly HTTP_PORT: number;

  @IsString()
  @IsNotEmpty()
  readonly MENU_MICROSERVICE_GRPC_URL: string;

  @IsString()
  @IsNotEmpty()
  readonly USER_MICROSERVICE_GRPC_URL: string;

  @IsString()
  @IsNotEmpty()
  readonly COOKIE_SECRET: string;

  @IsString()
  @IsNotEmpty()
  readonly COOKIE_DOMAIN: string;

  @IsString()
  @IsNotEmpty()
  readonly JWT_ACCESS_SECRET: string;

  @IsString()
  @IsNotEmpty()
  readonly RABBITMQ_URL: string;

  @IsString()
  @IsNotEmpty()
  readonly RABBITMQ_QUEUE: string;
}

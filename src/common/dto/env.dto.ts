import { IsInt, IsNotEmpty, IsString, IsUrl, Max } from 'class-validator';

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

  @IsUrl({ require_tld: false }, { message: 'COOKIE_DOMAIN must be a valid URL' })
  @IsNotEmpty()
  readonly COOKIE_DOMAIN: string;

  @IsString()
  @IsNotEmpty()
  readonly JWT_ACCESS_SECRET: string;

  @IsUrl({ protocols: ['amqp', 'amqps'], require_tld: false }, { message: 'RABBITMQ_URL must be a valid AMQP URL' })
  @IsNotEmpty()
  readonly RABBITMQ_URL: string;

  @IsString()
  @IsNotEmpty()
  readonly RABBITMQ_QUEUE: string;
}

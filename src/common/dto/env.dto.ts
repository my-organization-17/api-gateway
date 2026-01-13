import { IsInt, IsNotEmpty, IsString, Max } from 'class-validator';

export class EnvironmentVariables {
  @IsInt()
  @IsNotEmpty()
  @Max(65535)
  readonly HTTP_PORT: number;

  @IsString()
  @IsNotEmpty()
  readonly MENU_MICROSERVICE_GRPC_URL: string;
}

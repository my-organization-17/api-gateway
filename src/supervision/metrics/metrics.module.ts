import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

import { GrpcExceptionFilter } from 'src/utils/grpc-exception-filter';
import { HttpMetricsInterceptor } from './http-metrics.interceptor';
import { MetricsService } from './metrics.service';
import {
  AUTH_ATTEMPTS_TOTAL_PROVIDER,
  ERRORS_TOTAL_PROVIDER,
  GRPC_CLIENT_DURATION_PROVIDER,
  GRPC_CLIENT_REQUESTS_TOTAL_PROVIDER,
  HTTP_ACTIVE_REQUESTS_PROVIDER,
  HTTP_REQUEST_DURATION_PROVIDER,
  HTTP_REQUESTS_TOTAL_PROVIDER,
} from './metrics.providers';

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [
    // Providers
    HTTP_REQUEST_DURATION_PROVIDER,
    HTTP_ACTIVE_REQUESTS_PROVIDER,
    HTTP_REQUESTS_TOTAL_PROVIDER,
    GRPC_CLIENT_DURATION_PROVIDER,
    GRPC_CLIENT_REQUESTS_TOTAL_PROVIDER,
    ERRORS_TOTAL_PROVIDER,
    AUTH_ATTEMPTS_TOTAL_PROVIDER,

    // Services and interceptors
    MetricsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GrpcExceptionFilter,
    },
  ],
  exports: [MetricsService],
})
export class MetricsModule {}

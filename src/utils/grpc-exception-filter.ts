import { type ArgumentsHost, Catch, ExceptionFilter, HttpException, Injectable, Logger } from '@nestjs/common';
import type { Response } from 'express';

import { MetricsService } from '../supervision/metrics/metrics.service';
import { grpcToHttpCode } from './grpc-to-http-code';

@Injectable()
@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GrpcExceptionFilter.name);

  constructor(private readonly metricsService: MetricsService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Handle gRPC exceptions
    if (this.isGrpcException(exception)) {
      const grpcException = exception as { code: number; details: string };
      const httpStatus = grpcToHttpCode(grpcException.code);
      const message = grpcException.details || 'Internal server error';

      this.logger.error(`gRPC Exception caught: code=${grpcException.code}, details=${grpcException.details}`);

      // Record gRPC error metric
      this.metricsService.recordError('grpc_error', 'downstream_service', httpStatus);

      return response.status(httpStatus).json({
        statusCode: httpStatus,
        message,
      });
    }

    // Handle http exceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const responseBody = exception.getResponse();

      this.logger.error(`HTTP Exception caught: status=${status}, response=${JSON.stringify(responseBody)}`);

      // Record HTTP error metric
      const errorType = this.getHttpErrorType(status);
      this.metricsService.recordError(errorType, 'api-gateway', status);

      return response.status(status).json(responseBody);
    }

    // fallback (500 - Internal Server Error)
    const exceptionMessage = exception instanceof Error ? exception.message : String(exception);
    this.logger.error(`Internal Server Error: ${exceptionMessage}`);

    // Record internal error metric
    this.metricsService.recordError('internal_error', 'api-gateway', 500);

    return response.status(500).json({
      statusCode: 500,
      message: exceptionMessage || 'Internal server error',
    });
  }

  private isGrpcException(exception: unknown) {
    return typeof exception === 'object' && exception !== null && 'code' in exception && 'details' in exception;
  }

  private getHttpErrorType(status: number): 'validation_error' | 'auth_error' | 'http_error' {
    if (status === 400 || status === 422) {
      return 'validation_error';
    }
    if (status === 401 || status === 403) {
      return 'auth_error';
    }
    return 'http_error';
  }
}

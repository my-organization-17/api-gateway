import { type ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Response } from 'express';

import { grpcToHttpCode } from './grpc-to-http-code';

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GrpcExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Handle gRPC exceptions
    if (this.isGrpcException(exception)) {
      const grpcException = exception as { code: number; details: string };
      const httpStatus = grpcToHttpCode(grpcException.code);
      const message = grpcException.details || 'Internal server error';

      this.logger.error(`gRPC Exception caught: code=${grpcException.code}, details=${grpcException.details}`);
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
      return response.status(status).json(responseBody);
    }

    // fallback (500 - Internal Server Error)
    const exceptionMessage = exception instanceof Error ? exception.message : String(exception);
    this.logger.error(`Internal Server Error: ${exceptionMessage}`);
    return response.status(500).json({
      statusCode: 500,
      message: exceptionMessage || 'Internal server error',
    });
  }

  private isGrpcException(exception: unknown) {
    return typeof exception === 'object' && exception !== null && 'code' in exception && 'details' in exception;
  }
}

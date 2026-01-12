import { type ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
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

    // fallback (non-gRPC error)
    const exceptionMessage = exception instanceof Error ? exception.message : String(exception);
    this.logger.error(`Non-gRPC Exception caught: ${exceptionMessage}`);
    return response.status(500).json({
      statusCode: 500,
      message: exceptionMessage || 'Internal server error',
    });
  }

  private isGrpcException(exception: unknown) {
    return typeof exception === 'object' && exception !== null && 'code' in exception && 'details' in exception;
  }
}

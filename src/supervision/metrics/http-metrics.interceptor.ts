import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Gauge, Histogram } from 'prom-client';
import { finalize, Observable } from 'rxjs';

import type { Request, Response } from 'express';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  public constructor(
    @InjectMetric('http_request_duration_seconds') private readonly httpRequestDurationSeconds: Histogram<string>,
    @InjectMetric('http_active_requests') private readonly httpActiveRequests: Gauge<string>,
    @InjectMetric('http_requests_total') private readonly httpRequestsTotal: Counter<string>,
  ) {}

  public intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const method = request.method;
    const service = 'api-gateway';
    const route = (request.route as { path?: string } | undefined)?.path || request.path || 'unknown';

    if (route === '/metrics') {
      return next.handle();
    }

    const end = this.httpRequestDurationSeconds.startTimer({
      service,
      method,
    });

    this.httpActiveRequests.inc({ service });

    return next.handle().pipe(
      finalize(() => {
        const statusCode = response.statusCode.toString();

        end({ service, method, route, status_code: statusCode });
        this.httpRequestsTotal.inc({ service, method, route, status_code: statusCode });
        this.httpActiveRequests.dec({ service });
      }),
    );
  }
}

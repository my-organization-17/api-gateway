import { makeCounterProvider, makeGaugeProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';

import {
  AUTH_ATTEMPTS_TOTAL,
  ERRORS_TOTAL,
  GRPC_CLIENT_DURATION,
  GRPC_CLIENT_REQUESTS_TOTAL,
  HTTP_ACTIVE_REQUESTS,
  HTTP_REQUEST_DURATION,
  HTTP_REQUESTS_TOTAL,
} from './metrics.constants';

// HTTP Request Duration Histogram Provider
export const HTTP_REQUEST_DURATION_PROVIDER = makeHistogramProvider({
  name: HTTP_REQUEST_DURATION,
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['service', 'method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2.5, 5, 10],
});

// HTTP Active Requests Gauge Provider
export const HTTP_ACTIVE_REQUESTS_PROVIDER = makeGaugeProvider({
  name: HTTP_ACTIVE_REQUESTS,
  help: 'Number of active HTTP requests',
  labelNames: ['service', 'method', 'route'],
});

// HTTP Requests Total Counter Provider
export const HTTP_REQUESTS_TOTAL_PROVIDER = makeCounterProvider({
  name: HTTP_REQUESTS_TOTAL,
  help: 'Total number of HTTP requests',
  labelNames: ['service', 'method', 'route', 'status_code'],
});

// gRPC Client Duration Histogram Provider
export const GRPC_CLIENT_DURATION_PROVIDER = makeHistogramProvider({
  name: GRPC_CLIENT_DURATION,
  help: 'Duration of gRPC calls to downstream microservices',
  labelNames: ['target_service', 'method', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

// gRPC Client Requests Total Counter Provider
export const GRPC_CLIENT_REQUESTS_TOTAL_PROVIDER = makeCounterProvider({
  name: GRPC_CLIENT_REQUESTS_TOTAL,
  help: 'Total gRPC requests to downstream services',
  labelNames: ['target_service', 'method', 'status'],
});

// Errors Total Counter Provider
export const ERRORS_TOTAL_PROVIDER = makeCounterProvider({
  name: ERRORS_TOTAL,
  help: 'Errors by type and source',
  labelNames: ['error_type', 'source', 'status_code'],
});

// Authentication Attempts Total Counter Provider
export const AUTH_ATTEMPTS_TOTAL_PROVIDER = makeCounterProvider({
  name: AUTH_ATTEMPTS_TOTAL,
  help: 'Authentication attempts by operation and result',
  labelNames: ['operation', 'result'],
});

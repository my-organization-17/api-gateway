import { HttpStatus } from '@nestjs/common';

export const grpcToHttpCode = (code: number | string): number => {
  if (!code || isNaN(Number(code))) {
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
  let httpCode: number;
  switch (+code) {
    case 1:
      httpCode = HttpStatus.UNPROCESSABLE_ENTITY;
      break;
    case 3:
      httpCode = HttpStatus.BAD_REQUEST;
      break;
    case 4:
      httpCode = HttpStatus.GATEWAY_TIMEOUT;
      break;
    case 5:
      httpCode = HttpStatus.NOT_FOUND;
      break;
    case 6:
      httpCode = HttpStatus.CONFLICT;
      break;
    case 7:
      httpCode = HttpStatus.FORBIDDEN;
      break;
    case 8:
      httpCode = HttpStatus.TOO_MANY_REQUESTS;
      break;
    case 9:
      httpCode = HttpStatus.PRECONDITION_REQUIRED;
      break;
    case 10:
      httpCode = HttpStatus.METHOD_NOT_ALLOWED;
      break;
    case 11:
      httpCode = HttpStatus.PAYLOAD_TOO_LARGE;
      break;
    case 12:
      httpCode = HttpStatus.NOT_IMPLEMENTED;
      break;
    case 2:
    case 13:
    case 15:
      httpCode = HttpStatus.INTERNAL_SERVER_ERROR;
      break;
    case 14:
      httpCode = HttpStatus.SERVICE_UNAVAILABLE;
      break;
    case 16:
      httpCode = HttpStatus.UNAUTHORIZED;
      break;
    default:
      httpCode = HttpStatus.INTERNAL_SERVER_ERROR;
  }
  return httpCode;
};

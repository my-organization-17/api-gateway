import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Injectable()
export class MessageBrokerService {
  protected readonly logger = new Logger(MessageBrokerService.name);

  constructor(
    @Inject('NOTIFICATION_MICROSERVICE')
    private readonly notificationMicroserviceClient: ClientProxy,
  ) {}

  public sendMessage<TRequest, TResponse>(pattern: string, data: TRequest): Observable<TResponse> {
    this.logger.log(`Sending message with pattern: ${pattern}`);
    try {
      const response = this.notificationMicroserviceClient.send<TResponse, TRequest>(pattern, data);
      this.logger.log(`Received response for pattern ${pattern}: ${JSON.stringify(response)}`);
      return response;
    } catch (error) {
      this.logger.error(
        `Error sending message with pattern ${pattern}: ${(error as Error).message || 'Unknown error'}`,
      );
      throw error;
    }
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';

import { HealthCheckService } from '../health-check.service';
import { MessageBrokerService } from 'src/transport/message-broker/message-broker.service';
import { MetricsService } from 'src/supervision/metrics/metrics.service';

describe('HealthCheckService', () => {
  let service: HealthCheckService;

  const mockMenuHealth = { serving: true, message: 'Menu microservice app is healthy' };
  const mockUserHealth = { serving: true, message: 'User microservice app is healthy' };
  const mockNotificationHealth = { serving: true, message: 'Notification microservice is healthy' };
  const mockMediaHealth = { serving: true, message: 'Media microservice app is healthy' };

  const unhealthyMenuHealth = { serving: false, message: 'Menu microservice app is unavailable' };
  const unhealthyUserHealth = { serving: false, message: 'User microservice app is unavailable' };
  const unhealthyNotificationHealth = { serving: false, message: 'Notification microservice app is unavailable' };
  const unhealthyMediaHealth = { serving: false, message: 'Media microservice app is unavailable' };

  const menuCheckAppHealthMock = jest.fn();
  const userCheckAppHealthMock = jest.fn();
  const mediaCheckAppHealthMock = jest.fn();
  const sendMessageMock = jest.fn();

  const passthrough =
    <T>() =>
    (source: import('rxjs').Observable<T>) =>
      source;

  const mockMetricsService = {
    trackGrpcCall: jest.fn().mockReturnValue(passthrough()),
  };

  beforeEach(async () => {
    menuCheckAppHealthMock.mockReturnValue(of(mockMenuHealth));
    userCheckAppHealthMock.mockReturnValue(of(mockUserHealth));
    mediaCheckAppHealthMock.mockReturnValue(of(mockMediaHealth));
    sendMessageMock.mockReturnValue(of(mockNotificationHealth));

    const mockMenuHealthCheckService = { checkAppHealth: menuCheckAppHealthMock };
    const mockUserHealthCheckService = { checkAppHealth: userCheckAppHealthMock };
    const mockMediaHealthCheckService = { checkAppHealth: mediaCheckAppHealthMock };

    const mockMenuGrpcClient = {
      getService: jest.fn().mockReturnValue(mockMenuHealthCheckService),
    };

    const mockUserGrpcClient = {
      getService: jest.fn().mockReturnValue(mockUserHealthCheckService),
    };

    const mockMediaGrpcClient = {
      getService: jest.fn().mockReturnValue(mockMediaHealthCheckService),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthCheckService,
        {
          provide: 'MENU_HEALTH_CHECK_CLIENT',
          useValue: mockMenuGrpcClient,
        },
        {
          provide: 'USER_HEALTH_CHECK_CLIENT',
          useValue: mockUserGrpcClient,
        },
        {
          provide: 'MEDIA_HEALTH_CHECK_CLIENT',
          useValue: mockMediaGrpcClient,
        },
        {
          provide: MessageBrokerService,
          useValue: {
            sendMessage: sendMessageMock,
          },
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    service = module.get<HealthCheckService>(HealthCheckService);
    service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return health status of all microservices', async () => {
    const result = await service.checkAllMicroservicesHealth();

    expect(result).toEqual({
      menuMicroservice: mockMenuHealth,
      userMicroservice: mockUserHealth,
      notificationMicroservice: mockNotificationHealth,
      mediaMicroservice: mockMediaHealth,
    });
    expect(menuCheckAppHealthMock).toHaveBeenCalled();
    expect(userCheckAppHealthMock).toHaveBeenCalled();
    expect(sendMessageMock).toHaveBeenCalledWith('health.check', {}, 3000);
    expect(mediaCheckAppHealthMock).toHaveBeenCalled();
  });

  it('should return unhealthy status when microservices are down', async () => {
    menuCheckAppHealthMock.mockReturnValue(throwError(() => new Error('Menu microservice is down')));
    userCheckAppHealthMock.mockReturnValue(throwError(() => new Error('User microservice is down')));
    sendMessageMock.mockReturnValue(throwError(() => new Error('Notification microservice is down')));
    mediaCheckAppHealthMock.mockReturnValue(throwError(() => new Error('Media microservice is down')));

    const result = await service.checkAllMicroservicesHealth();

    expect(result).toEqual({
      menuMicroservice: unhealthyMenuHealth,
      userMicroservice: unhealthyUserHealth,
      notificationMicroservice: unhealthyNotificationHealth,
      mediaMicroservice: unhealthyMediaHealth,
    });
    expect(menuCheckAppHealthMock).toHaveBeenCalled();
    expect(userCheckAppHealthMock).toHaveBeenCalled();
    expect(sendMessageMock).toHaveBeenCalledWith('health.check', {}, 3000);
    expect(mediaCheckAppHealthMock).toHaveBeenCalled();
  });
});

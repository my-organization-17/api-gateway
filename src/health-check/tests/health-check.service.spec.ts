import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';

import { HealthCheckService } from '../health-check.service';
import { MessageBrokerService } from 'src/transport/message-broker/message-broker.service';

describe('HealthCheckService', () => {
  let service: HealthCheckService;

  const mockHealthyAppResponse = { serving: true, message: 'App is healthy' };
  const mockHealthyDbResponse = { serving: true, message: 'Database is healthy' };
  const mockNotificationResponse = { serving: true, message: 'Notification microservice is healthy' };

  const menuCheckAppHealthMock = jest.fn();
  const menuCheckDatabaseConnectionMock = jest.fn();
  const userCheckAppHealthMock = jest.fn();
  const userCheckDatabaseConnectionMock = jest.fn();
  const mediaCheckAppHealthMock = jest.fn();
  const sendMessageMock = jest.fn();

  beforeEach(async () => {
    menuCheckAppHealthMock.mockReturnValue(of(mockHealthyAppResponse));
    menuCheckDatabaseConnectionMock.mockReturnValue(of(mockHealthyDbResponse));
    userCheckAppHealthMock.mockReturnValue(of(mockHealthyAppResponse));
    userCheckDatabaseConnectionMock.mockReturnValue(of(mockHealthyDbResponse));
    mediaCheckAppHealthMock.mockReturnValue(of(mockHealthyAppResponse));
    sendMessageMock.mockReturnValue(of(mockNotificationResponse));

    const mockMenuHealthCheckService = {
      checkAppHealth: menuCheckAppHealthMock,
      checkDatabaseConnection: menuCheckDatabaseConnectionMock,
    };

    const mockUserHealthCheckService = {
      checkAppHealth: userCheckAppHealthMock,
      checkDatabaseConnection: userCheckDatabaseConnectionMock,
    };

    const mockMediaHealthCheckService = {
      checkAppHealth: mediaCheckAppHealthMock,
    };

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

  describe('checkMenuMicroserviceHealth', () => {
    it('should return healthy status when menu microservice is available', async () => {
      const result = await service.checkMenuMicroserviceHealth();

      expect(result).toEqual({
        appHealth: mockHealthyAppResponse,
        dbHealth: mockHealthyDbResponse,
      });
      expect(menuCheckAppHealthMock).toHaveBeenCalledWith({});
      expect(menuCheckDatabaseConnectionMock).toHaveBeenCalledWith({});
    });

    it('should return unhealthy status when menu microservice is unavailable', async () => {
      menuCheckAppHealthMock.mockReturnValue(throwError(() => new Error('Connection failed')));

      const result = await service.checkMenuMicroserviceHealth();

      expect(result).toEqual({
        appHealth: { serving: false, message: 'Menu microservice app is unavailable' },
        dbHealth: { serving: false, message: 'Menu microservice database is unavailable' },
      });
    });
  });

  describe('checkUserMicroserviceHealth', () => {
    it('should return healthy status when user microservice is available', async () => {
      const result = await service.checkUserMicroserviceHealth();

      expect(result).toEqual({
        appHealth: mockHealthyAppResponse,
        dbHealth: mockHealthyDbResponse,
      });
      expect(userCheckAppHealthMock).toHaveBeenCalledWith({});
      expect(userCheckDatabaseConnectionMock).toHaveBeenCalledWith({});
    });

    it('should return unhealthy status when user microservice is unavailable', async () => {
      userCheckAppHealthMock.mockReturnValue(throwError(() => new Error('Connection failed')));

      const result = await service.checkUserMicroserviceHealth();

      expect(result).toEqual({
        appHealth: { serving: false, message: 'User microservice app is unavailable' },
        dbHealth: { serving: false, message: 'User microservice database is unavailable' },
      });
    });
  });

  describe('checkNotificationMicroserviceHealth', () => {
    it('should return healthy status when notification microservice is available', async () => {
      const result = await service.checkNotificationMicroserviceHealth();

      expect(result).toEqual(mockNotificationResponse);
      expect(sendMessageMock).toHaveBeenCalledWith('health.check', {}, 3000);
    });

    it('should return unhealthy status when notification microservice is unavailable', async () => {
      sendMessageMock.mockReturnValue(throwError(() => new Error('Connection failed')));

      const result = await service.checkNotificationMicroserviceHealth();

      expect(result).toEqual({
        serving: false,
        message: 'Notification microservice app is unavailable',
      });
    });
  });

  describe('checkMediaMicroserviceHealth', () => {
    it('should return healthy status when media microservice is available', async () => {
      const result = await service.checkMediaMicroserviceHealth();

      expect(result).toEqual({
        appHealth: mockHealthyAppResponse,
      });
      expect(mediaCheckAppHealthMock).toHaveBeenCalledWith({});
    });

    it('should return unhealthy status when media microservice is unavailable', async () => {
      mediaCheckAppHealthMock.mockReturnValue(throwError(() => new Error('Connection failed')));

      const result = await service.checkMediaMicroserviceHealth();

      expect(result).toEqual({
        appHealth: { serving: false, message: 'Media microservice app is unavailable' },
      });
    });
  });
});

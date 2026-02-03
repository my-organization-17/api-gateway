import { Test, TestingModule } from '@nestjs/testing';

import { HealthCheckController } from '../health-check.controller';
import { HealthCheckService } from '../health-check.service';

describe('HealthCheckController', () => {
  let controller: HealthCheckController;

  const mockMenuHealth = {
    appHealth: { serving: true, message: 'Menu microservice app is healthy' },
    dbHealth: { serving: true, message: 'Menu microservice database is healthy' },
  };

  const mockUserHealth = {
    appHealth: { serving: true, message: 'User microservice app is healthy' },
    dbHealth: { serving: true, message: 'User microservice database is healthy' },
  };

  const mockNotificationHealth = {
    serving: true,
    message: 'Notification microservice is healthy',
  };

  const checkMenuMicroserviceHealthMock = jest.fn();
  const checkUserMicroserviceHealthMock = jest.fn();
  const checkNotificationMicroserviceHealthMock = jest.fn();

  beforeEach(async () => {
    checkMenuMicroserviceHealthMock.mockResolvedValue(mockMenuHealth);
    checkUserMicroserviceHealthMock.mockResolvedValue(mockUserHealth);
    checkNotificationMicroserviceHealthMock.mockResolvedValue(mockNotificationHealth);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthCheckController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            checkMenuMicroserviceHealth: checkMenuMicroserviceHealthMock,
            checkUserMicroserviceHealth: checkUserMicroserviceHealthMock,
            checkNotificationMicroserviceHealth: checkNotificationMicroserviceHealthMock,
          },
        },
      ],
    }).compile();

    controller = module.get<HealthCheckController>(HealthCheckController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return health status of all microservices', async () => {
      const result = await controller.checkHealth();

      expect(result).toEqual({
        menuMicroservice: mockMenuHealth,
        userMicroservice: mockUserHealth,
        notificationMicroservice: mockNotificationHealth,
      });
      expect(checkMenuMicroserviceHealthMock).toHaveBeenCalled();
      expect(checkUserMicroserviceHealthMock).toHaveBeenCalled();
      expect(checkNotificationMicroserviceHealthMock).toHaveBeenCalled();
    });

    it('should return unhealthy status when microservices are down', async () => {
      const unhealthyMenuHealth = {
        appHealth: { serving: false, message: 'Menu microservice app is unavailable' },
        dbHealth: { serving: false, message: 'Menu microservice database is unavailable' },
      };
      const unhealthyUserHealth = {
        appHealth: { serving: false, message: 'User microservice app is unavailable' },
        dbHealth: { serving: false, message: 'User microservice database is unavailable' },
      };
      const unhealthyNotificationHealth = {
        serving: false,
        message: 'Notification microservice app is unavailable',
      };

      checkMenuMicroserviceHealthMock.mockResolvedValue(unhealthyMenuHealth);
      checkUserMicroserviceHealthMock.mockResolvedValue(unhealthyUserHealth);
      checkNotificationMicroserviceHealthMock.mockResolvedValue(unhealthyNotificationHealth);

      const result = await controller.checkHealth();

      expect(result).toEqual({
        menuMicroservice: unhealthyMenuHealth,
        userMicroservice: unhealthyUserHealth,
        notificationMicroservice: unhealthyNotificationHealth,
      });
    });
  });
});

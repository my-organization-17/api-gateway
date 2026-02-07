import { Test, TestingModule } from '@nestjs/testing';

import { HealthCheckController } from '../health-check.controller';
import { HealthCheckService } from '../health-check.service';

describe('HealthCheckController', () => {
  let controller: HealthCheckController;

  const mockMenuHealth = { serving: true, message: 'Menu microservice app is healthy' };
  const mockUserHealth = { serving: true, message: 'User microservice app is healthy' };
  const mockNotificationHealth = { serving: true, message: 'Notification microservice is healthy' };
  const mockMediaHealth = { serving: true, message: 'Media microservice app is healthy' };

  const unhealthyMenuHealth = { serving: false, message: 'Menu microservice app is unavailable' };
  const unhealthyUserHealth = { serving: false, message: 'User microservice app is unavailable' };
  const unhealthyNotificationHealth = { serving: false, message: 'Notification microservice app is unavailable' };
  const unhealthyMediaHealth = { serving: false, message: 'Media microservice app is unavailable' };

  const checkAllMicroservicesHealthMock = jest.fn();

  beforeEach(async () => {
    checkAllMicroservicesHealthMock.mockResolvedValue({
      menuMicroservice: mockMenuHealth,
      userMicroservice: mockUserHealth,
      notificationMicroservice: mockNotificationHealth,
      mediaMicroservice: mockMediaHealth,
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthCheckController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            checkAllMicroservicesHealth: checkAllMicroservicesHealthMock,
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
        mediaMicroservice: mockMediaHealth,
      });
      expect(checkAllMicroservicesHealthMock).toHaveBeenCalled();
    });

    it('should return unhealthy status when microservices are down', async () => {
      checkAllMicroservicesHealthMock.mockResolvedValue({
        menuMicroservice: unhealthyMenuHealth,
        userMicroservice: unhealthyUserHealth,
        notificationMicroservice: unhealthyNotificationHealth,
        mediaMicroservice: unhealthyMediaHealth,
      });

      const result = await controller.checkHealth();

      expect(result).toEqual({
        menuMicroservice: unhealthyMenuHealth,
        userMicroservice: unhealthyUserHealth,
        notificationMicroservice: unhealthyNotificationHealth,
        mediaMicroservice: unhealthyMediaHealth,
      });
      expect(checkAllMicroservicesHealthMock).toHaveBeenCalled();
    });
  });
});

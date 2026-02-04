import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom, of } from 'rxjs';

import { MenuItemService } from '../menu-item.service';
import type {
  MenuItem,
  MenuItemList,
  StatusResponse,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
} from 'src/generated-types/menu-item';

describe('MenuItemService', () => {
  let service: MenuItemService;

  const mockMenuItem: MenuItem = {
    id: 'test-item-id',
    language: 'EN',
    title: 'Test Menu Item',
    description: 'Test description',
    price: '10.99',
    imageUrl: 'https://example.com/image.jpg',
    isAvailable: true,
    position: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMenuItemList: MenuItemList = {
    menuItems: [mockMenuItem],
  };

  const mockStatusResponse: StatusResponse = {
    success: true,
    message: 'Operation successful',
  };

  const getMenuItemsByCategoryIdMock = jest.fn();
  const getMenuItemByIdMock = jest.fn();
  const createMenuItemMock = jest.fn();
  const updateMenuItemMock = jest.fn();
  const deleteMenuItemMock = jest.fn();
  const changeMenuItemPositionMock = jest.fn();

  beforeEach(async () => {
    getMenuItemsByCategoryIdMock.mockReturnValue(of(mockMenuItemList));
    getMenuItemByIdMock.mockReturnValue(of(mockMenuItem));
    createMenuItemMock.mockReturnValue(of(mockMenuItem));
    updateMenuItemMock.mockReturnValue(of(mockMenuItem));
    deleteMenuItemMock.mockReturnValue(of(mockStatusResponse));
    changeMenuItemPositionMock.mockReturnValue(of(mockMenuItem));

    const mockMenuItemServiceClient = {
      getMenuItemsByCategoryId: getMenuItemsByCategoryIdMock,
      getMenuItemById: getMenuItemByIdMock,
      createMenuItem: createMenuItemMock,
      updateMenuItem: updateMenuItemMock,
      deleteMenuItem: deleteMenuItemMock,
      changeMenuItemPosition: changeMenuItemPositionMock,
    };

    const mockGrpcClient = {
      getService: jest.fn().mockReturnValue(mockMenuItemServiceClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuItemService,
        {
          provide: 'MENU_ITEM_CLIENT',
          useValue: mockGrpcClient,
        },
      ],
    }).compile();

    service = module.get<MenuItemService>(MenuItemService);
    service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMenuItemsByCategoryId', () => {
    it('should call menuItemService.getMenuItemsByCategoryId with correct id', async () => {
      const categoryId = 'test-category-id';

      const result = await firstValueFrom(service.getMenuItemsByCategoryId(categoryId));

      expect(result).toEqual(mockMenuItemList);
      expect(getMenuItemsByCategoryIdMock).toHaveBeenCalledWith({ id: categoryId });
    });
  });

  describe('getMenuItemById', () => {
    it('should call menuItemService.getMenuItemById with correct id', async () => {
      const id = 'test-item-id';

      const result = await firstValueFrom(service.getMenuItemById(id));

      expect(result).toEqual(mockMenuItem);
      expect(getMenuItemByIdMock).toHaveBeenCalledWith({ id });
    });
  });

  describe('createMenuItem', () => {
    it('should call menuItemService.createMenuItem with correct data', async () => {
      const createData: CreateMenuItemRequest = {
        language: 'EN',
        title: 'New Menu Item',
        description: 'New description',
        price: '15.99',
        imageUrl: 'https://example.com/new-image.jpg',
        isAvailable: true,
        menuCategory: { id: 'category-id' },
      };

      const result = await firstValueFrom(service.createMenuItem(createData));

      expect(result).toEqual(mockMenuItem);
      expect(createMenuItemMock).toHaveBeenCalledWith(createData);
    });
  });

  describe('updateMenuItem', () => {
    it('should call menuItemService.updateMenuItem with correct data', async () => {
      const updateData: UpdateMenuItemRequest = {
        id: 'test-item-id',
        language: 'EN',
        title: 'Updated Menu Item',
        description: 'Updated description',
        price: '19.99',
        imageUrl: 'https://example.com/updated-image.jpg',
        isAvailable: true,
      };

      const result = await firstValueFrom(service.updateMenuItem(updateData));

      expect(result).toEqual(mockMenuItem);
      expect(updateMenuItemMock).toHaveBeenCalledWith(updateData);
    });
  });

  describe('deleteMenuItem', () => {
    it('should call menuItemService.deleteMenuItem with correct id', async () => {
      const id = 'test-item-id';

      const result = await firstValueFrom(service.deleteMenuItem(id));

      expect(result).toEqual(mockStatusResponse);
      expect(deleteMenuItemMock).toHaveBeenCalledWith({ id });
    });
  });

  describe('changeMenuItemPosition', () => {
    it('should call menuItemService.changeMenuItemPosition with correct id and position', async () => {
      const id = 'test-item-id';
      const position = 5;

      const result = await firstValueFrom(service.changeMenuItemPosition({ id, position }));

      expect(result).toEqual(mockMenuItem);
      expect(changeMenuItemPositionMock).toHaveBeenCalledWith({ id, position });
    });
  });
});

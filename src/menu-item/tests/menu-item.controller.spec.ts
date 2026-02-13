import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom, of } from 'rxjs';

import { MenuItemController } from '../menu-item.controller';
import { MenuItemService } from '../menu-item.service';
import type {
  MenuItem,
  MenuItemListWithTranslation,
  MenuItemWithTranslation,
  StatusResponse,
} from 'src/generated-types/menu-item';

describe('MenuItemController', () => {
  let controller: MenuItemController;

  const mockMenuItem: MenuItem = {
    id: 'test-item-id',
    slug: 'test-menu-item',
    price: '10.99',
    imageUrl: 'https://example.com/image.jpg',
    isAvailable: true,
    position: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMenuItemWithTranslation: MenuItemWithTranslation = {
    id: 'test-item-id',
    slug: 'test-menu-item',
    price: '10.99',
    imageUrl: 'https://example.com/image.jpg',
    isAvailable: true,
    position: 1,
    translations: [{ id: 'tr-1', title: 'Test Menu Item', description: 'Test description', language: 'EN' }],
  };

  const mockMenuItemList: MenuItemListWithTranslation = {
    menuItems: [mockMenuItemWithTranslation],
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
    getMenuItemByIdMock.mockReturnValue(of(mockMenuItemWithTranslation));
    createMenuItemMock.mockReturnValue(of(mockMenuItem));
    updateMenuItemMock.mockReturnValue(of(mockMenuItem));
    deleteMenuItemMock.mockReturnValue(of(mockStatusResponse));
    changeMenuItemPositionMock.mockReturnValue(of(mockMenuItem));

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuItemController],
      providers: [
        {
          provide: MenuItemService,
          useValue: {
            getMenuItemsByCategoryId: getMenuItemsByCategoryIdMock,
            getMenuItemById: getMenuItemByIdMock,
            createMenuItem: createMenuItemMock,
            updateMenuItem: updateMenuItemMock,
            deleteMenuItem: deleteMenuItemMock,
            changeMenuItemPosition: changeMenuItemPositionMock,
          },
        },
      ],
    }).compile();

    controller = module.get<MenuItemController>(MenuItemController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMenuItemsByCategoryId', () => {
    it('should call menuItemService.getMenuItemsByCategoryId with correct category id', async () => {
      const categoryId = 'test-category-id';

      const result = await firstValueFrom(controller.getMenuItemsByCategoryId(categoryId));

      expect(result).toEqual(mockMenuItemList);
      expect(getMenuItemsByCategoryIdMock).toHaveBeenCalledWith(categoryId);
    });
  });

  describe('getMenuItemById', () => {
    it('should call menuItemService.getMenuItemById with correct id', async () => {
      const id = 'test-item-id';

      const result = await firstValueFrom(controller.getMenuItemById(id));

      expect(result).toEqual(mockMenuItemWithTranslation);
      expect(getMenuItemByIdMock).toHaveBeenCalledWith(id);
    });
  });

  describe('createMenuItem', () => {
    it('should call menuItemService.createMenuItem with correct data', async () => {
      const createData = {
        slug: 'new-menu-item',
        price: '15.99',
        imageUrl: 'https://example.com/new-image.jpg',
        isAvailable: true,
        categoryId: 'category-id',
      };

      const result = await firstValueFrom(controller.createMenuItem(createData));

      expect(result).toEqual(mockMenuItem);
      expect(createMenuItemMock).toHaveBeenCalledWith(createData);
    });
  });

  describe('updateMenuItem', () => {
    it('should call menuItemService.updateMenuItem with correct data', async () => {
      const updateData = {
        id: 'test-item-id',
        slug: 'updated-menu-item',
        price: '19.99',
        imageUrl: 'https://example.com/updated-image.jpg',
        isAvailable: true,
      };

      const result = await firstValueFrom(controller.updateMenuItem(updateData));

      expect(result).toEqual(mockMenuItem);
      expect(updateMenuItemMock).toHaveBeenCalledWith(updateData);
    });
  });

  describe('deleteMenuItem', () => {
    it('should call menuItemService.deleteMenuItem with correct id', async () => {
      const id = 'test-item-id';

      const result = await firstValueFrom(controller.deleteMenuItem(id));

      expect(result).toEqual(mockStatusResponse);
      expect(deleteMenuItemMock).toHaveBeenCalledWith(id);
    });
  });

  describe('changeMenuItemPosition', () => {
    it('should call menuItemService.changeMenuItemPosition with correct id and position', async () => {
      const id = 'test-item-id';
      const position = 5;

      const result = await firstValueFrom(controller.changeMenuItemPosition(id, { position }));

      expect(result).toEqual(mockMenuItem);
      expect(changeMenuItemPositionMock).toHaveBeenCalledWith({ id, position });
    });
  });
});

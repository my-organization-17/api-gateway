import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom, of } from 'rxjs';

import { MenuCategoryController } from '../menu-category.controller';
import { MenuCategoryService } from '../menu-category.service';
import { Language } from 'src/common/enums';
import type { MenuCategory, MenuCategoryList, StatusResponse } from 'src/generated-types/menu-category';

describe('MenuCategoryController', () => {
  let controller: MenuCategoryController;

  const mockMenuCategory: MenuCategory = {
    id: 'test-category-id',
    language: 'EN',
    title: 'Test Category',
    description: 'Test description',
    position: 1,
    imageUrl: 'https://example.com/image.jpg',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMenuCategoryList: MenuCategoryList = {
    data: [mockMenuCategory],
  };

  const mockStatusResponse: StatusResponse = {
    success: true,
    message: 'Operation successful',
  };

  const getMenuCategoriesByLanguageMock = jest.fn();
  const getMenuCategoryByIdMock = jest.fn();
  const createMenuCategoryMock = jest.fn();
  const updateMenuCategoryMock = jest.fn();
  const changeMenuCategoryPositionMock = jest.fn();
  const deleteMenuCategoryMock = jest.fn();

  beforeEach(async () => {
    getMenuCategoriesByLanguageMock.mockReturnValue(of(mockMenuCategoryList));
    getMenuCategoryByIdMock.mockReturnValue(of(mockMenuCategory));
    createMenuCategoryMock.mockReturnValue(of(mockMenuCategory));
    updateMenuCategoryMock.mockReturnValue(of(mockMenuCategory));
    changeMenuCategoryPositionMock.mockReturnValue(of(mockMenuCategory));
    deleteMenuCategoryMock.mockReturnValue(of(mockStatusResponse));

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuCategoryController],
      providers: [
        {
          provide: MenuCategoryService,
          useValue: {
            getMenuCategoriesByLanguage: getMenuCategoriesByLanguageMock,
            getMenuCategoryById: getMenuCategoryByIdMock,
            createMenuCategory: createMenuCategoryMock,
            updateMenuCategory: updateMenuCategoryMock,
            changeMenuCategoryPosition: changeMenuCategoryPositionMock,
            deleteMenuCategory: deleteMenuCategoryMock,
          },
        },
      ],
    }).compile();

    controller = module.get<MenuCategoryController>(MenuCategoryController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMenuCategoriesByLanguage', () => {
    it('should call menuCategoryService.getMenuCategoriesByLanguage with correct language', async () => {
      const result = await firstValueFrom(controller.getMenuCategoriesByLanguage(Language.EN));

      expect(result).toEqual(mockMenuCategoryList);
      expect(getMenuCategoriesByLanguageMock).toHaveBeenCalledWith(Language.EN);
    });
  });

  describe('getMenuCategoryById', () => {
    it('should call menuCategoryService.getMenuCategoryById with correct id', async () => {
      const id = 'test-category-id';

      const result = await firstValueFrom(controller.getMenuCategoryById(id));

      expect(result).toEqual(mockMenuCategory);
      expect(getMenuCategoryByIdMock).toHaveBeenCalledWith(id);
    });
  });

  describe('createMenuCategory', () => {
    it('should call menuCategoryService.createMenuCategory with correct data', async () => {
      const createData = {
        language: Language.EN,
        title: 'New Category',
        description: 'New description',
        imageUrl: 'https://example.com/image.jpg',
        isAvailable: true,
      };

      const result = await firstValueFrom(controller.createMenuCategory(createData));

      expect(result).toEqual(mockMenuCategory);
      expect(createMenuCategoryMock).toHaveBeenCalledWith(createData);
    });
  });

  describe('updateMenuCategory', () => {
    it('should call menuCategoryService.updateMenuCategory with correct id and data', async () => {
      const id = 'test-category-id';
      const updateData = {
        language: Language.EN,
        title: 'Updated Category',
        description: 'Updated description',
        imageUrl: 'https://example.com/updated-image.jpg',
        isAvailable: true,
      };

      const result = await firstValueFrom(controller.updateMenuCategory(id, updateData));

      expect(result).toEqual(mockMenuCategory);
      expect(updateMenuCategoryMock).toHaveBeenCalledWith(id, updateData);
    });
  });

  describe('changeMenuCategoryPosition', () => {
    it('should call menuCategoryService.changeMenuCategoryPosition with correct id and position', async () => {
      const id = 'test-category-id';
      const position = 5;

      const result = await firstValueFrom(controller.changeMenuCategoryPosition(id, { position }));

      expect(result).toEqual(mockMenuCategory);
      expect(changeMenuCategoryPositionMock).toHaveBeenCalledWith(id, position);
    });
  });

  describe('deleteMenuCategory', () => {
    it('should call menuCategoryService.deleteMenuCategory with correct id', async () => {
      const id = 'test-category-id';

      const result = await firstValueFrom(controller.deleteMenuCategory(id));

      expect(result).toEqual(mockStatusResponse);
      expect(deleteMenuCategoryMock).toHaveBeenCalledWith(id);
    });
  });
});

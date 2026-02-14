import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom, of } from 'rxjs';

import { MenuCategoryService } from '../menu-category.service';
import { Language } from 'src/common/enums';
import type {
  MenuCategory,
  MenuCategoryListWithTranslation,
  MenuCategoryWithTranslation,
  FlatMenuCategoryWithItems,
  StatusResponse,
} from 'src/generated-types/menu-category';
import { MetricsService } from 'src/supervision/metrics/metrics.service';

describe('MenuCategoryService', () => {
  let service: MenuCategoryService;

  const mockMenuCategory: MenuCategory = {
    id: 'test-category-id',
    slug: 'test-category',
    position: 1,
    imageUrl: 'https://example.com/image.jpg',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMenuCategoryWithTranslation: MenuCategoryWithTranslation = {
    id: 'test-category-id',
    slug: 'test-category',
    position: 1,
    imageUrl: 'https://example.com/image.jpg',
    isAvailable: true,
    translations: [{ id: 'tr-1', language: 'EN', title: 'Test Category', description: 'Test description' }],
  };

  const mockFlatMenuCategoryWithItems: FlatMenuCategoryWithItems = {
    id: 'test-category-id',
    slug: 'test-category',
    position: 1,
    imageUrl: 'https://example.com/image.jpg',
    isAvailable: true,
    language: 'EN',
    title: 'Test Category',
    description: 'Test description',
    menuItems: [],
  };

  const mockMenuCategoryList: MenuCategoryListWithTranslation = {
    data: [mockMenuCategoryWithTranslation],
  };

  const mockStatusResponse: StatusResponse = {
    success: true,
    message: 'Operation successful',
  };

  const getFullMenuByLanguageMock = jest.fn();
  const getMenuCategoriesByLanguageMock = jest.fn();
  const getMenuCategoryByIdMock = jest.fn();
  const createMenuCategoryMock = jest.fn();
  const updateMenuCategoryMock = jest.fn();
  const changeMenuCategoryPositionMock = jest.fn();
  const deleteMenuCategoryMock = jest.fn();

  const passthrough =
    <T>() =>
    (source: import('rxjs').Observable<T>) =>
      source;

  const mockMetricsService = {
    trackGrpcCall: jest.fn().mockReturnValue(passthrough()),
  };

  beforeEach(async () => {
    getFullMenuByLanguageMock.mockReturnValue(of({ categories: [mockFlatMenuCategoryWithItems] }));
    getMenuCategoriesByLanguageMock.mockReturnValue(of(mockMenuCategoryList));
    getMenuCategoryByIdMock.mockReturnValue(of(mockMenuCategoryWithTranslation));
    createMenuCategoryMock.mockReturnValue(of(mockMenuCategory));
    updateMenuCategoryMock.mockReturnValue(of(mockMenuCategory));
    changeMenuCategoryPositionMock.mockReturnValue(of(mockMenuCategory));
    deleteMenuCategoryMock.mockReturnValue(of(mockStatusResponse));

    const mockMenuCategoryServiceClient = {
      getFullMenuByLanguage: getFullMenuByLanguageMock,
      getMenuCategoriesByLanguage: getMenuCategoriesByLanguageMock,
      getMenuCategoryById: getMenuCategoryByIdMock,
      createMenuCategory: createMenuCategoryMock,
      updateMenuCategory: updateMenuCategoryMock,
      changeMenuCategoryPosition: changeMenuCategoryPositionMock,
      deleteMenuCategory: deleteMenuCategoryMock,
    };

    const mockGrpcClient = {
      getService: jest.fn().mockReturnValue(mockMenuCategoryServiceClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuCategoryService,
        {
          provide: 'MENU_CATEGORY_CLIENT',
          useValue: mockGrpcClient,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    service = module.get<MenuCategoryService>(MenuCategoryService);
    service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFullMenuByLanguage', () => {
    it('should call menuCategoryService.getFullMenuByLanguage with correct language', async () => {
      const result = await firstValueFrom(service.getFullMenuByLanguage('EN'));

      expect(result.categories).toHaveLength(1);
      expect(getFullMenuByLanguageMock).toHaveBeenCalledWith({ language: 'EN' });
    });

    it('should use default language EN when not provided', async () => {
      await firstValueFrom(service.getFullMenuByLanguage());

      expect(getFullMenuByLanguageMock).toHaveBeenCalledWith({ language: 'EN' });
    });
  });

  describe('getMenuCategoriesByLanguage', () => {
    it('should call menuCategoryService.getMenuCategoriesByLanguage with correct language', async () => {
      const result = await firstValueFrom(service.getMenuCategoriesByLanguage('UA'));

      expect(result).toEqual(mockMenuCategoryList);
      expect(getMenuCategoriesByLanguageMock).toHaveBeenCalledWith({ language: 'UA' });
    });

    it('should use default language EN when not provided', async () => {
      await firstValueFrom(service.getMenuCategoriesByLanguage());

      expect(getMenuCategoriesByLanguageMock).toHaveBeenCalledWith({ language: 'EN' });
    });
  });

  describe('getMenuCategoryById', () => {
    it('should call menuCategoryService.getMenuCategoryById with correct id', async () => {
      const id = 'test-category-id';

      const result = await firstValueFrom(service.getMenuCategoryById(id));

      expect(result).toEqual(mockMenuCategoryWithTranslation);
      expect(getMenuCategoryByIdMock).toHaveBeenCalledWith({ id });
    });
  });

  describe('createMenuCategory', () => {
    it('should call menuCategoryService.createMenuCategory with correct data', async () => {
      const createData = {
        slug: 'new-category',
        imageUrl: 'https://example.com/image.jpg',
        isAvailable: true,
      };

      const result = await firstValueFrom(service.createMenuCategory(createData));

      expect(result).toEqual(mockMenuCategory);
      expect(createMenuCategoryMock).toHaveBeenCalledWith(createData);
    });
  });

  describe('updateMenuCategory', () => {
    it('should call menuCategoryService.updateMenuCategory with correct id and data', async () => {
      const id = 'test-category-id';
      const updateData = {
        language: Language.EN,
        slug: 'updated-category',
        imageUrl: 'https://example.com/updated-image.jpg',
        isAvailable: true,
      };

      const result = await firstValueFrom(service.updateMenuCategory(id, updateData));

      expect(result).toEqual(mockMenuCategory);
      expect(updateMenuCategoryMock).toHaveBeenCalledWith({ id, ...updateData });
    });
  });

  describe('changeMenuCategoryPosition', () => {
    it('should call menuCategoryService.changeMenuCategoryPosition with correct id and position', async () => {
      const id = 'test-category-id';
      const position = 5;

      const result = await firstValueFrom(service.changeMenuCategoryPosition(id, position));

      expect(result).toEqual(mockMenuCategory);
      expect(changeMenuCategoryPositionMock).toHaveBeenCalledWith({ id, position });
    });
  });

  describe('deleteMenuCategory', () => {
    it('should call menuCategoryService.deleteMenuCategory with correct id', async () => {
      const id = 'test-category-id';

      const result = await firstValueFrom(service.deleteMenuCategory(id));

      expect(result).toEqual(mockStatusResponse);
      expect(deleteMenuCategoryMock).toHaveBeenCalledWith({ id });
    });
  });
});

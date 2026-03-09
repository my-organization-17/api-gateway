import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom, of } from 'rxjs';

import { StoreCategoryService } from '../store-category.service';
import type {
  ChangeStoreCategoryPositionRequest,
  CreateStoreCategoryRequest,
  Id,
  StoreCategory,
  StoreCategoryList,
  StoreCategoryWithTranslations,
  StatusResponse,
  UpdateStoreCategoryRequest,
} from 'src/generated-types/store-category';
import { Language as GrpcLanguage } from 'src/generated-types/store-item';
import { Language } from 'src/common/enums/language.enum';
import { MetricsService } from 'src/supervision/metrics/metrics.service';
import { UpsertStoreCategoryTranslationDto } from '../dto';

describe('StoreCategoryService', () => {
  let service: StoreCategoryService;

  const mockId: Id = { id: 'test-category-id' };

  const mockStoreCategory: StoreCategory = {
    id: 'test-category-id',
    slug: 'test-category',
    isAvailable: true,
    sortOrder: 1,
  };

  const mockStoreCategoryWithTranslations: StoreCategoryWithTranslations = {
    category: mockStoreCategory,
    translation: [
      {
        id: 'tr-1',
        title: 'Test Category',
        description: 'Test description',
        language: GrpcLanguage.LANGUAGE_EN,
      },
    ],
  };

  const mockStoreCategoryList: StoreCategoryList = {
    data: [
      {
        id: 'test-category-id',
        slug: 'test-category',
        isAvailable: true,
        sortOrder: 1,
        title: 'Test Category',
        description: 'Test description',
      },
    ],
  };

  const mockStatusResponse: StatusResponse = {
    success: true,
    message: 'Operation successful',
  };

  const getStoreCategoriesByLanguageMock = jest.fn();
  const getStoreCategoryByIdMock = jest.fn();
  const createStoreCategoryMock = jest.fn();
  const updateStoreCategoryMock = jest.fn();
  const deleteStoreCategoryMock = jest.fn();
  const changeStoreCategoryPositionMock = jest.fn();
  const upsertStoreCategoryTranslationMock = jest.fn();
  const deleteStoreCategoryTranslationMock = jest.fn();

  const passthrough =
    <T>() =>
    (source: import('rxjs').Observable<T>) =>
      source;

  const mockMetricsService = {
    trackGrpcCall: jest.fn().mockReturnValue(passthrough()),
  };

  beforeEach(async () => {
    getStoreCategoriesByLanguageMock.mockReturnValue(of(mockStoreCategoryList));
    getStoreCategoryByIdMock.mockReturnValue(of(mockStoreCategoryWithTranslations));
    createStoreCategoryMock.mockReturnValue(of(mockId));
    updateStoreCategoryMock.mockReturnValue(of(mockId));
    deleteStoreCategoryMock.mockReturnValue(of(mockStatusResponse));
    changeStoreCategoryPositionMock.mockReturnValue(of(mockStoreCategory));
    upsertStoreCategoryTranslationMock.mockReturnValue(of(mockId));
    deleteStoreCategoryTranslationMock.mockReturnValue(of(mockStatusResponse));

    const mockStoreCategoryServiceClient = {
      getStoreCategoriesByLanguage: getStoreCategoriesByLanguageMock,
      getStoreCategoryById: getStoreCategoryByIdMock,
      createStoreCategory: createStoreCategoryMock,
      updateStoreCategory: updateStoreCategoryMock,
      deleteStoreCategory: deleteStoreCategoryMock,
      changeStoreCategoryPosition: changeStoreCategoryPositionMock,
      upsertStoreCategoryTranslation: upsertStoreCategoryTranslationMock,
      deleteStoreCategoryTranslation: deleteStoreCategoryTranslationMock,
    };

    const mockGrpcClient = {
      getService: jest.fn().mockReturnValue(mockStoreCategoryServiceClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreCategoryService,
        {
          provide: 'STORE_CATEGORY_CLIENT',
          useValue: mockGrpcClient,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    service = module.get<StoreCategoryService>(StoreCategoryService);
    service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStoreCategoriesByLanguage', () => {
    it('should call getStoreCategoriesByLanguage with mapped gRPC language enum for EN', async () => {
      const result = await firstValueFrom(service.getStoreCategoriesByLanguage('EN'));

      expect(result).toEqual(mockStoreCategoryList);
      expect(getStoreCategoriesByLanguageMock).toHaveBeenCalledWith({ language: 1 });
    });

    it('should default to EN (language: 1) when no language is provided', async () => {
      const result = await firstValueFrom(service.getStoreCategoriesByLanguage());

      expect(result).toEqual(mockStoreCategoryList);
      expect(getStoreCategoriesByLanguageMock).toHaveBeenCalledWith({ language: 1 });
    });

    it('should map UA to language: 2', async () => {
      await firstValueFrom(service.getStoreCategoriesByLanguage('UA'));

      expect(getStoreCategoriesByLanguageMock).toHaveBeenCalledWith({ language: 2 });
    });

    it('should map RU to language: 3', async () => {
      await firstValueFrom(service.getStoreCategoriesByLanguage('RU'));

      expect(getStoreCategoriesByLanguageMock).toHaveBeenCalledWith({ language: 3 });
    });
  });

  describe('getStoreCategoryById', () => {
    it('should call getStoreCategoryById with correct id', async () => {
      const id = 'test-category-id';

      const result = await firstValueFrom(service.getStoreCategoryById(id));

      expect(result).toEqual(mockStoreCategoryWithTranslations);
      expect(getStoreCategoryByIdMock).toHaveBeenCalledWith({ id });
    });
  });

  describe('createStoreCategory', () => {
    it('should call createStoreCategory with correct data', async () => {
      const createData: CreateStoreCategoryRequest = {
        slug: 'new-category',
        isAvailable: true,
        sortOrder: 1,
      };

      const result = await firstValueFrom(service.createStoreCategory(createData));

      expect(result).toEqual(mockId);
      expect(createStoreCategoryMock).toHaveBeenCalledWith(createData);
    });
  });

  describe('updateStoreCategory', () => {
    it('should call updateStoreCategory with correct data', async () => {
      const updateData: UpdateStoreCategoryRequest = {
        id: 'test-category-id',
        slug: 'updated-category',
        isAvailable: false,
      };

      const result = await firstValueFrom(service.updateStoreCategory(updateData));

      expect(result).toEqual(mockId);
      expect(updateStoreCategoryMock).toHaveBeenCalledWith(updateData);
    });
  });

  describe('deleteStoreCategory', () => {
    it('should call deleteStoreCategory with correct id', async () => {
      const id = 'test-category-id';

      const result = await firstValueFrom(service.deleteStoreCategory(id));

      expect(result).toEqual(mockStatusResponse);
      expect(deleteStoreCategoryMock).toHaveBeenCalledWith({ id });
    });
  });

  describe('changeStoreCategoryPosition', () => {
    it('should call changeStoreCategoryPosition with correct data', async () => {
      const data: ChangeStoreCategoryPositionRequest = {
        id: 'test-category-id',
        sortOrder: 5,
      };

      const result = await firstValueFrom(service.changeStoreCategoryPosition(data));

      expect(result).toEqual(mockStoreCategory);
      expect(changeStoreCategoryPositionMock).toHaveBeenCalledWith(data);
    });
  });

  describe('upsertStoreCategoryTranslation', () => {
    it('should call upsertStoreCategoryTranslation with language mapped to gRPC enum', async () => {
      const data: UpsertStoreCategoryTranslationDto = {
        categoryId: 'test-category-id',
        title: 'Test Category',
        description: 'Test description',
        language: Language.EN,
      };

      const result = await firstValueFrom(service.upsertStoreCategoryTranslation(data));

      expect(result).toEqual(mockId);
      expect(upsertStoreCategoryTranslationMock).toHaveBeenCalledWith({
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        language: 1,
      });
    });

    it('should map UA language string to gRPC enum value 2', async () => {
      const data: UpsertStoreCategoryTranslationDto = {
        categoryId: 'test-category-id',
        title: 'Test Category UA',
        description: 'Test description UA',
        language: Language.UA,
      };

      await firstValueFrom(service.upsertStoreCategoryTranslation(data));

      expect(upsertStoreCategoryTranslationMock).toHaveBeenCalledWith(expect.objectContaining({ language: 2 }));
    });
  });

  describe('deleteStoreCategoryTranslation', () => {
    it('should call deleteStoreCategoryTranslation with correct id', async () => {
      const id = 'test-translation-id';

      const result = await firstValueFrom(service.deleteStoreCategoryTranslation(id));

      expect(result).toEqual(mockStatusResponse);
      expect(deleteStoreCategoryTranslationMock).toHaveBeenCalledWith({ id });
    });
  });
});

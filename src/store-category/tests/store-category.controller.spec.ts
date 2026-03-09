import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom, of } from 'rxjs';

import { StoreCategoryAdminController } from '../store-category-admin.controller';
import { StoreCategoryPublicController } from '../store-category-public.controller';
import { StoreCategoryService } from '../store-category.service';
import { Language } from 'src/common/enums/language.enum';
import type {
  Id,
  StoreCategory,
  StoreCategoryList,
  StoreCategoryWithTranslations,
  StatusResponse,
} from 'src/generated-types/store-category';
import { Language as GrpcLanguage } from 'src/generated-types/store-item';
import { CreateStoreCategoryDto, UpdateStoreCategoryDto, UpsertStoreCategoryTranslationDto } from '../dto';

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

describe('StoreCategoryPublicController', () => {
  let controller: StoreCategoryPublicController;

  const getStoreCategoriesByLanguageMock = jest.fn();

  beforeEach(async () => {
    getStoreCategoriesByLanguageMock.mockReturnValue(of(mockStoreCategoryList));

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreCategoryPublicController],
      providers: [
        {
          provide: StoreCategoryService,
          useValue: {
            getStoreCategoriesByLanguage: getStoreCategoriesByLanguageMock,
          },
        },
      ],
    }).compile();

    controller = module.get<StoreCategoryPublicController>(StoreCategoryPublicController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllStoreCategoriesByLanguage', () => {
    it('should call storeCategoryService.getStoreCategoriesByLanguage with correct language', async () => {
      const result = await firstValueFrom(controller.getAllStoreCategoriesByLanguage(Language.EN));

      expect(result).toEqual(mockStoreCategoryList);
      expect(getStoreCategoriesByLanguageMock).toHaveBeenCalledWith(Language.EN);
    });
  });
});

describe('StoreCategoryAdminController', () => {
  let controller: StoreCategoryAdminController;

  const getStoreCategoryByIdMock = jest.fn();
  const createStoreCategoryMock = jest.fn();
  const updateStoreCategoryMock = jest.fn();
  const deleteStoreCategoryMock = jest.fn();
  const changeStoreCategoryPositionMock = jest.fn();
  const upsertStoreCategoryTranslationMock = jest.fn();
  const deleteStoreCategoryTranslationMock = jest.fn();

  beforeEach(async () => {
    getStoreCategoryByIdMock.mockReturnValue(of(mockStoreCategoryWithTranslations));
    createStoreCategoryMock.mockReturnValue(of(mockId));
    updateStoreCategoryMock.mockReturnValue(of(mockId));
    deleteStoreCategoryMock.mockReturnValue(of(mockStatusResponse));
    changeStoreCategoryPositionMock.mockReturnValue(of(mockStoreCategory));
    upsertStoreCategoryTranslationMock.mockReturnValue(of(mockId));
    deleteStoreCategoryTranslationMock.mockReturnValue(of(mockStatusResponse));

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreCategoryAdminController],
      providers: [
        {
          provide: StoreCategoryService,
          useValue: {
            getStoreCategoryById: getStoreCategoryByIdMock,
            createStoreCategory: createStoreCategoryMock,
            updateStoreCategory: updateStoreCategoryMock,
            deleteStoreCategory: deleteStoreCategoryMock,
            changeStoreCategoryPosition: changeStoreCategoryPositionMock,
            upsertStoreCategoryTranslation: upsertStoreCategoryTranslationMock,
            deleteStoreCategoryTranslation: deleteStoreCategoryTranslationMock,
          },
        },
      ],
    }).compile();

    controller = module.get<StoreCategoryAdminController>(StoreCategoryAdminController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStoreCategoryById', () => {
    it('should call storeCategoryService.getStoreCategoryById with correct id', async () => {
      const id = 'test-category-id';

      const result = await firstValueFrom(controller.getStoreCategoryById(id));

      expect(result).toEqual(mockStoreCategoryWithTranslations);
      expect(getStoreCategoryByIdMock).toHaveBeenCalledWith(id);
    });
  });

  describe('createStoreCategory', () => {
    it('should call storeCategoryService.createStoreCategory with correct data', async () => {
      const createData: CreateStoreCategoryDto = {
        slug: 'new-category',
        isAvailable: true,
        sortOrder: 1,
      };

      const result = await firstValueFrom(controller.createStoreCategory(createData));

      expect(result).toEqual(mockId);
      expect(createStoreCategoryMock).toHaveBeenCalledWith(createData);
    });
  });

  describe('updateStoreCategory', () => {
    it('should call storeCategoryService.updateStoreCategory with correct data', async () => {
      const updateData: UpdateStoreCategoryDto = {
        id: 'test-category-id',
        slug: 'updated-category',
        isAvailable: false,
      };

      const result = await firstValueFrom(controller.updateStoreCategory(updateData));

      expect(result).toEqual(mockId);
      expect(updateStoreCategoryMock).toHaveBeenCalledWith(updateData);
    });
  });

  describe('deleteStoreCategory', () => {
    it('should call storeCategoryService.deleteStoreCategory with correct id', async () => {
      const id = 'test-category-id';

      const result = await firstValueFrom(controller.deleteStoreCategory(id));

      expect(result).toEqual(mockStatusResponse);
      expect(deleteStoreCategoryMock).toHaveBeenCalledWith(id);
    });
  });

  describe('changeStoreCategoryPosition', () => {
    it('should call storeCategoryService.changeStoreCategoryPosition with id and sortOrder', async () => {
      const id = 'test-category-id';
      const position = 3;

      const result = await firstValueFrom(controller.changeStoreCategoryPosition(id, { position }));

      expect(result).toEqual(mockStoreCategory);
      expect(changeStoreCategoryPositionMock).toHaveBeenCalledWith({ id, sortOrder: position });
    });
  });

  describe('upsertStoreCategoryTranslation', () => {
    it('should call storeCategoryService.upsertStoreCategoryTranslation with correct data', async () => {
      const data: UpsertStoreCategoryTranslationDto = {
        categoryId: 'test-category-id',
        title: 'Test Category',
        description: 'Test description',
        language: Language.EN,
      };

      const result = await firstValueFrom(controller.upsertStoreCategoryTranslation(data));

      expect(result).toEqual(mockId);
      expect(upsertStoreCategoryTranslationMock).toHaveBeenCalledWith(data);
    });
  });

  describe('deleteStoreCategoryTranslation', () => {
    it('should call storeCategoryService.deleteStoreCategoryTranslation with correct id', async () => {
      const id = 'test-translation-id';

      const result = await firstValueFrom(controller.deleteStoreCategoryTranslation(id));

      expect(result).toEqual(mockStatusResponse);
      expect(deleteStoreCategoryTranslationMock).toHaveBeenCalledWith(id);
    });
  });
});

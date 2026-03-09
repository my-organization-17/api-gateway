import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom, of } from 'rxjs';

import { StoreAttributeController } from '../store-attribute.controller';
import { StoreAttributeService } from '../store-attribute.service';
import {
  ChangeStoreAttributePositionDto,
  CreateStoreAttributeDto,
  UpdateStoreAttributeDto,
  UpsertStoreAttributeTranslationDto,
} from '../dto';
import { Language } from 'src/common/enums/language.enum';

import type { AttributeList, AttributeResponse, Id } from 'src/generated-types/store-attribute';

describe('StoreAttributeController', () => {
  let controller: StoreAttributeController;

  const mockId: Id = { id: 'test-attribute-id' };

  const mockAttributeResponse: AttributeResponse = {
    id: 'test-attribute-id',
    categoryId: 'test-category-id',
    slug: 'test-attribute',
    sortOrder: 1,
  };

  const mockAttributeList: AttributeList = {
    data: [
      {
        id: 'test-attribute-id',
        categoryId: 'test-category-id',
        slug: 'test-attribute',
        sortOrder: 1,
        translations: [],
      },
    ],
  };

  const mockStatusResponse = { success: true, message: 'Operation successful' };

  const mockStoreAttributeService = {
    getAttributesByCategoryId: jest.fn(),
    createAttribute: jest.fn(),
    updateAttribute: jest.fn(),
    deleteAttribute: jest.fn(),
    changeAttributePosition: jest.fn(),
    upsertAttributeTranslation: jest.fn(),
    deleteAttributeTranslation: jest.fn(),
  };

  beforeEach(async () => {
    mockStoreAttributeService.getAttributesByCategoryId.mockReturnValue(of(mockAttributeList));
    mockStoreAttributeService.createAttribute.mockReturnValue(of(mockId));
    mockStoreAttributeService.updateAttribute.mockReturnValue(of(mockId));
    mockStoreAttributeService.deleteAttribute.mockReturnValue(of(mockStatusResponse));
    mockStoreAttributeService.changeAttributePosition.mockReturnValue(of(mockAttributeResponse));
    mockStoreAttributeService.upsertAttributeTranslation.mockReturnValue(of(mockId));
    mockStoreAttributeService.deleteAttributeTranslation.mockReturnValue(of(mockStatusResponse));

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreAttributeController],
      providers: [
        {
          provide: StoreAttributeService,
          useValue: mockStoreAttributeService,
        },
      ],
    }).compile();

    controller = module.get<StoreAttributeController>(StoreAttributeController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAttributesByCategoryId', () => {
    it('should call service with the category ID and return attribute list', async () => {
      const categoryId = 'test-category-id';

      const result = await firstValueFrom(controller.getAttributesByCategoryId(categoryId));

      expect(result).toEqual(mockAttributeList);
      expect(mockStoreAttributeService.getAttributesByCategoryId).toHaveBeenCalledWith(categoryId);
    });
  });

  describe('createAttribute', () => {
    it('should call service with create dto and return id', async () => {
      const dto: CreateStoreAttributeDto = {
        categoryId: 'test-category-id',
        slug: 'new-attribute',
      };

      const result = await firstValueFrom(controller.createAttribute(dto));

      expect(result).toEqual(mockId);
      expect(mockStoreAttributeService.createAttribute).toHaveBeenCalledWith(dto);
    });
  });

  describe('updateAttribute', () => {
    it('should call service with update dto and return id', async () => {
      const dto: UpdateStoreAttributeDto = {
        id: 'test-attribute-id',
        slug: 'updated-attribute',
      };

      const result = await firstValueFrom(controller.updateAttribute(dto));

      expect(result).toEqual(mockId);
      expect(mockStoreAttributeService.updateAttribute).toHaveBeenCalledWith(dto);
    });
  });

  describe('deleteAttribute', () => {
    it('should call service with the attribute ID and return status response', async () => {
      const id = 'test-attribute-id';

      const result = await firstValueFrom(controller.deleteAttribute(id));

      expect(result).toEqual(mockStatusResponse);
      expect(mockStoreAttributeService.deleteAttribute).toHaveBeenCalledWith(id);
    });
  });

  describe('changeAttributePosition', () => {
    it('should call service with position dto and return updated attribute', async () => {
      const dto: ChangeStoreAttributePositionDto = {
        id: 'test-attribute-id',
        sortOrder: 3,
      };

      const result = await firstValueFrom(controller.changeAttributePosition(dto));

      expect(result).toEqual(mockAttributeResponse);
      expect(mockStoreAttributeService.changeAttributePosition).toHaveBeenCalledWith(dto);
    });
  });

  describe('upsertAttributeTranslation', () => {
    it('should call service with translation dto and return id', async () => {
      const dto: UpsertStoreAttributeTranslationDto = {
        attributeId: 'test-attribute-id',
        name: 'Test Attribute',
        language: Language.EN,
      };

      const result = await firstValueFrom(controller.upsertAttributeTranslation(dto));

      expect(result).toEqual(mockId);
      expect(mockStoreAttributeService.upsertAttributeTranslation).toHaveBeenCalledWith(dto);
    });
  });

  describe('deleteAttributeTranslation', () => {
    it('should call service with the translation ID and return status response', async () => {
      const id = 'test-translation-id';

      const result = await firstValueFrom(controller.deleteAttributeTranslation(id));

      expect(result).toEqual(mockStatusResponse);
      expect(mockStoreAttributeService.deleteAttributeTranslation).toHaveBeenCalledWith(id);
    });
  });
});

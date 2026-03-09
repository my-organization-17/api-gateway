import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom, of } from 'rxjs';

import { StoreAttributeService } from '../store-attribute.service';
import type {
  AttributeList,
  AttributeResponse,
  ChangeAttributePositionRequest,
  CreateAttributeRequest,
  Id,
  StatusResponse,
  UpdateAttributeRequest,
} from 'src/generated-types/store-attribute';
import { Language as GrpcLanguage } from 'src/generated-types/store-item';
import { Language } from 'src/common/enums/language.enum';
import { MetricsService } from 'src/supervision/metrics/metrics.service';

describe('StoreAttributeService', () => {
  let service: StoreAttributeService;

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
        translations: [{ id: 'tr-1', language: GrpcLanguage.LANGUAGE_EN, name: 'Test Attribute' }],
      },
    ],
  };

  const mockStatusResponse: StatusResponse = {
    success: true,
    message: 'Operation successful',
  };

  const getAttributesByCategoryIdMock = jest.fn();
  const createAttributeMock = jest.fn();
  const updateAttributeMock = jest.fn();
  const deleteAttributeMock = jest.fn();
  const changeAttributePositionMock = jest.fn();
  const upsertAttributeTranslationMock = jest.fn();
  const deleteAttributeTranslationMock = jest.fn();

  const passthrough =
    <T>() =>
    (source: import('rxjs').Observable<T>) =>
      source;

  const mockMetricsService = {
    trackGrpcCall: jest.fn().mockReturnValue(passthrough()),
  };

  beforeEach(async () => {
    getAttributesByCategoryIdMock.mockReturnValue(of(mockAttributeList));
    createAttributeMock.mockReturnValue(of(mockId));
    updateAttributeMock.mockReturnValue(of(mockId));
    deleteAttributeMock.mockReturnValue(of(mockStatusResponse));
    changeAttributePositionMock.mockReturnValue(of(mockAttributeResponse));
    upsertAttributeTranslationMock.mockReturnValue(of(mockId));
    deleteAttributeTranslationMock.mockReturnValue(of(mockStatusResponse));

    const mockStoreAttributeServiceClient = {
      getAttributesByCategoryId: getAttributesByCategoryIdMock,
      createAttribute: createAttributeMock,
      updateAttribute: updateAttributeMock,
      deleteAttribute: deleteAttributeMock,
      changeAttributePosition: changeAttributePositionMock,
      upsertAttributeTranslation: upsertAttributeTranslationMock,
      deleteAttributeTranslation: deleteAttributeTranslationMock,
    };

    const mockGrpcClient = {
      getService: jest.fn().mockReturnValue(mockStoreAttributeServiceClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreAttributeService,
        {
          provide: 'STORE_ATTRIBUTE_CLIENT',
          useValue: mockGrpcClient,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    service = module.get<StoreAttributeService>(StoreAttributeService);
    service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAttributesByCategoryId', () => {
    it('should call storeAttributeService.getAttributesByCategoryId with correct categoryId', async () => {
      const categoryId = 'test-category-id';

      const result = await firstValueFrom(service.getAttributesByCategoryId(categoryId));

      expect(result).toEqual(mockAttributeList);
      expect(getAttributesByCategoryIdMock).toHaveBeenCalledWith({ categoryId });
    });
  });

  describe('createAttribute', () => {
    it('should call storeAttributeService.createAttribute with correct data', async () => {
      const createData: CreateAttributeRequest = {
        categoryId: 'test-category-id',
        slug: 'new-attribute',
      };

      const result = await firstValueFrom(service.createAttribute(createData));

      expect(result).toEqual(mockId);
      expect(createAttributeMock).toHaveBeenCalledWith(createData);
    });
  });

  describe('updateAttribute', () => {
    it('should call storeAttributeService.updateAttribute with correct data', async () => {
      const updateData: UpdateAttributeRequest = {
        id: 'test-attribute-id',
        slug: 'updated-attribute',
      };

      const result = await firstValueFrom(service.updateAttribute(updateData));

      expect(result).toEqual(mockId);
      expect(updateAttributeMock).toHaveBeenCalledWith(updateData);
    });
  });

  describe('deleteAttribute', () => {
    it('should call storeAttributeService.deleteAttribute with correct id', async () => {
      const id = 'test-attribute-id';

      const result = await firstValueFrom(service.deleteAttribute(id));

      expect(result).toEqual(mockStatusResponse);
      expect(deleteAttributeMock).toHaveBeenCalledWith({ id });
    });
  });

  describe('changeAttributePosition', () => {
    it('should call storeAttributeService.changeAttributePosition with correct data', async () => {
      const data: ChangeAttributePositionRequest = {
        id: 'test-attribute-id',
        sortOrder: 3,
      };

      const result = await firstValueFrom(service.changeAttributePosition(data));

      expect(result).toEqual(mockAttributeResponse);
      expect(changeAttributePositionMock).toHaveBeenCalledWith(data);
    });
  });

  describe('upsertAttributeTranslation', () => {
    it('should call storeAttributeService.upsertAttributeTranslation with correct data', async () => {
      const dto = {
        attributeId: 'test-attribute-id',
        language: Language.EN,
        name: 'Test Attribute',
      };

      const result = await firstValueFrom(service.upsertAttributeTranslation(dto));

      expect(result).toEqual(mockId);
      expect(upsertAttributeTranslationMock).toHaveBeenCalledWith({
        attributeId: dto.attributeId,
        name: dto.name,
        language: GrpcLanguage.LANGUAGE_EN,
      });
    });
  });

  describe('deleteAttributeTranslation', () => {
    it('should call storeAttributeService.deleteAttributeTranslation with correct id', async () => {
      const id = 'test-translation-id';

      const result = await firstValueFrom(service.deleteAttributeTranslation(id));

      expect(result).toEqual(mockStatusResponse);
      expect(deleteAttributeTranslationMock).toHaveBeenCalledWith({ id });
    });
  });
});

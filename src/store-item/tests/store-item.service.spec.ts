import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom, of } from 'rxjs';

import { StoreItemService } from '../store-item.service';
import type {
  AddStoreItemImageRequest,
  AddStoreItemVariantRequest,
  ChangeStoreItemImagePositionRequest,
  ChangeStoreItemPositionRequest,
  Id,
  StatusResponse,
  StoreItemListWithOption,
  StoreItemWithOption,
} from 'src/generated-types/store-item';
import { MetricsService } from 'src/supervision/metrics/metrics.service';
import { Language } from 'src/common/enums/language.enum';
import { PriceType, Currency } from 'src/common/enums';
import {
  AddStoreItemBasePriceDto,
  AddVariantPriceDto,
  CreateStoreItemDto,
  UpdateStoreItemDto,
  UpsertItemAttributeTranslationDto,
  UpsertStoreItemTranslationDto,
} from '../dto';

describe('StoreItemService', () => {
  let service: StoreItemService;

  const mockId: Id = { id: 'test-item-id' };

  const mockStatusResponse: StatusResponse = {
    success: true,
    message: 'Operation successful',
  };

  const mockStoreItemWithOption: StoreItemWithOption = {
    id: 'test-item-id',
    slug: 'test-item',
    isAvailable: true,
    sortOrder: 1,
    categoryId: 'test-category-id',
    title: 'Test Item',
    images: [],
    variants: [],
    prices: [],
    attributes: [],
  };

  const mockStoreItemList: StoreItemListWithOption = {
    data: [mockStoreItemWithOption],
  };

  const getStoreItemsByCategoryIdWithOptionMock = jest.fn();
  const getStoreItemsByCategorySlugWithOptionMock = jest.fn();
  const getStoreItemByIdMock = jest.fn();
  const createStoreItemMock = jest.fn();
  const updateStoreItemMock = jest.fn();
  const deleteStoreItemMock = jest.fn();
  const upsertStoreItemTranslationMock = jest.fn();
  const deleteStoreItemTranslationMock = jest.fn();
  const addStoreItemImageMock = jest.fn();
  const removeStoreItemImageMock = jest.fn();
  const changeStoreItemImagePositionMock = jest.fn();
  const changeStoreItemPositionMock = jest.fn();
  const addStoreItemVariantMock = jest.fn();
  const removeStoreItemVariantMock = jest.fn();
  const upsertItemAttributeTranslationMock = jest.fn();
  const addVariantPriceMock = jest.fn();
  const removeVariantPriceMock = jest.fn();
  const addStoreItemBasePriceMock = jest.fn();
  const removeStoreItemBasePriceMock = jest.fn();

  const passthrough =
    <T>() =>
    (source: import('rxjs').Observable<T>) =>
      source;

  const mockMetricsService = {
    trackGrpcCall: jest.fn().mockReturnValue(passthrough()),
  };

  beforeEach(async () => {
    getStoreItemsByCategoryIdWithOptionMock.mockReturnValue(of(mockStoreItemList));
    getStoreItemsByCategorySlugWithOptionMock.mockReturnValue(of(mockStoreItemList));
    getStoreItemByIdMock.mockReturnValue(of(mockStoreItemWithOption));
    createStoreItemMock.mockReturnValue(of(mockId));
    updateStoreItemMock.mockReturnValue(of(mockId));
    deleteStoreItemMock.mockReturnValue(of(mockStatusResponse));
    upsertStoreItemTranslationMock.mockReturnValue(of(mockId));
    deleteStoreItemTranslationMock.mockReturnValue(of(mockStatusResponse));
    addStoreItemImageMock.mockReturnValue(of(mockId));
    removeStoreItemImageMock.mockReturnValue(of(mockStatusResponse));
    changeStoreItemImagePositionMock.mockReturnValue(of(mockId));
    changeStoreItemPositionMock.mockReturnValue(of(mockStoreItemWithOption));
    addStoreItemVariantMock.mockReturnValue(of(mockId));
    removeStoreItemVariantMock.mockReturnValue(of(mockStatusResponse));
    upsertItemAttributeTranslationMock.mockReturnValue(of(mockId));
    addVariantPriceMock.mockReturnValue(of(mockId));
    removeVariantPriceMock.mockReturnValue(of(mockStatusResponse));
    addStoreItemBasePriceMock.mockReturnValue(of(mockId));
    removeStoreItemBasePriceMock.mockReturnValue(of(mockStatusResponse));

    const mockStoreItemServiceClient = {
      getStoreItemsByCategoryIdWithOption: getStoreItemsByCategoryIdWithOptionMock,
      getStoreItemsByCategorySlugWithOption: getStoreItemsByCategorySlugWithOptionMock,
      getStoreItemById: getStoreItemByIdMock,
      createStoreItem: createStoreItemMock,
      updateStoreItem: updateStoreItemMock,
      deleteStoreItem: deleteStoreItemMock,
      upsertStoreItemTranslation: upsertStoreItemTranslationMock,
      deleteStoreItemTranslation: deleteStoreItemTranslationMock,
      addStoreItemImage: addStoreItemImageMock,
      removeStoreItemImage: removeStoreItemImageMock,
      changeStoreItemImagePosition: changeStoreItemImagePositionMock,
      changeStoreItemPosition: changeStoreItemPositionMock,
      addStoreItemVariant: addStoreItemVariantMock,
      removeStoreItemVariant: removeStoreItemVariantMock,
      upsertItemAttributeTranslation: upsertItemAttributeTranslationMock,
      addVariantPrice: addVariantPriceMock,
      removeVariantPrice: removeVariantPriceMock,
      addStoreItemBasePrice: addStoreItemBasePriceMock,
      removeStoreItemBasePrice: removeStoreItemBasePriceMock,
    };

    const mockGrpcClient = {
      getService: jest.fn().mockReturnValue(mockStoreItemServiceClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreItemService,
        {
          provide: 'STORE_ITEM_CLIENT',
          useValue: mockGrpcClient,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    service = module.get<StoreItemService>(StoreItemService);
    service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStoreItemsByCategoryIdWithOption', () => {
    it('should call with mapped gRPC language enum for EN', async () => {
      const result = await firstValueFrom(service.getStoreItemsByCategoryIdWithOption('test-category-id', 'EN'));

      expect(result).toEqual(mockStoreItemList);
      expect(getStoreItemsByCategoryIdWithOptionMock).toHaveBeenCalledWith({
        categoryId: 'test-category-id',
        language: 1,
      });
    });

    it('should default to EN (language: 1) when no language provided', async () => {
      await firstValueFrom(service.getStoreItemsByCategoryIdWithOption('test-category-id'));

      expect(getStoreItemsByCategoryIdWithOptionMock).toHaveBeenCalledWith({
        categoryId: 'test-category-id',
        language: 1,
      });
    });

    it('should map UA to language: 2', async () => {
      await firstValueFrom(service.getStoreItemsByCategoryIdWithOption('test-category-id', 'UA'));

      expect(getStoreItemsByCategoryIdWithOptionMock).toHaveBeenCalledWith({
        categoryId: 'test-category-id',
        language: 2,
      });
    });
  });

  describe('getStoreItemsByCategorySlugWithOption', () => {
    it('should call with mapped gRPC language enum for EN', async () => {
      const result = await firstValueFrom(service.getStoreItemsByCategorySlugWithOption('test-category', 'EN'));

      expect(result).toEqual(mockStoreItemList);
      expect(getStoreItemsByCategorySlugWithOptionMock).toHaveBeenCalledWith({
        categorySlug: 'test-category',
        language: 1,
      });
    });

    it('should default to EN (language: 1) when no language provided', async () => {
      await firstValueFrom(service.getStoreItemsByCategorySlugWithOption('test-category'));

      expect(getStoreItemsByCategorySlugWithOptionMock).toHaveBeenCalledWith({
        categorySlug: 'test-category',
        language: 1,
      });
    });
  });

  describe('getStoreItemById', () => {
    it('should call getStoreItemById with correct itemId and language', async () => {
      const result = await firstValueFrom(service.getStoreItemById('test-item-id', 'EN'));

      expect(result).toEqual(mockStoreItemWithOption);
      expect(getStoreItemByIdMock).toHaveBeenCalledWith({ itemId: 'test-item-id', language: 1 });
    });

    it('should default to EN (language: 1) when no language provided', async () => {
      await firstValueFrom(service.getStoreItemById('test-item-id'));

      expect(getStoreItemByIdMock).toHaveBeenCalledWith({ itemId: 'test-item-id', language: 1 });
    });
  });

  describe('createStoreItem', () => {
    it('should call createStoreItem with correct data without expectedDate', async () => {
      const dto: CreateStoreItemDto = {
        categoryId: 'test-category-id',
        slug: 'new-item',
        isAvailable: true,
      };

      const result = await firstValueFrom(service.createStoreItem(dto));

      expect(result).toEqual(mockId);
      expect(createStoreItemMock).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryId: dto.categoryId,
          slug: dto.slug,
          isAvailable: dto.isAvailable,
          expectedDate: undefined,
        }),
      );
    });

    it('should convert expectedDate string to Date object', async () => {
      const dateStr = '2026-06-01T00:00:00.000Z';
      const dto: CreateStoreItemDto = {
        categoryId: 'test-category-id',
        slug: 'new-item',
        expectedDate: dateStr,
      };

      await firstValueFrom(service.createStoreItem(dto));

      expect(createStoreItemMock).toHaveBeenCalledWith(expect.objectContaining({ expectedDate: new Date(dateStr) }));
    });
  });

  describe('updateStoreItem', () => {
    it('should call updateStoreItem with correct data without expectedDate', async () => {
      const dto: UpdateStoreItemDto = {
        itemId: 'test-item-id',
        slug: 'updated-item',
        isAvailable: false,
      };

      const result = await firstValueFrom(service.updateStoreItem(dto));

      expect(result).toEqual(mockId);
      expect(updateStoreItemMock).toHaveBeenCalledWith(
        expect.objectContaining({
          itemId: dto.itemId,
          slug: dto.slug,
          isAvailable: dto.isAvailable,
          expectedDate: undefined,
        }),
      );
    });

    it('should convert expectedDate string to Date object', async () => {
      const dateStr = '2026-12-31T00:00:00.000Z';
      const dto: UpdateStoreItemDto = {
        itemId: 'test-item-id',
        expectedDate: dateStr,
      };

      await firstValueFrom(service.updateStoreItem(dto));

      expect(updateStoreItemMock).toHaveBeenCalledWith(expect.objectContaining({ expectedDate: new Date(dateStr) }));
    });
  });

  describe('deleteStoreItem', () => {
    it('should call deleteStoreItem with correct id', async () => {
      const result = await firstValueFrom(service.deleteStoreItem('test-item-id'));

      expect(result).toEqual(mockStatusResponse);
      expect(deleteStoreItemMock).toHaveBeenCalledWith({ id: 'test-item-id' });
    });
  });

  describe('upsertStoreItemTranslation', () => {
    it('should call upsertStoreItemTranslation with language mapped to gRPC enum', async () => {
      const dto: UpsertStoreItemTranslationDto = {
        itemId: 'test-item-id',
        title: 'Test Item',
        description: 'Test description',
        language: Language.EN,
      };

      const result = await firstValueFrom(service.upsertStoreItemTranslation(dto));

      expect(result).toEqual(mockId);
      expect(upsertStoreItemTranslationMock).toHaveBeenCalledWith(
        expect.objectContaining({ itemId: dto.itemId, title: dto.title, language: 1 }),
      );
    });

    it('should map UA language to gRPC enum value 2', async () => {
      const dto: UpsertStoreItemTranslationDto = {
        itemId: 'test-item-id',
        title: 'Test Item UA',
        language: Language.UA,
      };

      await firstValueFrom(service.upsertStoreItemTranslation(dto));

      expect(upsertStoreItemTranslationMock).toHaveBeenCalledWith(expect.objectContaining({ language: 2 }));
    });
  });

  describe('deleteStoreItemTranslation', () => {
    it('should call deleteStoreItemTranslation with correct id', async () => {
      const result = await firstValueFrom(service.deleteStoreItemTranslation('test-translation-id'));

      expect(result).toEqual(mockStatusResponse);
      expect(deleteStoreItemTranslationMock).toHaveBeenCalledWith({ id: 'test-translation-id' });
    });
  });

  describe('addStoreItemImage', () => {
    it('should call addStoreItemImage with correct data', async () => {
      const data: AddStoreItemImageRequest = {
        itemId: 'test-item-id',
        url: 'https://example.com/image.jpg',
        sortOrder: 1,
      };

      const result = await firstValueFrom(service.addStoreItemImage(data));

      expect(result).toEqual(mockId);
      expect(addStoreItemImageMock).toHaveBeenCalledWith(data);
    });
  });

  describe('removeStoreItemImage', () => {
    it('should call removeStoreItemImage with correct id', async () => {
      const result = await firstValueFrom(service.removeStoreItemImage('test-image-id'));

      expect(result).toEqual(mockStatusResponse);
      expect(removeStoreItemImageMock).toHaveBeenCalledWith({ id: 'test-image-id' });
    });
  });

  describe('changeStoreItemImagePosition', () => {
    it('should call changeStoreItemImagePosition with correct data', async () => {
      const data: ChangeStoreItemImagePositionRequest = {
        imageId: 'test-image-id',
        sortOrder: 3,
      };

      const result = await firstValueFrom(service.changeStoreItemImagePosition(data));

      expect(result).toEqual(mockId);
      expect(changeStoreItemImagePositionMock).toHaveBeenCalledWith(data);
    });
  });

  describe('changeStoreItemPosition', () => {
    it('should call changeStoreItemPosition with correct data', async () => {
      const data: ChangeStoreItemPositionRequest = {
        itemId: 'test-item-id',
        sortOrder: 5,
      };

      const result = await firstValueFrom(service.changeStoreItemPosition(data));

      expect(result).toEqual(mockStoreItemWithOption);
      expect(changeStoreItemPositionMock).toHaveBeenCalledWith(data);
    });
  });

  describe('addStoreItemVariant', () => {
    it('should call addStoreItemVariant with correct data', async () => {
      const data: AddStoreItemVariantRequest = {
        itemId: 'test-item-id',
        attributeId: 'test-attribute-id',
      };

      const result = await firstValueFrom(service.addStoreItemVariant(data));

      expect(result).toEqual(mockId);
      expect(addStoreItemVariantMock).toHaveBeenCalledWith(data);
    });
  });

  describe('removeStoreItemVariant', () => {
    it('should call removeStoreItemVariant with correct id', async () => {
      const result = await firstValueFrom(service.removeStoreItemVariant('test-variant-id'));

      expect(result).toEqual(mockStatusResponse);
      expect(removeStoreItemVariantMock).toHaveBeenCalledWith({ id: 'test-variant-id' });
    });
  });

  describe('upsertItemAttributeTranslation', () => {
    it('should call upsertItemAttributeTranslation with language mapped to gRPC enum', async () => {
      const dto: UpsertItemAttributeTranslationDto = {
        itemAttributeId: 'test-attribute-id',
        value: '250ml',
        language: Language.EN,
      };

      const result = await firstValueFrom(service.upsertItemAttributeTranslation(dto));

      expect(result).toEqual(mockId);
      expect(upsertItemAttributeTranslationMock).toHaveBeenCalledWith(
        expect.objectContaining({ itemAttributeId: dto.itemAttributeId, value: dto.value, language: 1 }),
      );
    });

    it('should map RU language to gRPC enum value 3', async () => {
      const dto: UpsertItemAttributeTranslationDto = {
        itemAttributeId: 'test-attribute-id',
        value: '250ml',
        language: Language.RU,
      };

      await firstValueFrom(service.upsertItemAttributeTranslation(dto));

      expect(upsertItemAttributeTranslationMock).toHaveBeenCalledWith(expect.objectContaining({ language: 3 }));
    });
  });

  describe('addVariantPrice', () => {
    it('should call addVariantPrice with priceType and currency mapped to gRPC enums', async () => {
      const dto: AddVariantPriceDto = {
        itemAttributeId: 'test-attribute-id',
        priceType: PriceType.REGULAR,
        value: '9.99',
        currency: Currency.USD,
      };

      const result = await firstValueFrom(service.addVariantPrice(dto));

      expect(result).toEqual(mockId);
      expect(addVariantPriceMock).toHaveBeenCalledWith(
        expect.objectContaining({ itemAttributeId: dto.itemAttributeId, value: dto.value, priceType: 1, currency: 1 }),
      );
    });

    it('should handle optional currency as undefined', async () => {
      const dto: AddVariantPriceDto = {
        itemAttributeId: 'test-attribute-id',
        priceType: PriceType.DISCOUNT,
        value: '7.99',
      };

      await firstValueFrom(service.addVariantPrice(dto));

      expect(addVariantPriceMock).toHaveBeenCalledWith(expect.objectContaining({ priceType: 2, currency: undefined }));
    });
  });

  describe('removeVariantPrice', () => {
    it('should call removeVariantPrice with correct id', async () => {
      const result = await firstValueFrom(service.removeVariantPrice('test-price-id'));

      expect(result).toEqual(mockStatusResponse);
      expect(removeVariantPriceMock).toHaveBeenCalledWith({ id: 'test-price-id' });
    });
  });

  describe('addStoreItemBasePrice', () => {
    it('should call addStoreItemBasePrice with priceType and currency mapped to gRPC enums', async () => {
      const dto: AddStoreItemBasePriceDto = {
        itemId: 'test-item-id',
        priceType: PriceType.WHOLESALE,
        value: '5.99',
        currency: Currency.EUR,
      };

      const result = await firstValueFrom(service.addStoreItemBasePrice(dto));

      expect(result).toEqual(mockId);
      expect(addStoreItemBasePriceMock).toHaveBeenCalledWith(
        expect.objectContaining({ itemId: dto.itemId, value: dto.value, priceType: 3, currency: 2 }),
      );
    });

    it('should handle optional currency as undefined', async () => {
      const dto: AddStoreItemBasePriceDto = {
        itemId: 'test-item-id',
        priceType: PriceType.REGULAR,
        value: '12.00',
      };

      await firstValueFrom(service.addStoreItemBasePrice(dto));

      expect(addStoreItemBasePriceMock).toHaveBeenCalledWith(
        expect.objectContaining({ priceType: 1, currency: undefined }),
      );
    });
  });

  describe('removeStoreItemBasePrice', () => {
    it('should call removeStoreItemBasePrice with correct id', async () => {
      const result = await firstValueFrom(service.removeStoreItemBasePrice('test-base-price-id'));

      expect(result).toEqual(mockStatusResponse);
      expect(removeStoreItemBasePriceMock).toHaveBeenCalledWith({ id: 'test-base-price-id' });
    });
  });
});

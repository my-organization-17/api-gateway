import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom, of } from 'rxjs';

import { StoreItemPublicController } from '../store-item-public.controller';
import { StoreItemAdminController } from '../store-item-admin.controller';
import { StoreItemService } from '../store-item.service';
import { Language } from 'src/common/enums/language.enum';
import { PriceType, Currency } from 'src/common/enums';
import type { Id, StatusResponse, StoreItemListWithOption, StoreItemWithOption } from 'src/generated-types/store-item';
import {
  AddStoreItemBasePriceDto,
  AddStoreItemImageDto,
  AddStoreItemVariantDto,
  AddVariantPriceDto,
  CreateStoreItemDto,
  UpdateStoreItemDto,
  UpsertItemAttributeTranslationDto,
  UpsertStoreItemTranslationDto,
} from '../dto';

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

describe('StoreItemPublicController', () => {
  let controller: StoreItemPublicController;

  const getStoreItemsByCategoryIdWithOptionMock = jest.fn();
  const getStoreItemsByCategorySlugWithOptionMock = jest.fn();
  const getStoreItemByIdMock = jest.fn();

  beforeEach(async () => {
    getStoreItemsByCategoryIdWithOptionMock.mockReturnValue(of(mockStoreItemList));
    getStoreItemsByCategorySlugWithOptionMock.mockReturnValue(of(mockStoreItemList));
    getStoreItemByIdMock.mockReturnValue(of(mockStoreItemWithOption));

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreItemPublicController],
      providers: [
        {
          provide: StoreItemService,
          useValue: {
            getStoreItemsByCategoryIdWithOption: getStoreItemsByCategoryIdWithOptionMock,
            getStoreItemsByCategorySlugWithOption: getStoreItemsByCategorySlugWithOptionMock,
            getStoreItemById: getStoreItemByIdMock,
          },
        },
      ],
    }).compile();

    controller = module.get<StoreItemPublicController>(StoreItemPublicController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStoreItemsByCategoryId', () => {
    it('should call service.getStoreItemsByCategoryIdWithOption with correct params', async () => {
      const result = await firstValueFrom(controller.getStoreItemsByCategoryId('test-category-id', 'EN'));

      expect(result).toEqual(mockStoreItemList);
      expect(getStoreItemsByCategoryIdWithOptionMock).toHaveBeenCalledWith('test-category-id', 'EN');
    });
  });

  describe('getStoreItemsByCategorySlug', () => {
    it('should call service.getStoreItemsByCategorySlugWithOption with correct params', async () => {
      const result = await firstValueFrom(controller.getStoreItemsByCategorySlug('test-category', 'UA'));

      expect(result).toEqual(mockStoreItemList);
      expect(getStoreItemsByCategorySlugWithOptionMock).toHaveBeenCalledWith('test-category', 'UA');
    });
  });

  describe('getStoreItemById', () => {
    it('should call service.getStoreItemById with correct id and language', async () => {
      const result = await firstValueFrom(controller.getStoreItemById('test-item-id', 'EN'));

      expect(result).toEqual(mockStoreItemWithOption);
      expect(getStoreItemByIdMock).toHaveBeenCalledWith('test-item-id', 'EN');
    });
  });
});

describe('StoreItemAdminController', () => {
  let controller: StoreItemAdminController;

  const getStoreItemByIdMock = jest.fn();
  const createStoreItemMock = jest.fn();
  const updateStoreItemMock = jest.fn();
  const deleteStoreItemMock = jest.fn();
  const changeStoreItemPositionMock = jest.fn();
  const upsertStoreItemTranslationMock = jest.fn();
  const deleteStoreItemTranslationMock = jest.fn();
  const addStoreItemImageMock = jest.fn();
  const removeStoreItemImageMock = jest.fn();
  const changeStoreItemImagePositionMock = jest.fn();
  const addStoreItemVariantMock = jest.fn();
  const removeStoreItemVariantMock = jest.fn();
  const upsertItemAttributeTranslationMock = jest.fn();
  const addVariantPriceMock = jest.fn();
  const removeVariantPriceMock = jest.fn();
  const addStoreItemBasePriceMock = jest.fn();
  const removeStoreItemBasePriceMock = jest.fn();

  beforeEach(async () => {
    getStoreItemByIdMock.mockReturnValue(of(mockStoreItemWithOption));
    createStoreItemMock.mockReturnValue(of(mockId));
    updateStoreItemMock.mockReturnValue(of(mockId));
    deleteStoreItemMock.mockReturnValue(of(mockStatusResponse));
    changeStoreItemPositionMock.mockReturnValue(of(mockStoreItemWithOption));
    upsertStoreItemTranslationMock.mockReturnValue(of(mockId));
    deleteStoreItemTranslationMock.mockReturnValue(of(mockStatusResponse));
    addStoreItemImageMock.mockReturnValue(of(mockId));
    removeStoreItemImageMock.mockReturnValue(of(mockStatusResponse));
    changeStoreItemImagePositionMock.mockReturnValue(of(mockId));
    addStoreItemVariantMock.mockReturnValue(of(mockId));
    removeStoreItemVariantMock.mockReturnValue(of(mockStatusResponse));
    upsertItemAttributeTranslationMock.mockReturnValue(of(mockId));
    addVariantPriceMock.mockReturnValue(of(mockId));
    removeVariantPriceMock.mockReturnValue(of(mockStatusResponse));
    addStoreItemBasePriceMock.mockReturnValue(of(mockId));
    removeStoreItemBasePriceMock.mockReturnValue(of(mockStatusResponse));

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreItemAdminController],
      providers: [
        {
          provide: StoreItemService,
          useValue: {
            getStoreItemById: getStoreItemByIdMock,
            createStoreItem: createStoreItemMock,
            updateStoreItem: updateStoreItemMock,
            deleteStoreItem: deleteStoreItemMock,
            changeStoreItemPosition: changeStoreItemPositionMock,
            upsertStoreItemTranslation: upsertStoreItemTranslationMock,
            deleteStoreItemTranslation: deleteStoreItemTranslationMock,
            addStoreItemImage: addStoreItemImageMock,
            removeStoreItemImage: removeStoreItemImageMock,
            changeStoreItemImagePosition: changeStoreItemImagePositionMock,
            addStoreItemVariant: addStoreItemVariantMock,
            removeStoreItemVariant: removeStoreItemVariantMock,
            upsertItemAttributeTranslation: upsertItemAttributeTranslationMock,
            addVariantPrice: addVariantPriceMock,
            removeVariantPrice: removeVariantPriceMock,
            addStoreItemBasePrice: addStoreItemBasePriceMock,
            removeStoreItemBasePrice: removeStoreItemBasePriceMock,
          },
        },
      ],
    }).compile();

    controller = module.get<StoreItemAdminController>(StoreItemAdminController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStoreItemById', () => {
    it('should call service.getStoreItemById with correct id', async () => {
      const result = await firstValueFrom(controller.getStoreItemById('test-item-id'));

      expect(result).toEqual(mockStoreItemWithOption);
      expect(getStoreItemByIdMock).toHaveBeenCalledWith('test-item-id');
    });
  });

  describe('createStoreItem', () => {
    it('should call service.createStoreItem with correct data', async () => {
      const dto: CreateStoreItemDto = {
        categoryId: 'test-category-id',
        slug: 'new-item',
        isAvailable: true,
      };

      const result = await firstValueFrom(controller.createStoreItem(dto));

      expect(result).toEqual(mockId);
      expect(createStoreItemMock).toHaveBeenCalledWith(dto);
    });
  });

  describe('updateStoreItem', () => {
    it('should call service.updateStoreItem with correct data', async () => {
      const dto: UpdateStoreItemDto = {
        itemId: 'test-item-id',
        slug: 'updated-item',
        isAvailable: false,
      };

      const result = await firstValueFrom(controller.updateStoreItem(dto));

      expect(result).toEqual(mockId);
      expect(updateStoreItemMock).toHaveBeenCalledWith(dto);
    });
  });

  describe('deleteStoreItem', () => {
    it('should call service.deleteStoreItem with correct id', async () => {
      const result = await firstValueFrom(controller.deleteStoreItem('test-item-id'));

      expect(result).toEqual(mockStatusResponse);
      expect(deleteStoreItemMock).toHaveBeenCalledWith('test-item-id');
    });
  });

  describe('changeStoreItemPosition', () => {
    it('should call service.changeStoreItemPosition with itemId and sortOrder', async () => {
      const position = 3;

      const result = await firstValueFrom(controller.changeStoreItemPosition('test-item-id', { position }));

      expect(result).toEqual(mockStoreItemWithOption);
      expect(changeStoreItemPositionMock).toHaveBeenCalledWith({ itemId: 'test-item-id', sortOrder: position });
    });
  });

  describe('upsertStoreItemTranslation', () => {
    it('should call service.upsertStoreItemTranslation with correct data', async () => {
      const dto: UpsertStoreItemTranslationDto = {
        itemId: 'test-item-id',
        title: 'Test Item',
        description: 'Test description',
        language: Language.EN,
      };

      const result = await firstValueFrom(controller.upsertStoreItemTranslation(dto));

      expect(result).toEqual(mockId);
      expect(upsertStoreItemTranslationMock).toHaveBeenCalledWith(dto);
    });
  });

  describe('deleteStoreItemTranslation', () => {
    it('should call service.deleteStoreItemTranslation with correct id', async () => {
      const result = await firstValueFrom(controller.deleteStoreItemTranslation('test-translation-id'));

      expect(result).toEqual(mockStatusResponse);
      expect(deleteStoreItemTranslationMock).toHaveBeenCalledWith('test-translation-id');
    });
  });

  describe('addStoreItemImage', () => {
    it('should call service.addStoreItemImage with correct data', async () => {
      const dto: AddStoreItemImageDto = {
        itemId: 'test-item-id',
        url: 'https://example.com/image.jpg',
        sortOrder: 1,
      };

      const result = await firstValueFrom(controller.addStoreItemImage(dto));

      expect(result).toEqual(mockId);
      expect(addStoreItemImageMock).toHaveBeenCalledWith(dto);
    });
  });

  describe('removeStoreItemImage', () => {
    it('should call service.removeStoreItemImage with correct id', async () => {
      const result = await firstValueFrom(controller.removeStoreItemImage('test-image-id'));

      expect(result).toEqual(mockStatusResponse);
      expect(removeStoreItemImageMock).toHaveBeenCalledWith('test-image-id');
    });
  });

  describe('changeStoreItemImagePosition', () => {
    it('should call service.changeStoreItemImagePosition with imageId and sortOrder', async () => {
      const position = 2;

      const result = await firstValueFrom(controller.changeStoreItemImagePosition('test-image-id', { position }));

      expect(result).toEqual(mockId);
      expect(changeStoreItemImagePositionMock).toHaveBeenCalledWith({ imageId: 'test-image-id', sortOrder: position });
    });
  });

  describe('addStoreItemVariant', () => {
    it('should call service.addStoreItemVariant with correct data', async () => {
      const dto: AddStoreItemVariantDto = {
        itemId: 'test-item-id',
        attributeId: 'test-attribute-id',
      };

      const result = await firstValueFrom(controller.addStoreItemVariant(dto));

      expect(result).toEqual(mockId);
      expect(addStoreItemVariantMock).toHaveBeenCalledWith(dto);
    });
  });

  describe('removeStoreItemVariant', () => {
    it('should call service.removeStoreItemVariant with correct id', async () => {
      const result = await firstValueFrom(controller.removeStoreItemVariant('test-variant-id'));

      expect(result).toEqual(mockStatusResponse);
      expect(removeStoreItemVariantMock).toHaveBeenCalledWith('test-variant-id');
    });
  });

  describe('upsertItemAttributeTranslation', () => {
    it('should call service.upsertItemAttributeTranslation with correct data', async () => {
      const dto: UpsertItemAttributeTranslationDto = {
        itemAttributeId: 'test-attribute-id',
        value: '250ml',
        language: Language.EN,
      };

      const result = await firstValueFrom(controller.upsertItemAttributeTranslation(dto));

      expect(result).toEqual(mockId);
      expect(upsertItemAttributeTranslationMock).toHaveBeenCalledWith(dto);
    });
  });

  describe('addVariantPrice', () => {
    it('should call service.addVariantPrice with correct data', async () => {
      const dto: AddVariantPriceDto = {
        itemAttributeId: 'test-attribute-id',
        priceType: PriceType.REGULAR,
        value: '9.99',
        currency: Currency.USD,
      };

      const result = await firstValueFrom(controller.addVariantPrice(dto));

      expect(result).toEqual(mockId);
      expect(addVariantPriceMock).toHaveBeenCalledWith(dto);
    });
  });

  describe('removeVariantPrice', () => {
    it('should call service.removeVariantPrice with correct id', async () => {
      const result = await firstValueFrom(controller.removeVariantPrice('test-price-id'));

      expect(result).toEqual(mockStatusResponse);
      expect(removeVariantPriceMock).toHaveBeenCalledWith('test-price-id');
    });
  });

  describe('addStoreItemBasePrice', () => {
    it('should call service.addStoreItemBasePrice with correct data', async () => {
      const dto: AddStoreItemBasePriceDto = {
        itemId: 'test-item-id',
        priceType: PriceType.REGULAR,
        value: '12.00',
        currency: Currency.EUR,
      };

      const result = await firstValueFrom(controller.addStoreItemBasePrice(dto));

      expect(result).toEqual(mockId);
      expect(addStoreItemBasePriceMock).toHaveBeenCalledWith(dto);
    });
  });

  describe('removeStoreItemBasePrice', () => {
    it('should call service.removeStoreItemBasePrice with correct id', async () => {
      const result = await firstValueFrom(controller.removeStoreItemBasePrice('test-base-price-id'));

      expect(result).toEqual(mockStatusResponse);
      expect(removeStoreItemBasePriceMock).toHaveBeenCalledWith('test-base-price-id');
    });
  });
});

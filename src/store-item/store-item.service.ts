import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import {
  STORE_ITEM_SERVICE_NAME,
  Language,
  PriceType as GrpcPriceType,
  Currency as GrpcCurrency,
  type AddStoreItemImageRequest,
  type AddStoreItemVariantRequest,
  type ChangeStoreItemImagePositionRequest,
  type ChangeStoreItemPositionRequest,
  type CreateStoreItemRequest,
  type Id,
  type StatusResponse,
  type StoreItemListWithOption,
  type StoreItemServiceClient,
  type StoreItemTranslationRequest,
  type UpsertItemAttributeTranslationRequest,
  type AddVariantPriceRequest,
  type AddStoreItemBasePriceRequest,
  type StoreItemWithOption,
  type UpdateStoreItemRequest,
} from 'src/generated-types/store-item';

import { PriceType, Currency } from 'src/common/enums';
import { MetricsService } from 'src/supervision/metrics/metrics.service';
import {
  AddStoreItemBasePriceDto,
  AddVariantPriceDto,
  CreateStoreItemDto,
  UpdateStoreItemDto,
  UpsertItemAttributeTranslationDto,
  UpsertStoreItemTranslationDto,
} from './dto';

function mapLanguageToGrpcEnum(language: string): Language {
  switch (language.toUpperCase()) {
    case 'EN':
      return Language.LANGUAGE_EN;
    case 'UA':
      return Language.LANGUAGE_UA;
    case 'RU':
      return Language.LANGUAGE_RU;
    case 'DE':
      return Language.LANGUAGE_DE;
    case 'ES':
      return Language.LANGUAGE_ES;
    case 'FR':
      return Language.LANGUAGE_FR;
    default:
      return Language.LANGUAGE_EN;
  }
}

function mapPriceTypeToGrpcEnum(priceType: PriceType): GrpcPriceType {
  switch (priceType) {
    case PriceType.REGULAR:
      return GrpcPriceType.PRICE_TYPE_REGULAR;
    case PriceType.DISCOUNT:
      return GrpcPriceType.PRICE_TYPE_DISCOUNT;
    case PriceType.WHOLESALE:
      return GrpcPriceType.PRICE_TYPE_WHOLESALE;
    default:
      return GrpcPriceType.PRICE_TYPE_UNSPECIFIED;
  }
}

function mapCurrencyToGrpcEnum(currency: Currency): GrpcCurrency {
  switch (currency) {
    case Currency.USD:
      return GrpcCurrency.CURRENCY_USD;
    case Currency.EUR:
      return GrpcCurrency.CURRENCY_EUR;
    case Currency.GBP:
      return GrpcCurrency.CURRENCY_GBP;
    case Currency.UAH:
      return GrpcCurrency.CURRENCY_UAH;
    default:
      return GrpcCurrency.CURRENCY_UNSPECIFIED;
  }
}

@Injectable()
export class StoreItemService implements OnModuleInit {
  private storeItemService: StoreItemServiceClient;
  private readonly logger = new Logger(StoreItemService.name);

  constructor(
    @Inject('STORE_ITEM_CLIENT')
    private readonly storeItemMicroserviceClient: ClientGrpc,
    private readonly metricsService: MetricsService,
  ) {}

  onModuleInit() {
    this.storeItemService =
      this.storeItemMicroserviceClient.getService<StoreItemServiceClient>(STORE_ITEM_SERVICE_NAME);
  }

  getStoreItemsByCategoryIdWithOption(categoryId: string, language = 'EN'): Observable<StoreItemListWithOption> {
    this.logger.log(`Fetching store items by category ID: ${categoryId} for language: ${language}`);
    const grpcLanguage = mapLanguageToGrpcEnum(language);
    return this.storeItemService
      .getStoreItemsByCategoryIdWithOption({ categoryId, language: grpcLanguage })
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'getStoreItemsByCategoryIdWithOption'));
  }

  getStoreItemsByCategorySlugWithOption(categorySlug: string, language = 'EN'): Observable<StoreItemListWithOption> {
    this.logger.log(`Fetching store items by category slug: ${categorySlug} for language: ${language}`);
    const grpcLanguage = mapLanguageToGrpcEnum(language);
    return this.storeItemService
      .getStoreItemsByCategorySlugWithOption({ categorySlug, language: grpcLanguage })
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'getStoreItemsByCategorySlugWithOption'));
  }

  getStoreItemById(itemId: string, language = 'EN'): Observable<StoreItemWithOption> {
    this.logger.log(`Fetching store item by ID: ${itemId} for language: ${language}`);
    const grpcLanguage = mapLanguageToGrpcEnum(language);
    return this.storeItemService
      .getStoreItemById({ itemId, language: grpcLanguage })
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'getStoreItemById'));
  }

  createStoreItem(data: CreateStoreItemDto): Observable<Id> {
    this.logger.log(`Creating store item with data: ${JSON.stringify(data)}`);
    const grpcData: CreateStoreItemRequest = {
      ...data,
      expectedDate: data.expectedDate ? new Date(data.expectedDate) : undefined,
    };
    return this.storeItemService
      .createStoreItem(grpcData)
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'createStoreItem'));
  }

  updateStoreItem(data: UpdateStoreItemDto): Observable<Id> {
    this.logger.log(`Updating store item with data: ${JSON.stringify(data)}`);
    const grpcData: UpdateStoreItemRequest = {
      ...data,
      expectedDate: data.expectedDate ? new Date(data.expectedDate) : undefined,
    };
    return this.storeItemService
      .updateStoreItem(grpcData)
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'updateStoreItem'));
  }

  deleteStoreItem(id: string): Observable<StatusResponse> {
    this.logger.log(`Deleting store item with ID: ${id}`);
    return this.storeItemService
      .deleteStoreItem({ id })
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'deleteStoreItem'));
  }

  upsertStoreItemTranslation(data: UpsertStoreItemTranslationDto): Observable<Id> {
    this.logger.log(`Upserting translation for store item with ID: ${data.itemId} and language: ${data.language}`);
    const grpcData: StoreItemTranslationRequest = {
      ...data,
      language: mapLanguageToGrpcEnum(data.language),
    };
    return this.storeItemService
      .upsertStoreItemTranslation(grpcData)
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'upsertStoreItemTranslation'));
  }

  deleteStoreItemTranslation(id: string): Observable<StatusResponse> {
    this.logger.log(`Deleting translation for store item with translation ID: ${id}`);
    return this.storeItemService
      .deleteStoreItemTranslation({ id })
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'deleteStoreItemTranslation'));
  }

  addStoreItemImage(data: AddStoreItemImageRequest): Observable<Id> {
    this.logger.log(`Adding image to store item with ID: ${data.itemId}`);
    return this.storeItemService
      .addStoreItemImage(data)
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'addStoreItemImage'));
  }

  removeStoreItemImage(id: string): Observable<StatusResponse> {
    this.logger.log(`Removing image with ID: ${id}`);
    return this.storeItemService
      .removeStoreItemImage({ id })
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'removeStoreItemImage'));
  }

  changeStoreItemImagePosition(data: ChangeStoreItemImagePositionRequest): Observable<Id> {
    this.logger.log(`Changing position of image with ID: ${data.imageId} to sort order: ${data.sortOrder}`);
    return this.storeItemService
      .changeStoreItemImagePosition(data)
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'changeStoreItemImagePosition'));
  }

  changeStoreItemPosition(data: ChangeStoreItemPositionRequest): Observable<StoreItemWithOption> {
    this.logger.log(`Changing position of store item with ID: ${data.itemId} to sort order: ${data.sortOrder}`);
    return this.storeItemService
      .changeStoreItemPosition(data)
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'changeStoreItemPosition'));
  }

  addStoreItemVariant(data: AddStoreItemVariantRequest): Observable<Id> {
    this.logger.log(`Adding variant with attribute ID: ${data.attributeId} to store item with ID: ${data.itemId}`);
    return this.storeItemService
      .addStoreItemVariant(data)
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'addStoreItemVariant'));
  }

  removeStoreItemVariant(id: string): Observable<StatusResponse> {
    this.logger.log(`Removing variant with ID: ${id}`);
    return this.storeItemService
      .removeStoreItemVariant({ id })
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'removeStoreItemVariant'));
  }

  upsertItemAttributeTranslation(data: UpsertItemAttributeTranslationDto): Observable<Id> {
    this.logger.log(
      `Upserting attribute translation for item attribute ID: ${data.itemAttributeId} and language: ${data.language}`,
    );
    const grpcData: UpsertItemAttributeTranslationRequest = {
      ...data,
      language: mapLanguageToGrpcEnum(data.language),
    };
    return this.storeItemService
      .upsertItemAttributeTranslation(grpcData)
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'upsertItemAttributeTranslation'));
  }

  addVariantPrice(data: AddVariantPriceDto): Observable<Id> {
    this.logger.log(`Adding price for variant with item attribute ID: ${data.itemAttributeId}`);
    const grpcData: AddVariantPriceRequest = {
      ...data,
      priceType: mapPriceTypeToGrpcEnum(data.priceType),
      currency: data.currency ? mapCurrencyToGrpcEnum(data.currency) : undefined,
    };
    return this.storeItemService
      .addVariantPrice(grpcData)
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'addVariantPrice'));
  }

  removeVariantPrice(id: string): Observable<StatusResponse> {
    this.logger.log(`Removing variant price with ID: ${id}`);
    return this.storeItemService
      .removeVariantPrice({ id })
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'removeVariantPrice'));
  }

  addStoreItemBasePrice(data: AddStoreItemBasePriceDto): Observable<Id> {
    this.logger.log(`Adding base price for store item with ID: ${data.itemId}`);
    const grpcData: AddStoreItemBasePriceRequest = {
      ...data,
      priceType: mapPriceTypeToGrpcEnum(data.priceType),
      currency: data.currency ? mapCurrencyToGrpcEnum(data.currency) : undefined,
    };
    return this.storeItemService
      .addStoreItemBasePrice(grpcData)
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'addStoreItemBasePrice'));
  }

  removeStoreItemBasePrice(id: string): Observable<StatusResponse> {
    this.logger.log(`Removing base price with ID: ${id}`);
    return this.storeItemService
      .removeStoreItemBasePrice({ id })
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'removeStoreItemBasePrice'));
  }
}

import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import { MetricsService } from 'src/supervision/metrics/metrics.service';

import {
  STORE_CATEGORY_SERVICE_NAME,
  StoreCategoryTranslationRequest,
  type ChangeStoreCategoryPositionRequest,
  type CreateStoreCategoryRequest,
  type Id,
  type StatusResponse,
  type StoreCategory,
  type StoreCategoryList,
  type StoreCategoryServiceClient,
  type StoreCategoryWithTranslations,
  type UpdateStoreCategoryRequest,
} from 'src/generated-types/store-category';
import { UpsertStoreCategoryTranslationDto } from './dto';

function mapLanguageToGrpcEnum(language: string): number {
  switch (language.toUpperCase()) {
    case 'EN':
      return 1; // LANGUAGE_EN = 1
    case 'UA':
      return 2; // LANGUAGE_UA = 2
    case 'RU':
      return 3; // LANGUAGE_RU = 3
    default:
      return 1; // Default to English if unknown
  }
}

@Injectable()
export class StoreCategoryService implements OnModuleInit {
  private storeCategoryService: StoreCategoryServiceClient;
  private readonly logger = new Logger(StoreCategoryService.name);

  constructor(
    @Inject('STORE_CATEGORY_CLIENT')
    private readonly storeCategoryMicroserviceClient: ClientGrpc,
    private readonly metricsService: MetricsService,
  ) {}

  onModuleInit() {
    this.storeCategoryService =
      this.storeCategoryMicroserviceClient.getService<StoreCategoryServiceClient>(STORE_CATEGORY_SERVICE_NAME);
  }

  getStoreCategoriesByLanguage(language = 'EN'): Observable<StoreCategoryList> {
    this.logger.log(`Fetching store categories for language: ${language}`);
    const grpcLanguage = mapLanguageToGrpcEnum(language);
    return this.storeCategoryService
      .getStoreCategoriesByLanguage({ language: grpcLanguage })
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'getStoreCategoriesByLanguage'));
  }

  getStoreCategoryById(id: string): Observable<StoreCategoryWithTranslations> {
    this.logger.log(`Fetching store category by ID: ${id}`);
    return this.storeCategoryService
      .getStoreCategoryById({ id })
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'getStoreCategoryById'));
  }

  createStoreCategory(data: CreateStoreCategoryRequest): Observable<Id> {
    this.logger.log(`Creating store category with data: ${JSON.stringify(data)}`);
    return this.storeCategoryService
      .createStoreCategory(data)
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'createStoreCategory'));
  }

  updateStoreCategory(data: UpdateStoreCategoryRequest): Observable<Id> {
    this.logger.log(`Updating store category with data: ${JSON.stringify(data)}`);
    return this.storeCategoryService
      .updateStoreCategory(data)
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'updateStoreCategory'));
  }

  deleteStoreCategory(id: string): Observable<StatusResponse> {
    this.logger.log(`Deleting store category with ID: ${id}`);
    return this.storeCategoryService
      .deleteStoreCategory({ id })
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'deleteStoreCategory'));
  }

  changeStoreCategoryPosition(data: ChangeStoreCategoryPositionRequest): Observable<StoreCategory> {
    this.logger.log(`Changing position of store category with ID: ${data.id} to new position: ${data.sortOrder}`);
    return this.storeCategoryService
      .changeStoreCategoryPosition(data)
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'changeStoreCategoryPosition'));
  }

  upsertStoreCategoryTranslation(data: UpsertStoreCategoryTranslationDto): Observable<Id> {
    this.logger.log(
      `Upserting translation for store category with ID: ${data.categoryId} and language: ${data.language}`,
    );
    const grpcLanguage = mapLanguageToGrpcEnum(data.language);
    const grpcData: StoreCategoryTranslationRequest = {
      ...data,
      language: grpcLanguage,
    };
    return this.storeCategoryService
      .upsertStoreCategoryTranslation(grpcData)
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'upsertStoreCategoryTranslation'));
  }

  deleteStoreCategoryTranslation(id: string): Observable<StatusResponse> {
    this.logger.log(`Deleting translation for store category with translation ID: ${id}`);
    return this.storeCategoryService
      .deleteStoreCategoryTranslation({ id })
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'deleteStoreCategoryTranslation'));
  }
}

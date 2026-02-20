import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import { MetricsService } from 'src/supervision/metrics/metrics.service';

import {
  STORE_CATEGORY_SERVICE_NAME,
  type StoreCategoryList,
  type StoreCategoryServiceClient,
  type StoreCategoryWithTranslations,
} from 'src/generated-types/store-category';

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
}

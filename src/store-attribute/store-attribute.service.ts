import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import { MetricsService } from 'src/supervision/metrics/metrics.service';
import {
  STORE_ATTRIBUTE_SERVICE_NAME,
  type AttributeList,
  type AttributeResponse,
  type AttributeTranslationRequest,
  type ChangeAttributePositionRequest,
  type CreateAttributeRequest,
  type Id,
  type StatusResponse,
  type StoreAttributeServiceClient,
  type UpdateAttributeRequest,
} from 'src/generated-types/store-attribute';
import { UpsertStoreAttributeTranslationDto } from './dto';

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
export class StoreAttributeService implements OnModuleInit {
  private storeAttributeService: StoreAttributeServiceClient;
  private readonly logger = new Logger(StoreAttributeService.name);

  constructor(
    @Inject('STORE_ATTRIBUTE_CLIENT')
    private readonly storeAttributeMicroserviceClient: ClientGrpc,
    private readonly metricsService: MetricsService,
  ) {}

  onModuleInit() {
    this.storeAttributeService =
      this.storeAttributeMicroserviceClient.getService<StoreAttributeServiceClient>(STORE_ATTRIBUTE_SERVICE_NAME);
  }

  getAttributesByCategoryId(categoryId: string): Observable<AttributeList> {
    this.logger.log(`Fetching attributes for category ID: ${categoryId}`);
    return this.storeAttributeService
      .getAttributesByCategoryId({ categoryId })
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'getAttributesByCategoryId'));
  }

  createAttribute(data: CreateAttributeRequest): Observable<Id> {
    this.logger.log(`Creating attribute with data: ${JSON.stringify(data)}`);
    return this.storeAttributeService
      .createAttribute(data)
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'createAttribute'));
  }

  updateAttribute(data: UpdateAttributeRequest): Observable<Id> {
    this.logger.log(`Updating attribute with data: ${JSON.stringify(data)}`);
    return this.storeAttributeService
      .updateAttribute(data)
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'updateAttribute'));
  }

  deleteAttribute(id: string): Observable<StatusResponse> {
    this.logger.log(`Deleting attribute with ID: ${id}`);
    return this.storeAttributeService
      .deleteAttribute({ id })
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'deleteAttribute'));
  }

  changeAttributePosition(data: ChangeAttributePositionRequest): Observable<AttributeResponse> {
    this.logger.log(`Changing position of attribute with ID: ${data.id} to new position: ${data.sortOrder}`);
    return this.storeAttributeService
      .changeAttributePosition(data)
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'changeAttributePosition'));
  }

  upsertAttributeTranslation(data: UpsertStoreAttributeTranslationDto): Observable<Id> {
    const grpcData: AttributeTranslationRequest = {
      ...data,
      language: mapLanguageToGrpcEnum(data.language),
    };
    this.logger.log(
      `Upserting translation for attribute ID: ${data.attributeId} with language code: ${data.language} and name: ${data.name}`,
    );
    return this.storeAttributeService
      .upsertAttributeTranslation(grpcData)
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'upsertAttributeTranslation'));
  }

  deleteAttributeTranslation(id: string): Observable<StatusResponse> {
    this.logger.log(`Deleting attribute translation with ID: ${id}`);
    return this.storeAttributeService
      .deleteAttributeTranslation({ id })
      .pipe(this.metricsService.trackGrpcCall('store-microservice', 'deleteAttributeTranslation'));
  }
}

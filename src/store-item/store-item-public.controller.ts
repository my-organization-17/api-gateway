import { Controller, Get, Logger, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import type { StoreItemListWithOption, StoreItemWithOption } from 'src/generated-types/store-item';

import { StoreItemService } from './store-item.service';

@ApiTags('store-item')
@Controller('store-item')
export class StoreItemPublicController {
  private readonly logger = new Logger(StoreItemPublicController.name);

  constructor(private readonly storeItemService: StoreItemService) {}

  @Get('by-category-id/:categoryId')
  @ApiOperation({
    summary: 'Get store items by category ID',
    description:
      'Retrieves all store items for the given category ID with translated options for the specified language',
  })
  @ApiParam({ name: 'categoryId', required: true, description: 'UUID of the store category' })
  @ApiQuery({ name: 'language', required: true, description: 'The language code (e.g., "EN", "UA")' })
  @ApiResponse({ status: 200, description: 'Returns a list of store items with options for the specified category' })
  getStoreItemsByCategoryId(
    @Param('categoryId', new ParseUUIDPipe()) categoryId: string,
    @Query('language') language: string,
  ): Observable<StoreItemListWithOption> {
    this.logger.log(`Fetching store items for category ID: ${categoryId} and language: ${language}`);
    return this.storeItemService.getStoreItemsByCategoryIdWithOption(categoryId, language);
  }

  @Get('by-category-slug/:categorySlug')
  @ApiOperation({
    summary: 'Get store items by category slug',
    description:
      'Retrieves all store items for the given category slug with translated options for the specified language',
  })
  @ApiParam({ name: 'categorySlug', required: true, description: 'Slug of the store category' })
  @ApiQuery({ name: 'language', required: true, description: 'The language code (e.g., "EN", "UA")' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of store items with options for the specified category slug',
  })
  getStoreItemsByCategorySlug(
    @Param('categorySlug') categorySlug: string,
    @Query('language') language: string,
  ): Observable<StoreItemListWithOption> {
    this.logger.log(`Fetching store items for category slug: ${categorySlug} and language: ${language}`);
    return this.storeItemService.getStoreItemsByCategorySlugWithOption(categorySlug, language);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get store item by ID',
    description: 'Retrieves a store item with all its options for the specified language',
  })
  @ApiParam({ name: 'id', required: true, description: 'UUID of the store item' })
  @ApiQuery({ name: 'language', required: true, description: 'The language code (e.g., "EN", "UA")' })
  @ApiResponse({ status: 200, description: 'Returns the store item with options for the specified language' })
  getStoreItemById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('language') language: string,
  ): Observable<StoreItemWithOption> {
    this.logger.log(`Fetching store item by ID: ${id} for language: ${language}`);
    return this.storeItemService.getStoreItemById(id, language);
  }
}

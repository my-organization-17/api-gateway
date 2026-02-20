import { BadRequestException, Controller, Get, Logger, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { StoreCategoryService } from './store-category.service';
import type { StoreCategoryList, StoreCategoryWithTranslations } from 'src/generated-types/store-category';

@ApiTags('store-category')
@Controller('store-category')
export class StoreCategoryController {
  private readonly logger = new Logger(StoreCategoryController.name);

  constructor(private readonly storeCategoryService: StoreCategoryService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get store category by ID',
    description: 'Retrieves a store category along with its translations based on the provided ID',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID of the menu item',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the store category with translations for the specified ID',
  })
  getStoreCategoryById(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException('Invalid UUID format for menu item ID'),
      }),
    )
    id: string,
  ): Observable<StoreCategoryWithTranslations> {
    this.logger.log(`Fetching store category by ID: ${id}`);
    return this.storeCategoryService.getStoreCategoryById(id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all store categories by language',
    description: 'Retrieves a list of all store categories along with their translations for the specified language',
  })
  @ApiQuery({
    name: 'language',
    required: true,
    description: 'The language code to filter store categories by (e.g., "en", "fr")',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of store categories with translations for the specified language',
  })
  getAllStoreCategoriesByLanguage(@Query('language') language: string): Observable<StoreCategoryList> {
    this.logger.log(`Fetching all store categories for language: ${language}`);
    return this.storeCategoryService.getStoreCategoriesByLanguage(language);
  }
}

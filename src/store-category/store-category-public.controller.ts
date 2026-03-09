import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { StoreCategoryService } from './store-category.service';
import type { StoreCategoryList } from 'src/generated-types/store-category';

@ApiTags('store-category')
@Controller('store-category')
export class StoreCategoryPublicController {
  private readonly logger = new Logger(StoreCategoryPublicController.name);

  constructor(private readonly storeCategoryService: StoreCategoryService) {}

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

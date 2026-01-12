import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { MenuCategoryService } from './menu-category.service';
import type { MenuCategoryListWithItems } from 'src/generated-types/menu-category';

@ApiTags('full-menu')
@Controller('full-menu')
export class FullMenuController {
  constructor(private readonly menuCategoryService: MenuCategoryService) {}
  protected readonly logger = new Logger(FullMenuController.name);

  @Get()
  @ApiOperation({
    summary: 'Get full menu by language',
    description: 'Retrieves the complete menu structure for the specified language',
  })
  @ApiResponse({
    status: 200,
    type: Observable<MenuCategoryListWithItems>,
    description: 'Returns the full menu structure for the specified language',
  })
  getFullMenuByLanguage(@Query('language') language: string): Observable<MenuCategoryListWithItems> {
    this.logger.log(`Received request for full menu in language: ${language}`);
    return this.menuCategoryService.getFullMenuByLanguage(language);
  }
}

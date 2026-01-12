import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { MenuCategoryService } from './menu-category.service';
import type { MenuCategoryList } from 'src/generated-types/menu-category';

@ApiTags('menu-category')
@Controller('menu-category')
export class MenuCategoryController {
  constructor(private readonly menuCategoryService: MenuCategoryService) {}
  protected readonly logger = new Logger(MenuCategoryController.name);

  @Get()
  @ApiOperation({
    summary: 'Get menu categories by language',
    description: 'Retrieves the list of menu categories for the specified language',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the list of menu categories for the specified language',
  })
  getMenuCategoriesByLanguage(@Query('language') language: string): Observable<MenuCategoryList> {
    this.logger.log(`Received request for menu categories in language: ${language}`);
    return this.menuCategoryService.getMenuCategoriesByLanguage(language);
  }
}

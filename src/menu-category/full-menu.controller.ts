import { BadRequestException, Controller, Get, Logger, ParseEnumPipe, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Observable } from 'rxjs';

import { MenuCategoryService } from './menu-category.service';
import type { MenuCategoryListWithItems } from 'src/generated-types/menu-category';
import { Language } from 'src/common/enums/language.enum';

@ApiTags('full-menu')
@Controller('full-menu')
@UseInterceptors(CacheInterceptor)
@CacheTTL(60 * 1000)
export class FullMenuController {
  private readonly logger = new Logger(FullMenuController.name);
  constructor(private readonly menuCategoryService: MenuCategoryService) {}

  @Get()
  @ApiOperation({
    summary: 'Get full menu by language',
    description: 'Retrieves the complete menu structure for the specified language',
  })
  @ApiQuery({
    name: 'language',
    required: true,
    enum: Language,
    description: 'Language code for the menu (EN, UA, RU)',
  })
  @ApiResponse({
    status: 200,
    type: Observable<MenuCategoryListWithItems>,
    description: 'Returns the full menu structure for the specified language',
  })
  getFullMenuByLanguage(
    @Query(
      'language',
      new ParseEnumPipe(Language, {
        exceptionFactory: () =>
          new BadRequestException(`Invalid language. Allowed: ${Object.values(Language).join(', ')}`),
      }),
    )
    language: Language,
  ): Observable<MenuCategoryListWithItems> {
    this.logger.log(`Received request for full menu in language: ${language}`);
    return this.menuCategoryService.getFullMenuByLanguage(language);
  }
}

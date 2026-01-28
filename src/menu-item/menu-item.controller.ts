import { BadRequestException, Controller, Get, Logger, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { UserRole } from 'src/generated-types/user';
import { Protected } from 'src/auth/decorators/protected.decorator';
import { MenuItemService } from './menu-item.service';

import type { MenuItem, MenuItemList } from 'src/generated-types/menu-item';

@ApiTags('menu-item')
@ApiBearerAuth()
@Protected(UserRole.ADMIN, UserRole.MODERATOR)
@Controller('menu-item')
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}
  protected readonly logger = new Logger(MenuItemController.name);

  @Get()
  @ApiOperation({
    summary: 'Get menu items by category ID',
    description: 'Retrieves the list of menu items for the specified category ID',
  })
  @ApiQuery({
    name: 'categoryId',
    required: true,
    description: 'UUID of the menu category',
  })
  @ApiResponse({
    status: 200,
    type: Observable<MenuItemList>,
    description: 'Returns the list of menu items for the specified category ID',
  })
  getMenuItemsByCategoryId(
    @Query(
      'categoryId',
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException('Invalid UUID format for categoryId'),
      }),
    )
    categoryId: string,
  ): Observable<MenuItemList> {
    this.logger.log(`Fetching menu items for category ID: ${categoryId}`);
    return this.menuItemService.getMenuItemsByCategoryId(categoryId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get menu item by ID',
    description: 'Retrieves a menu item by its UUID',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID of the menu item',
  })
  @ApiResponse({
    status: 200,
    type: Observable<MenuItem>,
    description: 'Returns the menu item for the specified ID',
  })
  getMenuItemById(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException('Invalid UUID format for menu item ID'),
      }),
    )
    id: string,
  ): Observable<MenuItem> {
    this.logger.log(`Fetching menu item with ID: ${id}`);
    return this.menuItemService.getMenuItemById(id);
  }
}

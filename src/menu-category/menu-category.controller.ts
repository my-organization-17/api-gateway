import { Body, Controller, Delete, Get, Logger, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { MenuCategoryService } from './menu-category.service';
import type {
  CreateMenuCategoryRequest,
  MenuCategory,
  MenuCategoryList,
  StatusResponse,
  UpdateMenuCategoryRequest,
} from 'src/generated-types/menu-category';

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
    type: Observable<MenuCategoryList>,
    description: 'Returns the list of menu categories for the specified language',
  })
  getMenuCategoriesByLanguage(@Query('language') language: string): Observable<MenuCategoryList> {
    this.logger.log(`Received request for menu categories in language: ${language}`);
    return this.menuCategoryService.getMenuCategoriesByLanguage(language);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get menu category by ID',
    description: 'Retrieves a specific menu category by its ID',
  })
  @ApiResponse({
    status: 200,
    type: Observable<MenuCategory>,
    description: 'Returns the menu category with the specified ID',
  })
  getMenuCategoryById(@Param('id') id: string): Observable<MenuCategory> {
    this.logger.log(`Received request for menu category with ID: ${id}`);
    return this.menuCategoryService.getMenuCategoryById(id);
  }

  @Post('create')
  @ApiOperation({
    summary: 'Create a new menu category',
    description: 'Creates a new menu category with the provided data',
  })
  @ApiResponse({
    status: 201,
    type: Observable<MenuCategory>,
    description: 'Returns the newly created menu category',
  })
  createMenuCategory(@Body() data: CreateMenuCategoryRequest): Observable<MenuCategory> {
    this.logger.log('Received request to create a new menu category');
    return this.menuCategoryService.createMenuCategory(data);
  }

  @Post('update')
  @ApiOperation({
    summary: 'Update an existing menu category',
    description: 'Updates an existing menu category with the provided data',
  })
  @ApiResponse({
    status: 200,
    type: Observable<MenuCategory>,
    description: 'Returns the updated menu category',
  })
  updateMenuCategory(@Body() data: UpdateMenuCategoryRequest): Observable<MenuCategory> {
    this.logger.log(`Received request to update menu category with ID: ${data.id}`);
    return this.menuCategoryService.updateMenuCategory(data);
  }

  @Post('change-position')
  @ApiOperation({
    summary: 'Change menu category position',
    description: 'Changes the position of a menu category',
  })
  @ApiResponse({
    status: 200,
    type: Observable<MenuCategory>,
    description: 'Returns the menu category with the updated position',
  })
  changeMenuCategoryPosition(@Body() data: { id: string; position: number }): Observable<MenuCategory> {
    this.logger.log(
      `Received request to change position of menu category with ID: ${data.id} to position: ${data.position}`,
    );
    return this.menuCategoryService.changeMenuCategoryPosition(data.id, data.position);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a menu category',
    description: 'Deletes the menu category with the specified ID',
  })
  @ApiResponse({
    status: 200,
    type: Observable<{ success: boolean }>,
    description: 'Returns the status of the delete operation',
  })
  deleteMenuCategory(@Param('id') id: string): Observable<StatusResponse> {
    this.logger.log(`Received request to delete menu category with ID: ${id}`);
    return this.menuCategoryService.deleteMenuCategory(id);
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { Language } from 'src/common/enums';
import { Protected } from 'src/auth/decorators';
import { UserRole } from 'src/generated-types/user';

import { PositionRequestDto } from '../common/dto/position.request.dto';
import { MenuCategoryService } from './menu-category.service';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';

import type { MenuCategory, MenuCategoryList, StatusResponse } from 'src/generated-types/menu-category';

@ApiTags('menu-category')
@ApiBearerAuth()
@Protected(UserRole.ADMIN, UserRole.MODERATOR)
@Controller('menu-category')
export class MenuCategoryController {
  constructor(private readonly menuCategoryService: MenuCategoryService) {}
  protected readonly logger = new Logger(MenuCategoryController.name);

  @Get()
  @ApiOperation({
    summary: 'Get menu categories by language',
    description: 'Retrieves the list of menu categories for the specified language',
  })
  @ApiQuery({
    name: 'language',
    required: true,
    enum: Language,
    description: 'Language code for the menu categories (EN, UA, RU)',
  })
  @ApiResponse({
    status: 200,
    type: Observable<MenuCategoryList>,
    description: 'Returns the list of menu categories for the specified language',
  })
  getMenuCategoriesByLanguage(
    @Query(
      'language',
      new ParseEnumPipe(Language, {
        exceptionFactory: () =>
          new BadRequestException(`Invalid language. Allowed: ${Object.values(Language).join(', ')}`),
      }),
    )
    language: Language,
  ): Observable<MenuCategoryList> {
    this.logger.log(`Received request for menu categories in language: ${language}`);
    return this.menuCategoryService.getMenuCategoriesByLanguage(language);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get menu category by ID',
    description: 'Retrieves a specific menu category by its ID',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the menu category to retrieve',
  })
  @ApiResponse({
    status: 200,
    type: Observable<MenuCategory>,
    description: 'Returns the menu category with the specified ID',
  })
  getMenuCategoryById(@Param('id', new ParseUUIDPipe()) id: string): Observable<MenuCategory> {
    this.logger.log(`Received request for menu category with ID: ${id}`);
    return this.menuCategoryService.getMenuCategoryById(id);
  }

  @Post('create')
  @ApiOperation({
    summary: 'Create a new menu category',
    description: 'Creates a new menu category with the provided data',
  })
  @ApiBody({
    type: CreateMenuCategoryDto,
    description: 'Data for the new menu category',
  })
  @ApiResponse({
    status: 201,
    type: Observable<MenuCategory>,
    description: 'Returns the newly created menu category',
  })
  createMenuCategory(@Body() data: CreateMenuCategoryDto): Observable<MenuCategory> {
    this.logger.log('Received request to create a new menu category');
    return this.menuCategoryService.createMenuCategory(data);
  }

  @Patch('update/:id')
  @ApiOperation({
    summary: 'Update an existing menu category',
    description: 'Updates an existing menu category with the provided data',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the menu category to update',
  })
  @ApiBody({
    type: UpdateMenuCategoryDto,
    description: 'Updated data for the menu category',
  })
  @ApiResponse({
    status: 200,
    type: Observable<MenuCategory>,
    description: 'Returns the updated menu category',
  })
  updateMenuCategory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() data: UpdateMenuCategoryDto,
  ): Observable<MenuCategory> {
    this.logger.log(`Received request to update menu category with ID: ${id}`);
    return this.menuCategoryService.updateMenuCategory(id, data);
  }

  @Patch('change-position/:id')
  @ApiOperation({
    summary: 'Change menu category position',
    description: 'Changes the position of a menu category',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the menu category to change position',
  })
  @ApiResponse({
    status: 200,
    type: Observable<MenuCategory>,
    description: 'Returns the menu category with the updated position',
  })
  changeMenuCategoryPosition(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() { position }: PositionRequestDto,
  ): Observable<MenuCategory> {
    this.logger.log(`Received request to change position of menu category with ID: ${id} to position: ${position}`);
    return this.menuCategoryService.changeMenuCategoryPosition(id, position);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a menu category',
    description: 'Deletes the menu category with the specified ID',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the menu category to delete',
  })
  @ApiResponse({
    status: 200,
    type: Observable<StatusResponse>,
    description: 'Returns the status of the delete operation',
  })
  deleteMenuCategory(@Param('id', new ParseUUIDPipe()) id: string): Observable<StatusResponse> {
    this.logger.log(`Received request to delete menu category with ID: ${id}`);
    return this.menuCategoryService.deleteMenuCategory(id);
  }
}

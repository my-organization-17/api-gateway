import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { UserRole } from 'src/generated-types/user';
import { Protected } from 'src/auth/decorators/protected.decorator';
import { PositionRequestDto } from 'src/common/dto';

import { MenuItemService } from './menu-item.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

import type { MenuItem, MenuItemList, StatusResponse } from 'src/generated-types/menu-item';

@ApiTags('menu-item')
@Protected(UserRole.ADMIN, UserRole.MODERATOR)
@Controller('menu-item')
export class MenuItemController {
  private readonly logger = new Logger(MenuItemController.name);
  constructor(private readonly menuItemService: MenuItemService) {}

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

  @Post('/create')
  @ApiOperation({
    summary: 'Create a new menu item',
    description: 'Creates a new menu item with the provided details',
  })
  @ApiBody({
    type: CreateMenuItemDto,
    description: 'Data transfer object for creating a new menu item',
  })
  @ApiResponse({
    status: 201,
    type: Observable<MenuItem>,
    description: 'Returns the created menu item',
  })
  createMenuItem(@Body() data: CreateMenuItemDto): Observable<MenuItem> {
    this.logger.log(`Creating a new menu item with data: ${JSON.stringify(data)}`);
    return this.menuItemService.createMenuItem(data);
  }

  @Patch('/update')
  @ApiOperation({
    summary: 'Update an existing menu item',
    description: 'Updates the details of an existing menu item',
  })
  @ApiBody({
    type: UpdateMenuItemDto,
    description: 'Data transfer object for updating a menu item',
  })
  @ApiResponse({
    status: 200,
    type: Observable<MenuItem>,
    description: 'Returns the updated menu item',
  })
  updateMenuItem(@Body() data: UpdateMenuItemDto): Observable<MenuItem> {
    this.logger.log(`Updating menu item with data: ${JSON.stringify(data)}`);
    return this.menuItemService.updateMenuItem(data);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a menu item by ID',
    description: 'Deletes the menu item with the specified UUID',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID of the menu item to delete',
  })
  @ApiResponse({
    status: 200,
    type: Observable<MenuItem>,
    description: 'Returns the deleted menu item',
  })
  deleteMenuItem(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException('Invalid UUID format for menu item ID'),
      }),
    )
    id: string,
  ): Observable<StatusResponse> {
    this.logger.log(`Deleting menu item with ID: ${id}`);
    return this.menuItemService.deleteMenuItem(id);
  }

  @Patch('change-position/:id')
  @ApiOperation({
    summary: 'Change menu item position',
    description: 'Changes the position of a menu item',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the menu item to change position',
  })
  @ApiResponse({
    status: 200,
    type: Observable<MenuItem>,
    description: 'Returns the menu item with the updated position',
  })
  changeMenuItemPosition(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException('Invalid UUID format for menu item ID'),
      }),
    )
    id: string,
    @Body() { position }: PositionRequestDto,
  ): Observable<MenuItem> {
    this.logger.log(`Received request to change position of menu item with ID: ${id} to position: ${position}`);
    return this.menuItemService.changeMenuItemPosition({ id, position });
  }
}

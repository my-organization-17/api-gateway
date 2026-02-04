import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import {
  MENU_ITEM_SERVICE_NAME,
  type CreateMenuItemRequest,
  type MenuItem,
  type MenuItemList,
  type MenuItemServiceClient,
  type StatusResponse,
  type UpdateMenuItemRequest,
} from 'src/generated-types/menu-item';

@Injectable()
export class MenuItemService implements OnModuleInit {
  private menuItemService: MenuItemServiceClient;
  protected readonly logger = new Logger(MenuItemService.name);

  constructor(
    @Inject('MENU_ITEM_CLIENT')
    private readonly menuItemMicroserviceClient: ClientGrpc,
  ) {}
  onModuleInit() {
    this.menuItemService = this.menuItemMicroserviceClient.getService<MenuItemServiceClient>(MENU_ITEM_SERVICE_NAME);
  }

  getMenuItemsByCategoryId(id: string): Observable<MenuItemList> {
    this.logger.log(`Fetching menu items for category ID: ${id}`);
    try {
      return this.menuItemService.getMenuItemsByCategoryId({ id });
    } catch (error) {
      this.logger.error(`Failed to fetch menu items: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }

  getMenuItemById(id: string): Observable<MenuItem> {
    this.logger.log(`Fetching menu item by ID: ${id}`);
    try {
      return this.menuItemService.getMenuItemById({ id });
    } catch (error) {
      this.logger.error(`Failed to fetch menu item by ID: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }

  createMenuItem(data: CreateMenuItemRequest): Observable<MenuItem> {
    this.logger.log(`Creating new menu item with data: ${JSON.stringify(data)}`);
    try {
      return this.menuItemService.createMenuItem(data);
    } catch (error) {
      this.logger.error(`Failed to create menu item: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }

  updateMenuItem(data: UpdateMenuItemRequest): Observable<MenuItem> {
    this.logger.log(`Updating menu item with data: ${JSON.stringify(data)}`);
    try {
      return this.menuItemService.updateMenuItem(data);
    } catch (error) {
      this.logger.error(`Failed to update menu item: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }

  deleteMenuItem(id: string): Observable<StatusResponse> {
    this.logger.log(`Deleting menu item with ID: ${id}`);
    try {
      return this.menuItemService.deleteMenuItem({ id });
    } catch (error) {
      this.logger.error(`Failed to delete menu item: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }

  changeMenuItemPosition({ id, position }: { id: string; position: number }): Observable<MenuItem> {
    this.logger.log(`Changing position of menu item ID: ${id} to position: ${position}`);
    try {
      return this.menuItemService.changeMenuItemPosition({ id, position });
    } catch (error) {
      this.logger.error(`Failed to change menu item position: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }
}

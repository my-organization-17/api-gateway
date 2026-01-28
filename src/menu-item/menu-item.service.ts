import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import {
  MENU_ITEM_SERVICE_NAME,
  type MenuItem,
  type MenuItemList,
  type MenuItemServiceClient,
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
      const menuItemList = this.menuItemService.getMenuItemsByCategoryId({ id });
      console.log('Menu items fetched:', menuItemList);
      return menuItemList;
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
}

import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import {
  MENU_ITEM_SERVICE_NAME,
  MenuItemListWithTranslation,
  MenuItemWithTranslation,
  type CreateMenuItemRequest,
  type MenuItem,
  type MenuItemServiceClient,
  type StatusResponse,
  type UpdateMenuItemRequest,
} from 'src/generated-types/menu-item';
import { MetricsService } from 'src/supervision/metrics/metrics.service';

const TARGET_SERVICE = 'menu-microservice';

@Injectable()
export class MenuItemService implements OnModuleInit {
  private menuItemService: MenuItemServiceClient;
  private readonly logger = new Logger(MenuItemService.name);

  constructor(
    @Inject('MENU_ITEM_CLIENT')
    private readonly menuItemMicroserviceClient: ClientGrpc,
    private readonly metricsService: MetricsService,
  ) {}

  onModuleInit() {
    this.menuItemService = this.menuItemMicroserviceClient.getService<MenuItemServiceClient>(MENU_ITEM_SERVICE_NAME);
  }

  getMenuItemsByCategoryId(id: string): Observable<MenuItemListWithTranslation> {
    this.logger.log(`Fetching menu items for category ID: ${id}`);
    return this.menuItemService
      .getMenuItemsByCategoryId({ id })
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'getMenuItemsByCategoryId'));
  }

  getMenuItemById(id: string): Observable<MenuItemWithTranslation> {
    this.logger.log(`Fetching menu item by ID: ${id}`);
    return this.menuItemService
      .getMenuItemById({ id })
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'getMenuItemById'));
  }

  createMenuItem(data: CreateMenuItemRequest): Observable<MenuItem> {
    this.logger.log(`Creating new menu item with data: ${JSON.stringify(data)}`);
    return this.menuItemService
      .createMenuItem(data)
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'createMenuItem'));
  }

  updateMenuItem(data: UpdateMenuItemRequest): Observable<MenuItem> {
    this.logger.log(`Updating menu item with data: ${JSON.stringify(data)}`);
    return this.menuItemService
      .updateMenuItem(data)
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'updateMenuItem'));
  }

  deleteMenuItem(id: string): Observable<StatusResponse> {
    this.logger.log(`Deleting menu item with ID: ${id}`);
    return this.menuItemService
      .deleteMenuItem({ id })
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'deleteMenuItem'));
  }

  changeMenuItemPosition({ id, position }: { id: string; position: number }): Observable<MenuItem> {
    this.logger.log(`Changing position of menu item ID: ${id} to position: ${position}`);
    return this.menuItemService
      .changeMenuItemPosition({ id, position })
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'changeMenuItemPosition'));
  }
}

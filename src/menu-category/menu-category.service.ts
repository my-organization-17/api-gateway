import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import {
  type CreateMenuCategoryRequest,
  MENU_CATEGORY_SERVICE_NAME,
  type MenuCategory,
  type MenuCategoryList,
  type MenuCategoryListWithItems,
  type MenuCategoryServiceClient,
  type StatusResponse,
} from 'src/generated-types/menu-category';
import { MetricsService } from 'src/supervision/metrics/metrics.service';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';

const TARGET_SERVICE = 'menu-microservice';

@Injectable()
export class MenuCategoryService implements OnModuleInit {
  private menuCategoryService: MenuCategoryServiceClient;
  protected readonly logger = new Logger(MenuCategoryService.name);

  constructor(
    @Inject('MENU_CATEGORY_CLIENT')
    private readonly menuCategoryMicroserviceClient: ClientGrpc,
    private readonly metricsService: MetricsService,
  ) {}

  onModuleInit() {
    this.menuCategoryService =
      this.menuCategoryMicroserviceClient.getService<MenuCategoryServiceClient>(MENU_CATEGORY_SERVICE_NAME);
  }

  getFullMenuByLanguage(language = 'EN'): Observable<MenuCategoryListWithItems> {
    this.logger.log(`Fetching full menu for language: ${language}`);
    return this.menuCategoryService
      .getFullMenuByLanguage({ language })
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'getFullMenuByLanguage'));
  }

  getMenuCategoriesByLanguage(language = 'EN'): Observable<MenuCategoryList> {
    this.logger.log(`Fetching menu categories for language: ${language}`);
    return this.menuCategoryService
      .getMenuCategoriesByLanguage({ language })
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'getMenuCategoriesByLanguage'));
  }

  getMenuCategoryById(id: string): Observable<MenuCategory> {
    this.logger.log(`Fetching menu category by ID: ${id}`);
    return this.menuCategoryService
      .getMenuCategoryById({ id })
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'getMenuCategoryById'));
  }

  createMenuCategory(data: CreateMenuCategoryRequest): Observable<MenuCategory> {
    this.logger.log(`Creating menu category with data: ${JSON.stringify(data)}`);
    return this.menuCategoryService
      .createMenuCategory(data)
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'createMenuCategory'));
  }

  updateMenuCategory(id: string, data: UpdateMenuCategoryDto): Observable<MenuCategory> {
    this.logger.log(`Updating menu category with ID: ${id} and data: ${JSON.stringify(data)}`);
    return this.menuCategoryService
      .updateMenuCategory({ id, ...data })
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'updateMenuCategory'));
  }

  changeMenuCategoryPosition(id: string, position: number): Observable<MenuCategory> {
    this.logger.log(`Changing position of menu category ID: ${id} to position: ${position}`);
    return this.menuCategoryService
      .changeMenuCategoryPosition({ id, position })
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'changeMenuCategoryPosition'));
  }

  deleteMenuCategory(id: string): Observable<StatusResponse> {
    this.logger.log(`Deleting menu category with ID: ${id}`);
    return this.menuCategoryService
      .deleteMenuCategory({ id })
      .pipe(this.metricsService.trackGrpcCall(TARGET_SERVICE, 'deleteMenuCategory'));
  }
}

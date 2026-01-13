import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import {
  CreateMenuCategoryRequest,
  MENU_CATEGORY_SERVICE_NAME,
  MenuCategory,
  MenuCategoryList,
  MenuCategoryListWithItems,
  MenuCategoryServiceClient,
  StatusResponse,
} from 'src/generated-types/menu-category';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';

@Injectable()
export class MenuCategoryService implements OnModuleInit {
  private menuCategoryService: MenuCategoryServiceClient;
  protected readonly logger = new Logger(MenuCategoryService.name);

  constructor(
    @Inject('MENU_CATEGORY_MICROSERVICE')
    private readonly menuCategoryMicroserviceClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.menuCategoryService =
      this.menuCategoryMicroserviceClient.getService<MenuCategoryServiceClient>(MENU_CATEGORY_SERVICE_NAME);
  }

  getFullMenuByLanguage(language = 'EN'): Observable<MenuCategoryListWithItems> {
    this.logger.log(`Fetching full menu for language: ${language}`);
    try {
      return this.menuCategoryService.getFullMenuByLanguage({ language });
    } catch (error) {
      this.logger.error(`Failed to fetch full menu: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }
  getMenuCategoriesByLanguage(language = 'EN'): Observable<MenuCategoryList> {
    this.logger.log(`Fetching menu categories for language: ${language}`);
    try {
      return this.menuCategoryService.getMenuCategoriesByLanguage({ language });
    } catch (error) {
      this.logger.error(`Failed to fetch menu categories: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }
  getMenuCategoryById(id: string): Observable<MenuCategory> {
    this.logger.log(`Fetching menu category by ID: ${id}`);
    try {
      return this.menuCategoryService.getMenuCategoryById({ id });
    } catch (error) {
      this.logger.error(`Failed to fetch menu category by ID: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }
  createMenuCategory(data: CreateMenuCategoryRequest): Observable<MenuCategory> {
    this.logger.log(`Creating menu category with data: ${JSON.stringify(data)}`);
    try {
      return this.menuCategoryService.createMenuCategory(data);
    } catch (error) {
      this.logger.error(`Failed to create menu category: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }
  updateMenuCategory(id: string, data: UpdateMenuCategoryDto): Observable<MenuCategory> {
    this.logger.log(`Updating menu category with ID: ${id} and data: ${JSON.stringify(data)}`);
    try {
      return this.menuCategoryService.updateMenuCategory({ id, ...data });
    } catch (error) {
      this.logger.error(`Failed to update menu category: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }
  changeMenuCategoryPosition(id: string, position: number): Observable<MenuCategory> {
    this.logger.log(`Changing position of menu category ID: ${id} to position: ${position}`);
    try {
      return this.menuCategoryService.changeMenuCategoryPosition({ id, position });
    } catch (error) {
      this.logger.error(`Failed to change menu category position: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }
  deleteMenuCategory(id: string): Observable<StatusResponse> {
    this.logger.log(`Deleting menu category with ID: ${id}`);
    try {
      return this.menuCategoryService.deleteMenuCategory({ id });
    } catch (error) {
      this.logger.error(`Failed to delete menu category: ${(error as Error).message || 'Unknown error'}`);
      throw error;
    }
  }
}

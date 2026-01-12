import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import {
  MENU_CATEGORY_SERVICE_NAME,
  MenuCategoryList,
  MenuCategoryListWithItems,
  MenuCategoryServiceClient,
} from 'src/generated-types/menu-category';

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
}

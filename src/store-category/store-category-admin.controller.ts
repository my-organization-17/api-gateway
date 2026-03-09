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
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { Protected } from 'src/auth/decorators';
import { PositionRequestDto } from 'src/common/dto';
import { UserRole } from 'src/generated-types/user';
import type {
  Id,
  StatusResponse,
  StoreCategory,
  StoreCategoryWithTranslations,
} from 'src/generated-types/store-category';

import { StoreCategoryService } from './store-category.service';
import { CreateStoreCategoryDto, UpdateStoreCategoryDto, UpsertStoreCategoryTranslationDto } from './dto';

@ApiTags('store-category')
@Protected(UserRole.ADMIN, UserRole.MODERATOR)
@Controller('store-category')
export class StoreCategoryAdminController {
  private readonly logger = new Logger(StoreCategoryAdminController.name);

  constructor(private readonly storeCategoryService: StoreCategoryService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get store category by ID',
    description: 'Retrieves a store category along with its translations based on the provided ID',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID of the store category',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the store category with translations for the specified ID',
  })
  getStoreCategoryById(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException('Invalid UUID format for store category ID'),
      }),
    )
    id: string,
  ): Observable<StoreCategoryWithTranslations> {
    this.logger.log(`Fetching store category by ID: ${id}`);
    return this.storeCategoryService.getStoreCategoryById(id);
  }

  @Post('/create')
  @ApiOperation({
    summary: 'Create a new store category',
    description: 'Creates a new store category with the provided details',
  })
  @ApiBody({
    type: CreateStoreCategoryDto,
    description: 'The details of the store category to be created',
  })
  @ApiResponse({
    status: 201,
    description: 'The store category has been successfully created',
  })
  createStoreCategory(@Body() data: CreateStoreCategoryDto): Observable<Id> {
    this.logger.log('Creating a new store category');
    return this.storeCategoryService.createStoreCategory(data);
  }

  @Patch('/update')
  @ApiOperation({
    summary: 'Update an existing store category',
    description: 'Updates the details of an existing store category based on the provided information',
  })
  @ApiBody({
    type: UpdateStoreCategoryDto,
    description: 'The updated details of the store category',
  })
  @ApiResponse({
    status: 200,
    description: 'The store category has been successfully updated',
  })
  updateStoreCategory(@Body() data: UpdateStoreCategoryDto): Observable<Id> {
    this.logger.log('Updating an existing store category');
    return this.storeCategoryService.updateStoreCategory(data);
  }

  @Delete('/delete/:id')
  @ApiOperation({
    summary: 'Delete a store category',
    description: 'Deletes a store category based on the provided ID',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID of the store category to be deleted',
  })
  @ApiResponse({
    status: 200,
    description: 'The store category has been successfully deleted',
  })
  deleteStoreCategory(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException('Invalid UUID format for store category ID'),
      }),
    )
    id: string,
  ): Observable<StatusResponse> {
    this.logger.log(`Deleting store category with ID: ${id}`);
    return this.storeCategoryService.deleteStoreCategory(id);
  }

  @Patch('change-position/:id')
  @ApiOperation({
    summary: 'Change store category position',
    description: 'Changes the position of a store category',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the store category to change position',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the store category with the updated position',
  })
  changeStoreCategoryPosition(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() { position }: PositionRequestDto,
  ): Observable<StoreCategory> {
    this.logger.log(`Received request to change position of store category with ID: ${id} to position: ${position}`);
    return this.storeCategoryService.changeStoreCategoryPosition({ id, sortOrder: position });
  }

  @Post('translation')
  @ApiOperation({
    summary: 'Upsert store category translation',
    description: 'Creates or updates a translation for a store category',
  })
  @ApiBody({
    type: UpsertStoreCategoryTranslationDto,
    description: 'The details of the store category translation to be upserted',
  })
  @ApiResponse({
    status: 200,
    description: 'The store category translation has been successfully upserted',
  })
  upsertStoreCategoryTranslation(@Body() data: UpsertStoreCategoryTranslationDto): Observable<Id> {
    this.logger.log(
      `Upserting translation for store category with ID: ${data.categoryId} and language: ${data.language}`,
    );
    return this.storeCategoryService.upsertStoreCategoryTranslation(data);
  }

  @Delete('translation/:id')
  @ApiOperation({
    summary: 'Delete store category translation',
    description: 'Deletes a translation for a store category based on the provided translation ID',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID of the store category translation to be deleted',
  })
  @ApiResponse({
    status: 200,
    description: 'The store category translation has been successfully deleted',
  })
  deleteStoreCategoryTranslation(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException('Invalid UUID format for store category translation ID'),
      }),
    )
    id: string,
  ): Observable<StatusResponse> {
    this.logger.log(`Deleting translation for store category with translation ID: ${id}`);
    return this.storeCategoryService.deleteStoreCategoryTranslation(id);
  }
}

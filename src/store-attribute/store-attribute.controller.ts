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
import { UserRole } from 'src/generated-types/user';

import { StoreAttributeService } from './store-attribute.service';
import {
  ChangeStoreAttributePositionDto,
  CreateStoreAttributeDto,
  UpdateStoreAttributeDto,
  UpsertStoreAttributeTranslationDto,
} from './dto';

import type { AttributeList, AttributeResponse, Id } from 'src/generated-types/store-attribute';

@ApiTags('store-attribute')
@Protected(UserRole.ADMIN, UserRole.MODERATOR)
@Controller('store-attribute')
export class StoreAttributeController {
  private readonly logger = new Logger(StoreAttributeController.name);

  constructor(private readonly storeAttributeService: StoreAttributeService) {}

  @Get('category/:categoryId')
  @ApiOperation({
    summary: 'Get attributes by category ID',
    description: 'Retrieves a list of attributes associated with the specified category ID',
  })
  @ApiParam({ name: 'categoryId', required: true, description: 'ID of the category' })
  @ApiResponse({ status: 200, description: 'List of attributes' })
  getAttributesByCategoryId(
    @Param(
      'categoryId',
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException('Invalid UUID format for store category ID'),
      }),
    )
    categoryId: string,
  ): Observable<AttributeList> {
    this.logger.log(`Fetching attributes for category ID: ${categoryId}`);
    return this.storeAttributeService.getAttributesByCategoryId(categoryId);
  }

  @Post('create')
  @ApiOperation({
    summary: 'Create a new store attribute',
    description: 'Creates a new store attribute with the provided data',
  })
  @ApiBody({ description: 'Data for creating a new store attribute', required: true })
  @ApiResponse({ status: 201, description: 'The created store attribute ID' })
  createAttribute(@Body() data: CreateStoreAttributeDto): Observable<Id> {
    this.logger.log(`Creating attribute with data: ${JSON.stringify(data)}`);
    return this.storeAttributeService.createAttribute(data);
  }

  @Patch('update')
  @ApiOperation({
    summary: 'Update an existing store attribute',
    description: 'Updates an existing store attribute with the provided data',
  })
  @ApiBody({ description: 'Data for updating an existing store attribute', required: true })
  @ApiResponse({ status: 200, description: 'The updated store attribute ID' })
  updateAttribute(@Body() data: UpdateStoreAttributeDto): Observable<Id> {
    this.logger.log(`Updating attribute with data: ${JSON.stringify(data)}`);
    return this.storeAttributeService.updateAttribute(data);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a store attribute',
    description: 'Deletes a store attribute by its ID',
  })
  @ApiParam({ name: 'id', required: true, description: 'ID of the store attribute to delete' })
  @ApiResponse({ status: 200, description: 'Status of the delete operation' })
  deleteAttribute(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException('Invalid UUID format for store attribute ID'),
      }),
    )
    id: string,
  ): Observable<{ success: boolean; message: string }> {
    this.logger.log(`Deleting attribute with ID: ${id}`);
    return this.storeAttributeService.deleteAttribute(id);
  }

  @Patch('change-position')
  @ApiOperation({
    summary: 'Change the position of a store attribute',
    description: 'Changes the sort order of a store attribute',
  })
  @ApiBody({ description: 'Data for changing the position of a store attribute', required: true })
  @ApiResponse({ status: 200, description: 'The updated store attribute with new position' })
  changeAttributePosition(@Body() data: ChangeStoreAttributePositionDto): Observable<AttributeResponse> {
    this.logger.log(`Changing position of attribute with ID: ${data.id} to new position: ${data.sortOrder}`);
    return this.storeAttributeService.changeAttributePosition(data);
  }

  @Post('translation/upsert')
  @ApiOperation({
    summary: 'Upsert a store attribute translation',
    description: 'Creates or updates a translation for a store attribute',
  })
  @ApiBody({ description: 'Data for upserting a store attribute translation', required: true })
  @ApiResponse({ status: 200, description: 'The upserted store attribute translation ID' })
  upsertAttributeTranslation(@Body() data: UpsertStoreAttributeTranslationDto): Observable<Id> {
    this.logger.log(
      `Upserting translation for attribute ID: ${data.attributeId} with language code: ${data.language} and name: ${data.name}`,
    );
    return this.storeAttributeService.upsertAttributeTranslation(data);
  }

  @Delete('translation/:id')
  @ApiOperation({
    summary: 'Delete a store attribute translation',
    description: 'Deletes a store attribute translation by its ID',
  })
  @ApiParam({ name: 'id', required: true, description: 'ID of the store attribute translation to delete' })
  @ApiResponse({ status: 200, description: 'Status of the delete operation' })
  deleteAttributeTranslation(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException('Invalid UUID format for store attribute translation ID'),
      }),
    )
    id: string,
  ): Observable<{ success: boolean; message: string }> {
    this.logger.log(`Deleting attribute translation with ID: ${id}`);
    return this.storeAttributeService.deleteAttributeTranslation(id);
  }
}

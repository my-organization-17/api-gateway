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

import { Protected } from 'src/auth/decorators/protected.decorator';
import { PositionRequestDto } from 'src/common/dto';
import { UserRole } from 'src/generated-types/user';
import type { Id, StatusResponse, StoreItemWithOption } from 'src/generated-types/store-item';

import { StoreItemService } from './store-item.service';
import {
  AddStoreItemBasePriceDto,
  AddStoreItemImageDto,
  AddStoreItemVariantDto,
  AddVariantPriceDto,
  CreateStoreItemDto,
  UpdateStoreItemDto,
  UpsertItemAttributeTranslationDto,
  UpsertStoreItemTranslationDto,
} from './dto';

@ApiTags('store-item')
@Protected(UserRole.ADMIN, UserRole.MODERATOR)
@Controller('store-item')
export class StoreItemAdminController {
  private readonly logger = new Logger(StoreItemAdminController.name);

  constructor(private readonly storeItemService: StoreItemService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get store item by ID',
    description: 'Retrieves a store item with all its options based on the provided ID',
  })
  @ApiParam({ name: 'id', required: true, description: 'UUID of the store item' })
  @ApiResponse({ status: 200, description: 'Returns the store item with options for the specified ID' })
  getStoreItemById(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException('Invalid UUID format for store item ID'),
      }),
    )
    id: string,
  ): Observable<StoreItemWithOption> {
    this.logger.log(`Fetching store item by ID: ${id}`);
    return this.storeItemService.getStoreItemById(id);
  }

  @Post('/create')
  @ApiOperation({
    summary: 'Create a new store item',
    description: 'Creates a new store item with the provided details',
  })
  @ApiBody({ type: CreateStoreItemDto, description: 'The details of the store item to be created' })
  @ApiResponse({ status: 201, description: 'The store item has been successfully created' })
  createStoreItem(@Body() data: CreateStoreItemDto): Observable<Id> {
    this.logger.log('Creating a new store item');
    return this.storeItemService.createStoreItem(data);
  }

  @Patch('/update')
  @ApiOperation({
    summary: 'Update an existing store item',
    description: 'Updates the details of an existing store item based on the provided information',
  })
  @ApiBody({ type: UpdateStoreItemDto, description: 'The updated details of the store item' })
  @ApiResponse({ status: 200, description: 'The store item has been successfully updated' })
  updateStoreItem(@Body() data: UpdateStoreItemDto): Observable<Id> {
    this.logger.log('Updating an existing store item');
    return this.storeItemService.updateStoreItem(data);
  }

  @Delete('/delete/:id')
  @ApiOperation({
    summary: 'Delete a store item',
    description: 'Deletes a store item based on the provided ID',
  })
  @ApiParam({ name: 'id', required: true, description: 'UUID of the store item to be deleted' })
  @ApiResponse({ status: 200, description: 'The store item has been successfully deleted' })
  deleteStoreItem(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException('Invalid UUID format for store item ID'),
      }),
    )
    id: string,
  ): Observable<StatusResponse> {
    this.logger.log(`Deleting store item with ID: ${id}`);
    return this.storeItemService.deleteStoreItem(id);
  }

  @Patch('change-position/:id')
  @ApiOperation({
    summary: 'Change store item position',
    description: 'Changes the sort order position of a store item',
  })
  @ApiParam({ name: 'id', required: true, description: 'UUID of the store item to reposition' })
  @ApiResponse({ status: 200, description: 'Returns the store item with the updated position' })
  changeStoreItemPosition(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() { position }: PositionRequestDto,
  ): Observable<StoreItemWithOption> {
    this.logger.log(`Received request to change position of store item with ID: ${id} to position: ${position}`);
    return this.storeItemService.changeStoreItemPosition({ itemId: id, sortOrder: position });
  }

  @Post('translation')
  @ApiOperation({
    summary: 'Upsert store item translation',
    description: 'Creates or updates a translation for a store item',
  })
  @ApiBody({ type: UpsertStoreItemTranslationDto, description: 'The translation details to be upserted' })
  @ApiResponse({ status: 200, description: 'The store item translation has been successfully upserted' })
  upsertStoreItemTranslation(@Body() data: UpsertStoreItemTranslationDto): Observable<Id> {
    this.logger.log(`Upserting translation for store item with ID: ${data.itemId} and language: ${data.language}`);
    return this.storeItemService.upsertStoreItemTranslation(data);
  }

  @Delete('translation/:id')
  @ApiOperation({
    summary: 'Delete store item translation',
    description: 'Deletes a translation for a store item based on the provided translation ID',
  })
  @ApiParam({ name: 'id', required: true, description: 'UUID of the store item translation to be deleted' })
  @ApiResponse({ status: 200, description: 'The store item translation has been successfully deleted' })
  deleteStoreItemTranslation(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException('Invalid UUID format for store item translation ID'),
      }),
    )
    id: string,
  ): Observable<StatusResponse> {
    this.logger.log(`Deleting translation for store item with translation ID: ${id}`);
    return this.storeItemService.deleteStoreItemTranslation(id);
  }

  @Post('image')
  @ApiOperation({
    summary: 'Add image to store item',
    description: 'Adds a new image to the specified store item',
  })
  @ApiBody({ type: AddStoreItemImageDto, description: 'The image details to be added' })
  @ApiResponse({ status: 201, description: 'The image has been successfully added' })
  addStoreItemImage(@Body() data: AddStoreItemImageDto): Observable<Id> {
    this.logger.log(`Adding image to store item with ID: ${data.itemId}`);
    return this.storeItemService.addStoreItemImage(data);
  }

  @Delete('image/:id')
  @ApiOperation({
    summary: 'Remove image from store item',
    description: 'Removes an image from a store item based on the provided image ID',
  })
  @ApiParam({ name: 'id', required: true, description: 'UUID of the image to be removed' })
  @ApiResponse({ status: 200, description: 'The image has been successfully removed' })
  removeStoreItemImage(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException('Invalid UUID format for store item image ID'),
      }),
    )
    id: string,
  ): Observable<StatusResponse> {
    this.logger.log(`Removing image with ID: ${id}`);
    return this.storeItemService.removeStoreItemImage(id);
  }

  @Patch('image/change-position/:id')
  @ApiOperation({
    summary: 'Change store item image position',
    description: 'Changes the sort order position of a store item image',
  })
  @ApiParam({ name: 'id', required: true, description: 'UUID of the image to reposition' })
  @ApiResponse({ status: 200, description: 'Returns the image ID with the updated position' })
  changeStoreItemImagePosition(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() { position }: PositionRequestDto,
  ): Observable<Id> {
    this.logger.log(`Changing position of image with ID: ${id} to sort order: ${position}`);
    return this.storeItemService.changeStoreItemImagePosition({ imageId: id, sortOrder: position });
  }

  @Post('variant')
  @ApiOperation({
    summary: 'Add variant to store item',
    description: 'Links an existing attribute to a store item as a variant',
  })
  @ApiBody({ type: AddStoreItemVariantDto, description: 'The variant details to be added' })
  @ApiResponse({ status: 201, description: 'The variant has been successfully added' })
  addStoreItemVariant(@Body() data: AddStoreItemVariantDto): Observable<Id> {
    this.logger.log(`Adding variant with attribute ID: ${data.attributeId} to store item with ID: ${data.itemId}`);
    return this.storeItemService.addStoreItemVariant(data);
  }

  @Delete('variant/:id')
  @ApiOperation({
    summary: 'Remove variant from store item',
    description: 'Removes a variant link from a store item based on the provided variant ID',
  })
  @ApiParam({ name: 'id', required: true, description: 'UUID of the variant to be removed' })
  @ApiResponse({ status: 200, description: 'The variant has been successfully removed' })
  removeStoreItemVariant(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException('Invalid UUID format for store item variant ID'),
      }),
    )
    id: string,
  ): Observable<StatusResponse> {
    this.logger.log(`Removing variant with ID: ${id}`);
    return this.storeItemService.removeStoreItemVariant(id);
  }

  @Post('variant/translation')
  @ApiOperation({
    summary: 'Upsert item attribute translation',
    description: 'Creates or updates the translated value for a variant attribute in a specific language',
  })
  @ApiBody({ type: UpsertItemAttributeTranslationDto, description: 'The attribute translation details to be upserted' })
  @ApiResponse({ status: 200, description: 'The attribute translation has been successfully upserted' })
  upsertItemAttributeTranslation(@Body() data: UpsertItemAttributeTranslationDto): Observable<Id> {
    this.logger.log(
      `Upserting attribute translation for item attribute ID: ${data.itemAttributeId} and language: ${data.language}`,
    );
    return this.storeItemService.upsertItemAttributeTranslation(data);
  }

  @Post('variant/price')
  @ApiOperation({
    summary: 'Add price for variant',
    description: 'Adds a price entry for a specific store item variant',
  })
  @ApiBody({ type: AddVariantPriceDto, description: 'The variant price details to be added' })
  @ApiResponse({ status: 201, description: 'The variant price has been successfully added' })
  addVariantPrice(@Body() data: AddVariantPriceDto): Observable<Id> {
    this.logger.log(`Adding price for variant with item attribute ID: ${data.itemAttributeId}`);
    return this.storeItemService.addVariantPrice(data);
  }

  @Delete('variant/price/:id')
  @ApiOperation({
    summary: 'Remove variant price',
    description: 'Removes a price entry for a variant based on the provided price ID',
  })
  @ApiParam({ name: 'id', required: true, description: 'UUID of the variant price to be removed' })
  @ApiResponse({ status: 200, description: 'The variant price has been successfully removed' })
  removeVariantPrice(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException('Invalid UUID format for variant price ID'),
      }),
    )
    id: string,
  ): Observable<StatusResponse> {
    this.logger.log(`Removing variant price with ID: ${id}`);
    return this.storeItemService.removeVariantPrice(id);
  }

  @Post('base-price')
  @ApiOperation({
    summary: 'Add base price to store item',
    description: 'Adds a base price to a store item (for items without variants)',
  })
  @ApiBody({ type: AddStoreItemBasePriceDto, description: 'The base price details to be added' })
  @ApiResponse({ status: 201, description: 'The base price has been successfully added' })
  addStoreItemBasePrice(@Body() data: AddStoreItemBasePriceDto): Observable<Id> {
    this.logger.log(`Adding base price for store item with ID: ${data.itemId}`);
    return this.storeItemService.addStoreItemBasePrice(data);
  }

  @Delete('base-price/:id')
  @ApiOperation({
    summary: 'Remove base price from store item',
    description: 'Removes a base price from a store item based on the provided price ID',
  })
  @ApiParam({ name: 'id', required: true, description: 'UUID of the base price to be removed' })
  @ApiResponse({ status: 200, description: 'The base price has been successfully removed' })
  removeStoreItemBasePrice(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException('Invalid UUID format for store item base price ID'),
      }),
    )
    id: string,
  ): Observable<StatusResponse> {
    this.logger.log(`Removing base price with ID: ${id}`);
    return this.storeItemService.removeStoreItemBasePrice(id);
  }
}

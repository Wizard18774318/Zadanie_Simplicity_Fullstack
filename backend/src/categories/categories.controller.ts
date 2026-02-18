import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { CategoriesService } from './categories.service.js';
import { CategoryResponseDto } from '../announcements/dto/announcement-response.dto.js';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all categories' })
  @ApiOkResponse({ description: 'List of categories', type: [CategoryResponseDto] })
  findAll() {
    return this.categoriesService.findAll();
  }
}

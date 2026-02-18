import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindAnnouncementsQueryDto {
  @ApiPropertyOptional({ description: 'Search in title and content', example: 'road' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by category ID', example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  category?: number;
}

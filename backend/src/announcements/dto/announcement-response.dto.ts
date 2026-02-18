/**
 * Response shape for announcement endpoints.
 * Flattens the join-table categories into a clean array.
 */
import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'City' })
  name: string;
}

export class AnnouncementResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Road Closure Notice' })
  title: string;

  @ApiProperty({ example: 'Main street will be closed for repairs.' })
  content: string;

  @ApiProperty({ example: '2025-06-15T10:00:00.000Z' })
  publicationDate: Date;

  @ApiProperty({ example: '2025-06-10T08:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-06-10T08:30:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: [CategoryResponseDto] })
  categories: CategoryResponseDto[];
}

/**
 * Maps a raw Prisma announcement (with nested join-table categories)
 * to a clean response DTO with a flat categories array.
 */
export function toAnnouncementResponse(announcement: {
  id: number;
  title: string;
  content: string;
  publicationDate: Date;
  createdAt: Date;
  updatedAt: Date;
  categories: { category: { id: number; name: string } }[];
}): AnnouncementResponseDto {
  return {
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    publicationDate: announcement.publicationDate,
    createdAt: announcement.createdAt,
    updatedAt: announcement.updatedAt,
    categories: announcement.categories.map((ac) => ({
      id: ac.category.id,
      name: ac.category.name,
    })),
  };
}

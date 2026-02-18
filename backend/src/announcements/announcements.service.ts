import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAnnouncementDto } from './dto/create-announcement.dto.js';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto.js';
import {
  AnnouncementResponseDto,
  toAnnouncementResponse,
} from './dto/announcement-response.dto.js';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Parse date string in MM/DD/YYYY HH:mm format to a UTC Date object.
   */
  private parsePublicationDate(dateStr: string): Date {
    const [datePart, timePart] = dateStr.split(' ');
    const [month, day, year] = datePart.split('/').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    return new Date(Date.UTC(year, month - 1, day, hours, minutes));
  }

  /**
   * Validate that all provided category IDs exist in the database.
   * Throws BadRequestException if any are missing.
   */
  private async validateCategoryIds(categoryIds: number[]): Promise<void> {
    const existing = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true },
    });

    const existingIds = new Set(existing.map((c) => c.id));
    const invalid = categoryIds.filter((id) => !existingIds.has(id));

    if (invalid.length > 0) {
      throw new BadRequestException(
        `Category IDs do not exist: ${invalid.join(', ')}`,
      );
    }
  }

  /**
   * Standard include for categories in announcement queries
   */
  private get includeCategories() {
    return {
      categories: {
        include: {
          category: true,
        },
      },
    };
  }

  /**
   * List all announcements with optional filtering.
   * - search: text search on title and content (case-insensitive)
   * - categoryId: filter by category ID
   * Default sort: updatedAt descending
   */
  async findAll(
    search?: string,
    categoryId?: number,
  ): Promise<AnnouncementResponseDto[]> {
    const where: Prisma.AnnouncementWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categories = {
        some: { categoryId },
      };
    }

    const announcements = await this.prisma.announcement.findMany({
      where,
      include: this.includeCategories,
      orderBy: { updatedAt: 'desc' },
    });

    return announcements.map(toAnnouncementResponse);
  }

  /**
   * Get a single announcement by ID.
   */
  async findOne(id: number): Promise<AnnouncementResponseDto> {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: this.includeCategories,
    });

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    return toAnnouncementResponse(announcement);
  }

  /**
   * Create a new announcement.
   */
  async create(dto: CreateAnnouncementDto): Promise<AnnouncementResponseDto> {
    await this.validateCategoryIds(dto.categoryIds);

    const publicationDate = this.parsePublicationDate(dto.publicationDate);

    const announcement = await this.prisma.announcement.create({
      data: {
        title: dto.title,
        content: dto.content,
        publicationDate,
        categories: {
          create: dto.categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
      include: this.includeCategories,
    });

    return toAnnouncementResponse(announcement);
  }

  /**
   * Update an existing announcement.
   */
  async update(
    id: number,
    dto: UpdateAnnouncementDto,
  ): Promise<AnnouncementResponseDto> {
    await this.findOne(id);

    if (dto.categoryIds !== undefined) {
      await this.validateCategoryIds(dto.categoryIds);
    }

    const data: Prisma.AnnouncementUpdateInput = {};

    if (dto.title !== undefined) {
      data.title = dto.title;
    }

    if (dto.content !== undefined) {
      data.content = dto.content;
    }

    if (dto.publicationDate !== undefined) {
      data.publicationDate = this.parsePublicationDate(dto.publicationDate);
    }

    // If categoryIds provided, replace all categories
    if (dto.categoryIds !== undefined) {
      // Delete existing category associations
      await this.prisma.announcementCategory.deleteMany({
        where: { announcementId: id },
      });

      data.categories = {
        create: dto.categoryIds.map((categoryId) => ({ categoryId })),
      };
    }

    const announcement = await this.prisma.announcement.update({
      where: { id },
      data,
      include: this.includeCategories,
    });

    return toAnnouncementResponse(announcement);
  }

  /**
   * Delete an announcement.
   */
  async remove(id: number): Promise<AnnouncementResponseDto> {
    await this.findOne(id);

    const announcement = await this.prisma.announcement.delete({
      where: { id },
      include: this.includeCategories,
    });

    return toAnnouncementResponse(announcement);
  }
}

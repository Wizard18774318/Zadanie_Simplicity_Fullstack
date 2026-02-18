import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAnnouncementDto } from './dto/create-announcement.dto.js';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto.js';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Parse date string in MM/DD/YYYY HH:mm format to a Date object
   */
  private parsePublicationDate(dateStr: string): Date {
    const [datePart, timePart] = dateStr.split(' ');
    const [month, day, year] = datePart.split('/').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
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
   * List all announcements with optional filtering
   * - search: text search on title and content (case-insensitive)
   * - category: filter by category ID
   * Default sort: updatedAt descending
   */
  async findAll(search?: string, categoryId?: number) {
    const where: any = {};

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

    return this.prisma.announcement.findMany({
      where,
      include: this.includeCategories,
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Get a single announcement by ID
   */
  async findOne(id: number) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: this.includeCategories,
    });

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    return announcement;
  }

  /**
   * Create a new announcement
   */
  async create(dto: CreateAnnouncementDto) {
    const publicationDate = this.parsePublicationDate(dto.publicationDate);

    return this.prisma.announcement.create({
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
  }

  /**
   * Update an existing announcement
   */
  async update(id: number, dto: UpdateAnnouncementDto) {
    // Verify announcement exists
    await this.findOne(id);

    const data: any = {};

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

    return this.prisma.announcement.update({
      where: { id },
      data,
      include: this.includeCategories,
    });
  }

  /**
   * Delete an announcement
   */
  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.announcement.delete({
      where: { id },
      include: this.includeCategories,
    });
  }
}

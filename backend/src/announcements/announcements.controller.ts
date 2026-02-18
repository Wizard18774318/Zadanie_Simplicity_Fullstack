import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AnnouncementsService } from './announcements.service.js';
import { CreateAnnouncementDto } from './dto/create-announcement.dto.js';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto.js';
import { FindAnnouncementsQueryDto } from './dto/find-announcements-query.dto.js';
import { AnnouncementsGateway } from './announcements.gateway.js';

@Controller('announcements')
export class AnnouncementsController {
  constructor(
    private readonly announcementsService: AnnouncementsService,
    private readonly announcementsGateway: AnnouncementsGateway,
  ) {}

  @Get()
  findAll(@Query() query: FindAnnouncementsQueryDto) {
    return this.announcementsService.findAll(query.search, query.category);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.announcementsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateAnnouncementDto) {
    const announcement = await this.announcementsService.create(dto);
    // Emit WebSocket notification
    this.announcementsGateway.notifyNewAnnouncement(announcement);
    return announcement;
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.announcementsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.announcementsService.remove(id);
  }
}

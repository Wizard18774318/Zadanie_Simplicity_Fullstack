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
import { ApiTags, ApiOperation, ApiParam, ApiOkResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service.js';
import { CreateAnnouncementDto } from './dto/create-announcement.dto.js';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto.js';
import { FindAnnouncementsQueryDto } from './dto/find-announcements-query.dto.js';
import { AnnouncementResponseDto } from './dto/announcement-response.dto.js';
import { AnnouncementsGateway } from './announcements.gateway.js';

@ApiTags('Announcements')
@Controller('announcements')
export class AnnouncementsController {
  constructor(
    private readonly announcementsService: AnnouncementsService,
    private readonly announcementsGateway: AnnouncementsGateway,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all announcements', description: 'Returns all announcements, optionally filtered by search term and/or category' })
  @ApiOkResponse({ description: 'List of announcements', type: [AnnouncementResponseDto] })
  findAll(@Query() query: FindAnnouncementsQueryDto) {
    return this.announcementsService.findAll(query.search, query.category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get announcement by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Announcement ID' })
  @ApiOkResponse({ description: 'Announcement found', type: AnnouncementResponseDto })
  @ApiNotFoundResponse({ description: 'Announcement not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.announcementsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new announcement' })
  @ApiCreatedResponse({ description: 'Announcement created', type: AnnouncementResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async create(@Body() dto: CreateAnnouncementDto) {
    const announcement = await this.announcementsService.create(dto);
    // Emit WebSocket notification
    this.announcementsGateway.notifyNewAnnouncement(announcement);
    return announcement;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an announcement' })
  @ApiParam({ name: 'id', type: Number, description: 'Announcement ID' })
  @ApiOkResponse({ description: 'Announcement updated', type: AnnouncementResponseDto })
  @ApiNotFoundResponse({ description: 'Announcement not found' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.announcementsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an announcement' })
  @ApiParam({ name: 'id', type: Number, description: 'Announcement ID' })
  @ApiOkResponse({ description: 'Announcement deleted', type: AnnouncementResponseDto })
  @ApiNotFoundResponse({ description: 'Announcement not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.announcementsService.remove(id);
  }
}

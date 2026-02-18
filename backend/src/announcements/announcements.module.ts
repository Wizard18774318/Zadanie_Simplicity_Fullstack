import { Module } from '@nestjs/common';
import { AnnouncementsController } from './announcements.controller.js';
import { AnnouncementsService } from './announcements.service.js';
import { AnnouncementsGateway } from '../gateway/announcements.gateway.js';

@Module({
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService, AnnouncementsGateway],
})
export class AnnouncementsModule {}

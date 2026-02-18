import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AnnouncementResponseDto } from './dto/announcement-response.dto.js';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AnnouncementsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('WebSocket gateway initialized');
  }

  notifyNewAnnouncement(announcement: AnnouncementResponseDto) {
    this.server.emit('announcement:created', announcement);
  }
}

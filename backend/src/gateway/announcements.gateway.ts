import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

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

  /**
   * Notify all connected clients about a new announcement
   */
  notifyNewAnnouncement(announcement: any) {
    this.server.emit('announcement:created', announcement);
  }
}

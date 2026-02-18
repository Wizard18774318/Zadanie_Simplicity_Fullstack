import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Announcement } from '../types';

const SOCKET_URL = import.meta.env.VITE_API_URL as string;

type AnnouncementCreatedHandler = (announcement: Announcement) => void;

/**
 * Connects to the backend WebSocket and listens for real-time events.
 * Automatically connects on mount and disconnects on unmount.
 */
export function useAnnouncementSocket(
  onCreated: AnnouncementCreatedHandler,
) {
  const handlerRef = useRef(onCreated);
  handlerRef.current = onCreated;

  useEffect(() => {
    const socket: Socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socket.on('announcement:created', (data: Announcement) => {
      handlerRef.current(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
}

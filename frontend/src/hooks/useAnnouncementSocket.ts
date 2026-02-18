import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Announcement } from '../types';

const SOCKET_URL = import.meta.env.VITE_API_URL as string;

type AnnouncementCreatedHandler = (announcement: Announcement) => void;

export function useAnnouncementSocket(
  onCreated: AnnouncementCreatedHandler,
) {
  const handlerRef = useRef<AnnouncementCreatedHandler>(onCreated);

  useEffect(() => {
    handlerRef.current = onCreated;
  });

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

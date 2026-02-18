import type {
  Announcement,
  Category,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL as string;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.message ??
      (Array.isArray(body?.message) ? body.message.join(', ') : res.statusText);
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  return res.json() as Promise<T>;
} 

export function getAnnouncements(params?: {
  search?: string;
  category?: number;
}): Promise<Announcement[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.category) query.set('category', String(params.category));
  const qs = query.toString();
  return request<Announcement[]>(`/announcements${qs ? `?${qs}` : ''}`);
}

export function getAnnouncement(id: number): Promise<Announcement> {
  return request<Announcement>(`/announcements/${id}`);
}

export function createAnnouncement(
  data: CreateAnnouncementPayload,
): Promise<Announcement> {
  return request<Announcement>('/announcements', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateAnnouncement(
  id: number,
  data: UpdateAnnouncementPayload,
): Promise<Announcement> {
  return request<Announcement>(`/announcements/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteAnnouncement(id: number): Promise<Announcement> {
  return request<Announcement>(`/announcements/${id}`, {
    method: 'DELETE',
  });
}

export function getCategories(): Promise<Category[]> {
  return request<Category[]>('/categories');
}

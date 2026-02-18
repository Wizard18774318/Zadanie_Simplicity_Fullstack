/**
 * Shared TypeScript types matching the backend response DTOs.
 */

export interface Category {
  id: number;
  name: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  publicationDate: string;
  createdAt: string;
  updatedAt: string;
  categories: Category[];
}

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  publicationDate: string; // MM/DD/YYYY HH:mm
  categoryIds: number[];
}

export interface UpdateAnnouncementPayload {
  title?: string;
  content?: string;
  publicationDate?: string; // MM/DD/YYYY HH:mm
  categoryIds?: number[];
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAnnouncements,
  getAnnouncement,
  getCategories,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../api/announcements';
import type { CreateAnnouncementPayload, UpdateAnnouncementPayload } from '../types';

export const queryKeys = {
  announcements: (params?: { search?: string; category?: number }) =>
    ['announcements', params ?? {}] as const,
  announcement: (id: number) => ['announcements', id] as const,
  categories: ['categories'] as const,
};

export function useAnnouncements(params?: { search?: string; category?: number }) {
  return useQuery({
    queryKey: queryKeys.announcements(params),
    queryFn: () => getAnnouncements(params),
  });
}

export function useAnnouncement(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.announcement(id!),
    queryFn: () => getAnnouncement(id!),
    enabled: id !== undefined,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
    staleTime: 5 * 60_000, // categories rarely change — cache 5 min
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAnnouncementPayload) => createAnnouncement(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useUpdateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAnnouncementPayload }) =>
      updateAnnouncement(id, data),
    onSuccess: (_result, variables) => {
      qc.invalidateQueries({ queryKey: ['announcements'] });
      qc.invalidateQueries({ queryKey: queryKeys.announcement(variables.id) });
    },
  });
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAnnouncement(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useInvalidateAnnouncements() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['announcements'] });
}

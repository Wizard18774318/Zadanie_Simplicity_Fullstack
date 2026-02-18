import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  useAnnouncements,
  useCategories,
  useDeleteAnnouncement,
  useInvalidateAnnouncements,
} from './useAnnouncementQueries';
import { useAnnouncementSocket } from './useAnnouncementSocket';
import type { Announcement } from '../types';

// ── Formatters ──────────────────────────────────────────────

export function formatPublicationDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }) +
    ' ' +
    d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  );
}

export function formatLastUpdate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

// ── Column definitions ─────────────────────────────────────

const columnHelper = createColumnHelper<Announcement>();

function buildColumns(
  navigate: ReturnType<typeof useNavigate>,
  handleDelete: (id: number, title: string) => void,
) {
  return [
    columnHelper.accessor('title', {
      header: 'Title',
      cell: (info) => (
        <span className="font-medium text-gray-900">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('publicationDate', {
      header: 'Publication date',
      cell: (info) => formatPublicationDate(info.getValue()),
    }),
    columnHelper.accessor('updatedAt', {
      header: 'Last update',
      cell: (info) => formatLastUpdate(info.getValue()),
    }),
    columnHelper.accessor('categories', {
      header: 'Categories',
      cell: (info) =>
        info
          .getValue()
          .map((c) => c.name)
          .join(', '),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/announcements/${row.original.id}`)}
            className="rounded p-1.5 text-amber-700 hover:bg-amber-100 transition-colors"
            aria-label={`Edit ${row.original.title}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(row.original.id, row.original.title)}
            className="rounded p-1.5 text-red-500 hover:bg-red-50 transition-colors"
            aria-label={`Delete ${row.original.title}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      ),
    }),
  ];
}

// ── Hook ────────────────────────────────────────────────────

export function useAnnouncementList() {
  const navigate = useNavigate();

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const hasActiveFilters = Boolean(search || selectedCategory);

  function clearFilters() {
    setSearch('');
    setSelectedCategory(undefined);
  }

  // Data
  const {
    data: announcements = [],
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useAnnouncements({
    search: debouncedSearch || undefined,
    category: selectedCategory,
  });

  const { data: categories = [] } = useCategories();

  const deleteMutation = useDeleteAnnouncement();
  const invalidate = useInvalidateAnnouncements();

  // WebSocket notifications
  const [toast, setToast] = useState<string | null>(null);

  useAnnouncementSocket(
    useCallback(
      (announcement) => {
        setToast(`New announcement: "${announcement.title}"`);
        invalidate();
      },
      [invalidate],
    ),
  );

  // Actions
  const handleDelete = useCallback(
    (id: number, title: string) => {
      if (!window.confirm(`Delete "${title}"?`)) return;
      deleteMutation.mutate(id);
    },
    [deleteMutation],
  );

  // Error messages
  const error =
    queryError instanceof Error
      ? queryError.message
      : queryError
        ? String(queryError)
        : null;

  const deleteError =
    deleteMutation.error instanceof Error
      ? deleteMutation.error.message
      : null;

  // Table
  const columns = useMemo(
    () => buildColumns(navigate, handleDelete),
    [navigate, handleDelete],
  );

  const table = useReactTable({
    data: announcements,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return {
    // Filters
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    hasActiveFilters,
    clearFilters,

    // Data
    announcements,
    categories,
    isLoading,
    isFetching,
    refetch,

    // Errors
    error,
    deleteError,

    // Table
    table,
    columns,

    // Toast
    toast,
    dismissToast: () => setToast(null),

    // Navigation
    navigateToNew: () => navigate('/announcements/new'),
  };
}

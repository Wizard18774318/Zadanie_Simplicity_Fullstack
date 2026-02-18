import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  useAnnouncements,
  useCategories,
  useDeleteAnnouncement,
  useInvalidateAnnouncements,
} from '../hooks/useAnnouncementQueries';
import { useAnnouncementSocket } from '../hooks/useAnnouncementSocket';
import Toast from '../components/Toast';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import type { Announcement } from '../types';

function formatPublicationDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }) + ' ' + d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatLastUpdate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

const columnHelper = createColumnHelper<Announcement>();

export default function AnnouncementsListPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();

  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // React Query 
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

  // WebSocket: real-time notifications 
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

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    deleteMutation.mutate(id);
  };

  const error =
    queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null;
  const deleteError =
    deleteMutation.error instanceof Error ? deleteMutation.error.message : null;

  const columns = useMemo(
    () => [
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
          info.getValue().map((c) => c.name).join(', '),
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
    ],
    [navigate],
  );

  const table = useReactTable({
    data: announcements,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
          {/* Refresh button */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40 transition-colors"
            aria-label="Refresh announcements"
            title="Refresh"
          >
            <svg
              className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M21.015 4.356v4.992" />
            </svg>
          </button>
        </div>
        <button
          onClick={() => navigate('/announcements/new')}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 transition-colors"
        >
          + New Announcement
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex-1 max-w-sm">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search announcements"
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <select
          value={selectedCategory ?? ''}
          onChange={(e) =>
            setSelectedCategory(
              e.target.value ? Number(e.target.value) : undefined,
            )
          }
          aria-label="Filter by category"
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Clear filters */}
        {(search || selectedCategory) && (
          <button
            onClick={() => { setSearch(''); setSelectedCategory(undefined); }}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 transition-colors"
            aria-label="Clear filters"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Errors */}
      {error && <ErrorBanner message={error} onRetry={() => refetch()} />}
      {deleteError && <ErrorBanner message={deleteError} />}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <Spinner />
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4">
                  <EmptyState />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Count */}
      {!isLoading && (
        <p className="text-xs text-gray-400">
          {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Toast notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

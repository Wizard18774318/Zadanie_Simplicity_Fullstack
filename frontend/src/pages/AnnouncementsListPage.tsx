import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  getAnnouncements,
  getCategories,
  deleteAnnouncement,
} from '../api/announcements';
import { useAnnouncementSocket } from '../hooks/useAnnouncementSocket';
import Toast from '../components/Toast';
import type { Announcement, Category } from '../types';

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

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();


  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);


  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAnnouncements({
        search: debouncedSearch || undefined,
        category: selectedCategory,
      });
      setAnnouncements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  // ── WebSocket: real-time notifications ────────────────────

  const [toast, setToast] = useState<string | null>(null);

  useAnnouncementSocket(
    useCallback(
      (announcement) => {
        setToast(`New announcement: "${announcement.title}"`);
        fetchAnnouncements();
      },
      [fetchAnnouncements],
    ),
  );


  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await deleteAnnouncement(id);
      await fetchAnnouncements();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };


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
              title="Edit"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>
            <button
              onClick={() => handleDelete(row.original.id, row.original.title)}
              className="rounded p-1.5 text-red-500 hover:bg-red-50 transition-colors"
              title="Delete"
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
        <button
          onClick={() => navigate('/announcements/new')}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 transition-colors"
        >
          + New Announcement
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
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
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
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
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-gray-500">
                  No announcements found.
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
      {!loading && (
        <p className="text-xs text-gray-400">
          {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Toast notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import {
  getAnnouncement,
  getCategories,
  createAnnouncement,
  updateAnnouncement,
} from '../api/announcements';
import type { Category } from '../types';

interface CategoryOption {
  value: number;
  label: string;
}

/**
 * Convert an ISO date string to MM/DD/YYYY HH:mm for the input field.
 */
function isoToFormDate(iso: string): string {
  const d = new Date(iso);
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  return `${mm}/${dd}/${yyyy} ${hh}:${min}`;
}

const DATE_REGEX = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/;

export default function AnnouncementFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<CategoryOption[]>([]);

  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});


  useEffect(() => {
    getCategories()
      .then((cats: Category[]) =>
        setCategoryOptions(cats.map((c) => ({ value: c.id, label: c.name }))),
      )
      .catch(() => {});
  }, []);


  useEffect(() => {
    if (!id) return;

    setLoading(true);
    getAnnouncement(Number(id))
      .then((a) => {
        setTitle(a.title);
        setContent(a.content);
        setPublicationDate(isoToFormDate(a.publicationDate));
        setSelectedCategories(
          a.categories.map((c) => ({ value: c.id, label: c.name })),
        );
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load announcement'),
      )
      .finally(() => setLoading(false));
  }, [id]);


  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!title.trim()) errors.title = 'Title is required';
    if (!content.trim()) errors.content = 'Content is required';
    if (!publicationDate.trim()) {
      errors.publicationDate = 'Publication date is required';
    } else if (!DATE_REGEX.test(publicationDate)) {
      errors.publicationDate = 'Must be in format MM/DD/YYYY HH:mm';
    }
    if (selectedCategories.length === 0) {
      errors.categories = 'At least one category is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError(null);

    const payload = {
      title: title.trim(),
      content: content.trim(),
      publicationDate,
      categoryIds: selectedCategories.map((c) => c.value),
    };

    try {
      if (isEditing) {
        await updateAnnouncement(Number(id), payload);
      } else {
        await createAnnouncement(payload);
      }
      navigate('/announcements');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save announcement');
    } finally {
      setSubmitting(false);
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate('/announcements')}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors"
          title="Back"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Announcement' : 'New Announcement'}
        </h2>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
              fieldErrors.title
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-amber-500 focus:ring-amber-500'
            }`}
            placeholder="Enter announcement title"
          />
          {fieldErrors.title && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.title}</p>
          )}
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="mb-1 block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            id="content"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
              fieldErrors.content
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-amber-500 focus:ring-amber-500'
            }`}
            placeholder="Enter announcement content"
          />
          {fieldErrors.content && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.content}</p>
          )}
        </div>

        {/* Categories */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Categories
          </label>
          <Select<CategoryOption, true>
            isMulti
            options={categoryOptions}
            value={selectedCategories}
            onChange={(selected) => setSelectedCategories([...selected])}
            placeholder="Select categories..."
            classNamePrefix="react-select"
            styles={{
              control: (base, state) => ({
                ...base,
                borderRadius: '0.5rem',
                borderColor: fieldErrors.categories
                  ? '#f87171'
                  : state.isFocused
                    ? '#f59e0b'
                    : '#d1d5db',
                boxShadow: state.isFocused
                  ? fieldErrors.categories
                    ? '0 0 0 1px #f87171'
                    : '0 0 0 1px #f59e0b'
                  : 'none',
                '&:hover': {
                  borderColor: fieldErrors.categories ? '#f87171' : '#f59e0b',
                },
                fontSize: '0.875rem',
                minHeight: '42px',
              }),
              multiValue: (base) => ({
                ...base,
                backgroundColor: '#fef3c7',
                borderRadius: '0.375rem',
              }),
              multiValueLabel: (base) => ({
                ...base,
                color: '#92400e',
                fontSize: '0.75rem',
                fontWeight: 500,
              }),
              multiValueRemove: (base) => ({
                ...base,
                color: '#b45309',
                '&:hover': {
                  backgroundColor: '#fbbf24',
                  color: '#78350f',
                },
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected
                  ? '#f59e0b'
                  : state.isFocused
                    ? '#fef3c7'
                    : 'white',
                color: state.isSelected ? 'white' : '#1f2937',
                fontSize: '0.875rem',
              }),
            }}
          />
          {fieldErrors.categories && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.categories}</p>
          )}
        </div>

        {/* Publication date */}
        <div>
          <label htmlFor="publicationDate" className="mb-1 block text-sm font-medium text-gray-700">
            Publication date
          </label>
          <input
            id="publicationDate"
            type="text"
            value={publicationDate}
            onChange={(e) => setPublicationDate(e.target.value)}
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
              fieldErrors.publicationDate
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-amber-500 focus:ring-amber-500'
            }`}
            placeholder="MM/DD/YYYY HH:mm"
          />
          {fieldErrors.publicationDate && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.publicationDate}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {submitting
              ? 'Saving...'
              : isEditing
                ? 'Update'
                : 'Publish'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/announcements')}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

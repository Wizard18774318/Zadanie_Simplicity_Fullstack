import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import {
  useAnnouncement,
  useCategories,
  useCreateAnnouncement,
  useUpdateAnnouncement,
} from '../hooks/useAnnouncementQueries';
import Spinner from '../components/Spinner';
import ErrorBanner from '../components/ErrorBanner';

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
  const numericId = id ? Number(id) : undefined;

  const {
    data: existingAnnouncement,
    isLoading,
    error: loadError,
  } = useAnnouncement(numericId);

  const { data: categoriesData = [] } = useCategories();
  const categoryOptions: CategoryOption[] = categoriesData.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<CategoryOption[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [validationAlert, setValidationAlert] = useState<string[]>([]);
  const [formInitialized, setFormInitialized] = useState(false);

  useEffect(() => {
    if (existingAnnouncement && !formInitialized) {
      setTitle(existingAnnouncement.title);
      setContent(existingAnnouncement.content);
      setPublicationDate(isoToFormDate(existingAnnouncement.publicationDate));
      setSelectedCategories(
        existingAnnouncement.categories.map((c) => ({ value: c.id, label: c.name })),
      );
      setFormInitialized(true);
    }
  }, [existingAnnouncement, formInitialized]);

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!title.trim()) errors.title = 'Please enter a title for the announcement.';
    if (!content.trim()) errors.content = 'Please enter the announcement content.';
    if (!publicationDate.trim()) {
      errors.publicationDate = 'Please specify a publication date.';
    } else if (!DATE_REGEX.test(publicationDate)) {
      errors.publicationDate = 'Invalid date format — use MM/DD/YYYY HH:mm (e.g. 01/15/2025 09:30).';
    }
    if (selectedCategories.length === 0) {
      errors.categories = 'Please select at least one category.';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setValidationAlert(Object.values(errors));
      return false;
    }

    setValidationAlert([]);
    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: title.trim(),
      content: content.trim(),
      publicationDate,
      categoryIds: selectedCategories.map((c) => c.value),
    };

    if (isEditing && numericId) {
      updateMutation.mutate(
        { id: numericId, data: payload },
        { onSuccess: () => navigate('/announcements') },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/announcements'),
      });
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;
  const errorMessage = mutationError instanceof Error ? mutationError.message : null;

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner label="Loading announcement…" />
      </div>
    );
  }

  if (isEditing && loadError) {
    const loadErrorMsg =
      loadError instanceof Error ? loadError.message : 'Failed to load announcement';

    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/announcements')}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Back to announcements"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Announcement Not Found</h2>
        </div>

        <ErrorBanner message={loadErrorMsg} />

        <div className="mt-8 text-center">
          <p className="mb-4 text-sm text-gray-500">
            This announcement may have been deleted or the ID is invalid.
          </p>
          <button
            onClick={() => navigate('/announcements')}
            className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 transition-colors"
          >
            Back to Announcements
          </button>
        </div>
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
          aria-label="Back to announcements"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Announcement' : 'New Announcement'}
        </h2>
      </div>

      {/* Mutation error banner */}
      {errorMessage && (
        <div className="mb-6">
          <ErrorBanner message={errorMessage} />
        </div>
      )}

      {/* Validation alert */}
      {validationAlert.length > 0 && (
        <div
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 animate-in fade-in"
          role="alert"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-red-800">Some fields are empty or aren't a valid format:</h3>
                <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
                  {validationAlert.map((msg, i) => (
                    <li key={i} className="text-sm text-red-700">{msg}</li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setValidationAlert([])}
              className="rounded p-1 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
              aria-label="Dismiss"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
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
          <p className="mt-1 text-xs text-gray-400">Formát: MM/DD/YYYY HH:mm (napr. 01/15/2025 09:30)</p>
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

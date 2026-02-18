import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useAnnouncement,
  useCategories,
  useCreateAnnouncement,
  useUpdateAnnouncement,
} from './useAnnouncementQueries';

// ── Types ───────────────────────────────────────────────────

export interface CategoryOption {
  value: number;
  label: string;
}

// ── Helpers ─────────────────────────────────────────────────

const DATE_REGEX = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/;

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

/**
 * Validate that a MM/DD/YYYY HH:mm string represents a real date/time.
 * Returns an error message or null if valid.
 */
function validateDateTime(value: string): string | null {
  if (!DATE_REGEX.test(value)) {
    return 'Invalid date format — use MM/DD/YYYY HH:mm (e.g. 01/15/2025 09:30).';
  }

  const [datePart, timePart] = value.split(' ');
  const [mm, dd, yyyy] = datePart.split('/').map(Number);
  const [hh, min] = timePart.split(':').map(Number);

  if (mm < 1 || mm > 12) return 'Month must be between 01 and 12.';
  if (dd < 1 || dd > 31) return 'Day must be between 01 and 31.';
  if (yyyy < 1900 || yyyy > 2100) return 'Year must be between 1900 and 2100.';
  if (hh < 0 || hh > 23) return 'Hours must be between 00 and 23.';
  if (min < 0 || min > 59) return 'Minutes must be between 00 and 59.';

  const constructed = new Date(Date.UTC(yyyy, mm - 1, dd, hh, min));
  if (
    constructed.getUTCFullYear() !== yyyy ||
    constructed.getUTCMonth() !== mm - 1 ||
    constructed.getUTCDate() !== dd
  ) {
    return 'This date does not exist (e.g. February 30).';
  }

  return null;
}

// ── Hook ────────────────────────────────────────────────────

export function useAnnouncementForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const numericId = id ? Number(id) : undefined;

  // Remote data
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

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<CategoryOption[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [validationAlert, setValidationAlert] = useState<string[]>([]);
  const formInitializedRef = useRef(false);

  // Populate form when editing an existing announcement (one-time)
  if (existingAnnouncement && !formInitializedRef.current) {
    formInitializedRef.current = true;
    setTitle(existingAnnouncement.title);
    setContent(existingAnnouncement.content);
    setPublicationDate(isoToFormDate(existingAnnouncement.publicationDate));
    setSelectedCategories(
      existingAnnouncement.categories.map((c) => ({
        value: c.id,
        label: c.name,
      })),
    );
  }

  // Validation
  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = 'Please enter a title for the announcement.';
    } else if (title.trim().length > 255) {
      errors.title = 'Title must be at most 255 characters.';
    }

    if (!content.trim()) {
      errors.content = 'Please enter the announcement content.';
    }

    if (!publicationDate.trim()) {
      errors.publicationDate = 'Please specify a publication date.';
    } else {
      const dateError = validateDateTime(publicationDate);
      if (dateError) errors.publicationDate = dateError;
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

  // Submit
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

  // Derived state
  const submitting = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;
  const errorMessage =
    mutationError instanceof Error ? mutationError.message : null;
  const loadErrorMessage =
    loadError instanceof Error
      ? loadError.message
      : loadError
        ? 'Failed to load announcement'
        : null;

  return {
    // Mode
    isEditing,
    isLoading,
    loadErrorMessage,

    // Form fields
    title,
    setTitle,
    content,
    setContent,
    publicationDate,
    setPublicationDate,
    selectedCategories,
    setSelectedCategories,

    // Categories
    categoryOptions,

    // Validation
    fieldErrors,
    validationAlert,
    dismissValidationAlert: () => setValidationAlert([]),

    // Submission
    handleSubmit,
    submitting,
    errorMessage,

    // Navigation
    goBack: () => navigate('/announcements'),
  };
}

import { useParams } from 'react-router-dom';

export default function AnnouncementFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">
        {isEditing ? 'Edit Announcement' : 'New Announcement'}
      </h2>
      <p className="mt-2 text-gray-600"></p>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h2 className="text-6xl font-black text-gray-200">404</h2>
      <p className="mt-4 text-lg font-semibold text-gray-700">Page not found</p>
      <p className="mt-1 text-sm text-gray-400">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/announcements')}
        className="mt-8 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 transition-colors"
      >
        Go to Announcements
      </button>
    </div>
  );
}

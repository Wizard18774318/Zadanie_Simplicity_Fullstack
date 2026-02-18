import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-amber-50 border-r border-amber-200">
        {/* Branding */}
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold text-amber-900">Test city</h1>
          <p className="text-sm text-amber-700 mt-1">Announcements portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4">
          <NavLink
            to="/announcements"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-amber-200 text-amber-900'
                  : 'text-amber-800 hover:bg-amber-100'
              }`
            }
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38a1.125 1.125 0 0 1-1.536-.41L7.11 17.78A5.25 5.25 0 0 1 6 14.25V9.75A5.25 5.25 0 0 1 7.11 6.22l1.558-2.63a1.125 1.125 0 0 1 1.536-.41l.657.38c.523.301.71.961.463 1.511A12.66 12.66 0 0 0 10.34 8.16m0 7.68v-7.68m4.16 0a12.56 12.56 0 0 1 0 7.68"
              />
            </svg>
            Announcements
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="border-t border-amber-200 px-6 py-4 text-xs text-amber-600">
          © 2026 Test city
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <Outlet />
      </main>
    </div>
  );
}

import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-amber-50 border-r border-amber-200 transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Branding */}
        <div className="flex items-center justify-between px-6 py-8">
          <div>
            <h1 className="text-2xl font-bold text-amber-900">Test city</h1>
            <p className="text-sm text-amber-700 mt-1">Announcements portal</p>
          </div>
          {/* Close button (mobile) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-amber-700 hover:bg-amber-100 md:hidden"
            aria-label="Close sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4" aria-label="Main navigation">
          <NavLink
            to="/announcements"
            end
            onClick={() => setSidebarOpen(false)}
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
              aria-hidden="true"
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
          © 2025 Test city
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex items-center border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Open sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <span className="ml-3 text-sm font-semibold text-gray-800">Test city</span>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50 p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

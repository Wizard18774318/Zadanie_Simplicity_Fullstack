import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import AnnouncementsListPage from './pages/AnnouncementsListPage';
import AnnouncementFormPage from './pages/AnnouncementFormPage';
import NotFoundPage from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 120_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/announcements" replace />} />
          <Route element={<Layout />}>
            <Route path="/announcements" element={<AnnouncementsListPage />} />
            <Route path="/announcements/new" element={<AnnouncementFormPage />} />
            <Route path="/announcements/:id" element={<AnnouncementFormPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

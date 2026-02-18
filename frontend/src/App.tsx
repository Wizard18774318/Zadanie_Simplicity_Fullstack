import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AnnouncementsListPage from './pages/AnnouncementsListPage';
import AnnouncementFormPage from './pages/AnnouncementFormPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/announcements" replace />} />
        <Route element={<Layout />}>
          <Route path="/announcements" element={<AnnouncementsListPage />} />
          <Route path="/announcements/new" element={<AnnouncementFormPage />} />
          <Route path="/announcements/:id" element={<AnnouncementFormPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

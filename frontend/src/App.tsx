import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/announcements" replace />} />
        <Route path="/announcements" element={<div>Announcements List (TODO)</div>} />
        <Route path="/announcements/new" element={<div>New Announcement (TODO)</div>} />
        <Route path="/announcements/:id" element={<div>Edit Announcement (TODO)</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

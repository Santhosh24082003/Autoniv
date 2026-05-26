import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import CallPage from './pages/CallPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CallPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

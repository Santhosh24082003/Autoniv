import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import CallPage from './pages/CallPage'
import BookingPage from './pages/BookingPage'
import FaqPage from './pages/FaqPage'
import DashboardLayout from './layouts/DashboardLayout'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<CallPage />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="faq" element={<FaqPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

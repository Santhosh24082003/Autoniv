import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import CallPage from './pages/CallPage'
import BookingPage from './pages/BookingPage'
import FaqPage from './pages/FaqPage'
import DashboardLayout from './layouts/DashboardLayout'
import LoginPage from './pages/LoginPage'
import RequireAuth from './components/RequireAuth'
import OverviewPage from './pages/OverviewPage'
import AgentsPage from './pages/AgentsPage'
import CallsPage from './pages/CallsPage'
import LeadsPage from './pages/LeadsPage'
import BillingPage from './pages/BillingPage'
import UsersPage from './pages/UsersPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route path="/app/overview" element={<OverviewPage />} />
          <Route path="/app/agents" element={<AgentsPage />} />
          <Route path="/app/calls" element={<CallsPage />} />
          <Route path="/app/leads" element={<LeadsPage />} />
          <Route path="/app/billing" element={<BillingPage />} />
          <Route path="/app/users" element={<UsersPage />} />
          <Route path="/app/receptionist" element={<CallPage />} />
          <Route path="/app/booking" element={<BookingPage />} />
          <Route path="/app/faq" element={<FaqPage />} />
          <Route path="/app" element={<Navigate to="/app/overview" replace />} />
        </Route>
        <Route path="/" element={<Navigate to="/app/overview" replace />} />
        <Route path="*" element={<Navigate to="/app/overview" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

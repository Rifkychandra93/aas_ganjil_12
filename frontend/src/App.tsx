import { Routes, Route } from 'react-router-dom'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import PembeliLayout from './layouts/PembeliLayout'
import AdminLayout from './layouts/AdminLayout'
import PembeliDashboard from './pages/pembeli/Dashboard'
import TicketDetail from './pages/pembeli/TicketDetail'
import Checkout from './pages/pembeli/Checkout'
import MyTickets from './pages/pembeli/MyTicket'
import AdminDashboard from './pages/admin/Dashboard'
import AdminArtist from './pages/admin/Artist'
import AdminTicket from './pages/admin/Ticket'
import SuperadminDashboard from './pages/superadmin/Dashboard'
import SuperadminArtist from './pages/superadmin/Artist'
import SuperadminTicket from './pages/superadmin/Ticket'
import SuperadminLogs from './pages/superadmin/Logs'
import SuperadminUsers from './pages/superadmin/Users'
import Scanner from './pages/penjaga/Scanner'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={<PembeliLayout />}>
        <Route path="/dashboard" element={<PembeliDashboard />} />
        <Route path="/ticket/:id" element={<TicketDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/my-tickets" element={<MyTickets />} />
      </Route>

      <Route element={<AdminLayout role="ADMIN" />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/artist" element={<AdminArtist />} />
        <Route path="/admin/ticket" element={<AdminTicket />} />
      </Route>

      <Route element={<AdminLayout role="SUPERADMIN" />}>
        <Route path="/superadmin" element={<SuperadminDashboard />} />
        <Route path="/superadmin/artist" element={<SuperadminArtist />} />
        <Route path="/superadmin/ticket" element={<SuperadminTicket />} />
        <Route path="/superadmin/logs" element={<SuperadminLogs />} />
        <Route path="/superadmin/users" element={<SuperadminUsers />} />
      </Route>

      <Route path="/scanner" element={<Scanner />} />
      <Route path="/penjaga" element={<Scanner />} />
      <Route path="/penjaga/scanner" element={<Scanner />} />
    </Routes>
  )
}

export default App
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import NewTrip from './pages/NewTrip'
import MyTrips from './pages/MyTrips'
import TripDetail from './pages/TripDetail'
import Logs from './pages/Logs'
// import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="new-trip" element={<NewTrip />} />
          <Route path="trips" element={<MyTrips />} />
          <Route path="trips/:id" element={<TripDetail />} />
          <Route path="logs" element={<Logs />} />
          {/* <Route path="settings" element={<Settings />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
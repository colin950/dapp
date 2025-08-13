import { Routes, Route } from 'react-router-dom'
import Landing from '@/pages/Landing'
import Dashboard from '@/pages/Dashboard'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute.tsx'
import STO from '@/pages/STO.tsx'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Landing />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="sto"
          element={
            <ProtectedRoute>
              <STO />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}

export default AppRoutes

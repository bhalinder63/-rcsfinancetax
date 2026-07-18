import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Login from './pages/Login.jsx'
import Portal from './pages/Portal.jsx'
import Admin from './pages/Admin.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import RequestDetail from './pages/RequestDetail.jsx'
import AdminClients from './pages/AdminClients.jsx'
import AdminClientFile from './pages/AdminClientFile.jsx'
import AdminEnquiries from './pages/AdminEnquiries.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/portal"
            element={
              <ProtectedRoute role="client">
                <Portal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/enquiries"
            element={
              <ProtectedRoute role="admin">
                <AdminEnquiries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clients"
            element={
              <ProtectedRoute role="admin">
                <AdminClients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clients/:id"
            element={
              <ProtectedRoute role="admin">
                <AdminClientFile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/request/:id"
            element={
              <ProtectedRoute>
                <RequestDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)

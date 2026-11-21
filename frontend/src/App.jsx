import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import JobsPage from './pages/JobsPage'
import JobDetailPage from './pages/JobDetailPage'
import CandidateDashboard from './pages/CandidateDashboard'
import RecruiterDashboard from './pages/RecruiterDashboard'
import PostJobPage from './pages/PostJobPage'
import ApplicationsPage from './pages/ApplicationsPage'
import ResumeUploadPage from './pages/ResumeUploadPage'
import AIFeaturesPage from './pages/AIFeaturesPage'
import ProfilePage from './pages/ProfilePage'
import Navbar from './components/Navbar'

function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" />
  return children
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/dashboard" element={<ProtectedRoute requiredRole="CANDIDATE"><CandidateDashboard /></ProtectedRoute>} />
        <Route path="/recruiter" element={<ProtectedRoute requiredRole="RECRUITER"><RecruiterDashboard /></ProtectedRoute>} />
        <Route path="/post-job" element={<ProtectedRoute requiredRole="RECRUITER"><PostJobPage /></ProtectedRoute>} />
        <Route path="/applications/:jobId" element={<ProtectedRoute requiredRole="RECRUITER"><ApplicationsPage /></ProtectedRoute>} />
        <Route path="/resume" element={<ProtectedRoute requiredRole="CANDIDATE"><ResumeUploadPage /></ProtectedRoute>} />
        <Route path="/ai" element={<ProtectedRoute requiredRole="CANDIDATE"><AIFeaturesPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute requiredRole="CANDIDATE"><ProfilePage /></ProtectedRoute>} />
      </Routes>
    </>
  )
}

export default function App() {
  return <AuthProvider><BrowserRouter><AppRoutes /></BrowserRouter></AuthProvider>
}

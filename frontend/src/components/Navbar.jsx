import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Briefcase, LogOut, User, Brain, FileText, LayoutDashboard, PlusCircle } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <Brain className="w-7 h-7" />
            HireAI
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-6">
            <Link to="/jobs" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">
              <Briefcase className="w-4 h-4" /> Jobs
            </Link>

            {/* Guest links */}
            {!user && (
              <>
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">Login</Link>
                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Register</Link>
              </>
            )}

            {/* Candidate links */}
            {user?.role === 'CANDIDATE' && (
              <>
                <Link to="/dashboard" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link to="/ai" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">
                  <Brain className="w-4 h-4" /> AI Features
                </Link>
                <Link to="/resume" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">
                  <FileText className="w-4 h-4" /> Resume
                </Link>
                <Link to="/profile" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">
                  <User className="w-4 h-4" /> Profile
                </Link>
              </>
            )}

            {/* Recruiter links */}
            {user?.role === 'RECRUITER' && (
              <>
                <Link to="/recruiter" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link to="/post-job" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">
                  <PlusCircle className="w-4 h-4" /> Post Job
                </Link>
              </>
            )}

            {/* Logout */}
            {user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {user.fullName || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

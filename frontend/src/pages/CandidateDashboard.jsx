import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { applicationsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { FileText, Brain, Briefcase, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react'

const STATUS_STYLES = {
  APPLIED:    'bg-blue-100 text-blue-800',
  SCREENING:  'bg-yellow-100 text-yellow-800',
  INTERVIEW:  'bg-purple-100 text-purple-800',
  OFFERED:    'bg-green-100 text-green-800',
  REJECTED:   'bg-red-100 text-red-800',
}

const STATUS_ICONS = {
  APPLIED:    <Briefcase className="w-3 h-3" />,
  SCREENING:  <Clock className="w-3 h-3" />,
  INTERVIEW:  <MessageSquare className="w-3 h-3" />,
  OFFERED:    <CheckCircle className="w-3 h-3" />,
  REJECTED:   <XCircle className="w-3 h-3" />,
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'}`}>
      {STATUS_ICONS[status]} {status}
    </span>
  )
}

export default function CandidateDashboard() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    applicationsAPI.getMy()
      .then(r => setApplications(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const statusCounts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1
    return acc
  }, {})

  const stats = [
    { label: 'Total Applied', value: applications.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Screening', value: statusCounts['SCREENING'] || 0, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Interviews', value: statusCounts['INTERVIEW'] || 0, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Offers', value: statusCounts['OFFERED'] || 0, color: 'text-green-600', bg: 'bg-green-50' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.fullName || user?.email}! 👋</h1>
          <p className="text-gray-500 mt-1">Track your applications and leverage AI tools to land your dream job.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-xl shadow-md p-5 flex flex-col gap-1">
              <div className={`text-3xl font-bold ${color}`}>{value}</div>
              <div className="text-gray-500 text-sm">{label}</div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link to="/resume" className="bg-white rounded-xl shadow-md p-5 flex items-center gap-4 hover:shadow-lg transition-shadow border border-gray-100 group">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
              <FileText className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Upload Resume</h3>
              <p className="text-sm text-gray-500">Upload & analyze your resume with AI</p>
            </div>
          </Link>
          <Link to="/ai" className="bg-white rounded-xl shadow-md p-5 flex items-center gap-4 hover:shadow-lg transition-shadow border border-gray-100 group">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition-colors">
              <Brain className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Features</h3>
              <p className="text-sm text-gray-500">Job matching, interview prep & more</p>
            </div>
          </Link>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">My Applications</h2>
            <Link to="/jobs" className="text-sm text-indigo-600 hover:underline font-medium">Browse more jobs →</Link>
          </div>
          {loading ? (
            <LoadingSpinner text="Loading applications..." />
          ) : applications.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No applications yet</p>
              <p className="text-sm mt-1 mb-4">Start applying to jobs to track them here</p>
              <Link to="/jobs" className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Find Jobs</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {applications.map(app => (
                <div key={app.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{app.jobTitle || app.job?.title || 'Job Position'}</p>
                    <p className="text-sm text-gray-500">{app.companyName || app.job?.recruiterName || ''}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {app.matchScore != null && (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        app.matchScore >= 70 ? 'bg-green-100 text-green-800' :
                        app.matchScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>{app.matchScore}% match</span>
                    )}
                    <StatusBadge status={app.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { jobsAPI, analyticsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { Briefcase, Users, PlusCircle, TrendingUp, Eye } from 'lucide-react'

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      jobsAPI.getMy().then(r => setJobs(r.data || [])),
      analyticsAPI.dashboard().then(r => setAnalytics(r.data)).catch(() => {})
    ]).finally(() => setLoading(false))
  }, [])

  const stats = analytics ? [
    { label: 'Total Jobs', value: analytics.totalJobs ?? jobs.length, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active Jobs', value: analytics.activeJobs ?? jobs.filter(j => j.status === 'ACTIVE').length, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Applications', value: analytics.totalApplications ?? 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Candidates', value: analytics.totalCandidates ?? 0, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
  ] : [
    { label: 'Total Jobs', value: jobs.length, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active Jobs', value: jobs.filter(j => j.status === 'ACTIVE').length, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Applications', value: '—', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Candidates', value: '—', icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome, {user?.fullName || user?.email}! Manage your job listings and candidates.</p>
          </div>
          <Link to="/post-job" className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md">
            <PlusCircle className="w-5 h-5" /> Post New Job
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl shadow-md p-5">
              <div className={`inline-flex p-2.5 rounded-lg ${bg} mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className={`text-3xl font-bold ${color}`}>{value}</div>
              <div className="text-gray-500 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Jobs List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">My Job Listings</h2>
          </div>
          {loading ? (
            <LoadingSpinner text="Loading your jobs..." />
          ) : jobs.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No jobs posted yet</p>
              <p className="text-sm mt-1 mb-4">Create your first job listing to start attracting talent</p>
              <Link to="/post-job" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                <PlusCircle className="w-4 h-4" /> Post a Job
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {jobs.map(job => (
                <div key={job.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{job.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${job.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {job.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{job.location} · {job.jobType?.replace('_', ' ')} · {job.experienceRequired}+ yrs</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {job.applicationCount != null ? `${job.applicationCount} applicant(s)` : ''}
                      {job.createdAt ? ` · Posted ${new Date(job.createdAt).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                  <Link
                    to={`/applications/${job.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors whitespace-nowrap"
                  >
                    <Eye className="w-4 h-4" /> View Applicants
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

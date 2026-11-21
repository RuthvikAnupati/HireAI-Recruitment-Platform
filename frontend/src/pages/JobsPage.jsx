import { useState, useEffect } from 'react'
import { jobsAPI, applicationsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import JobCard from '../components/JobCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { Search, Filter, CheckCircle, AlertCircle } from 'lucide-react'

const JOB_TYPES = ['ALL', 'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE']

export default function JobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [myApplications, setMyApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    jobsAPI.getAll()
      .then(r => setJobs(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
    if (user?.role === 'CANDIDATE') {
      applicationsAPI.getMy()
        .then(r => setMyApplications(r.data || []))
        .catch(() => {})
    }
  }, [user])

  const handleApply = async (jobId) => {
    if (!user) {
      setNotification({ type: 'error', msg: 'Please login to apply.' })
      return
    }
    try {
      await applicationsAPI.apply(jobId)
      setMyApplications(prev => [...prev, { jobId }])
      setNotification({ type: 'success', msg: 'Application submitted successfully!' })
    } catch (err) {
      setNotification({ type: 'error', msg: err.response?.data?.message || 'Failed to apply.' })
    }
    setTimeout(() => setNotification(null), 3000)
  }

  const appliedJobIds = new Set(myApplications.map(a => a.jobId || a.job?.id))

  const filtered = jobs.filter(job => {
    const matchSearch = !search ||
      job.title?.toLowerCase().includes(search.toLowerCase()) ||
      job.location?.toLowerCase().includes(search.toLowerCase()) ||
      job.description?.toLowerCase().includes(search.toLowerCase())
    const matchType = filter === 'ALL' || job.jobType === filter
    return matchSearch && matchType
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Jobs</h1>
          <p className="text-gray-500">Find your perfect role from {jobs.length} listings</p>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 flex items-center gap-2 px-4 py-3 rounded-lg text-sm border ${
            notification.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {notification.msg}
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, location, or keyword..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="pl-9 pr-6 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white appearance-none cursor-pointer"
            >
              {JOB_TYPES.map(t => <option key={t} value={t}>{t === 'ALL' ? 'All Types' : t.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading jobs..." />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No jobs found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onApply={handleApply}
                applied={appliedJobIds.has(job.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

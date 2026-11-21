import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { jobsAPI, applicationsAPI, aiAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import AIResultCard from '../components/AIResultCard'
import { MapPin, Briefcase, Clock, ArrowLeft, CheckCircle, AlertCircle, Brain } from 'lucide-react'

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [notification, setNotification] = useState(null)
  const [matchResult, setMatchResult] = useState(null)
  const [matchLoading, setMatchLoading] = useState(false)

  useEffect(() => {
    jobsAPI.getById(id)
      .then(r => setJob(r.data))
      .catch(() => navigate('/jobs'))
      .finally(() => setLoading(false))
  }, [id])

  const handleApply = async () => {
    if (!user) { navigate('/login'); return }
    setApplying(true)
    try {
      await applicationsAPI.apply(id)
      setApplied(true)
      setNotification({ type: 'success', msg: 'Application submitted! Good luck!' })
    } catch (err) {
      setNotification({ type: 'error', msg: err.response?.data?.message || 'Failed to apply.' })
    } finally {
      setApplying(false)
      setTimeout(() => setNotification(null), 4000)
    }
  }

  const handleMatchScore = async () => {
    setMatchLoading(true)
    try {
      const r = await aiAPI.matchJob(user.id, id)
      setMatchResult(r.data)
    } catch (e) {
      setNotification({ type: 'error', msg: 'Could not fetch AI match score.' })
    } finally {
      setMatchLoading(false)
    }
  }

  if (loading) return <LoadingSpinner text="Loading job details..." />
  if (!job) return null

  const requirements = job.requirements?.split('\n').filter(Boolean) || []
  const skills = job.skillsRequired?.split(',').map(s => s.trim()).filter(Boolean) || []

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/jobs')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </button>

        {notification && (
          <div className={`mb-6 flex items-center gap-2 px-4 py-3 rounded-lg text-sm border ${
            notification.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {notification.msg}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-gray-500 font-medium">{job.recruiterName || 'Company'}</p>
            </div>
            <div className="flex flex-col gap-2">
              {applied ? (
                <button disabled className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-50 text-green-700 font-semibold border border-green-200 cursor-not-allowed">
                  <CheckCircle className="w-5 h-5" /> Applied
                </button>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
                >
                  {applying ? 'Applying...' : 'Apply Now'}
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
            {job.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.location}</span>}
            {job.jobType && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{job.jobType.replace('_', ' ')}</span>}
            {job.experienceRequired != null && <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" />{job.experienceRequired}+ years experience</span>}
          </div>

          <div className="prose max-w-none">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>

          {requirements.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h2>
              <ul className="space-y-2">
                {requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />{req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {skills.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-200">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Match Score */}
        {user?.role === 'CANDIDATE' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" /> AI Match Score
              </h2>
              {!matchResult && (
                <button
                  onClick={handleMatchScore}
                  disabled={matchLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
                >
                  {matchLoading ? 'Analyzing...' : 'Check My Match'}
                </button>
              )}
            </div>
            {matchLoading && <LoadingSpinner size="sm" text="AI is analyzing compatibility..." />}
            {matchResult && (
              <AIResultCard
                title="Job Match Analysis"
                result={matchResult.result || matchResult.reasoning || JSON.stringify(matchResult)}
                score={matchResult.matchScore || matchResult.score}
                icon={Brain}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

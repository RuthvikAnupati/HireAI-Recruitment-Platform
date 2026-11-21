import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { applicationsAPI, aiAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { Users, ChevronDown, FileText, Brain, AlertCircle } from 'lucide-react'

const STATUS_OPTIONS = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFERED', 'REJECTED']

const STATUS_STYLES = {
  APPLIED:   'bg-blue-100 text-blue-800',
  SCREENING: 'bg-yellow-100 text-yellow-800',
  INTERVIEW: 'bg-purple-100 text-purple-800',
  OFFERED:   'bg-green-100 text-green-800',
  REJECTED:  'bg-red-100 text-red-800',
}

function ScoreBadge({ score }) {
  if (score == null) return <span className="text-gray-400 text-xs">N/A</span>
  const color = score >= 70 ? 'text-green-700 bg-green-100' : score >= 50 ? 'text-yellow-700 bg-yellow-100' : 'text-red-700 bg-red-100'
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{score}%</span>
}

export default function ApplicationsPage() {
  const { jobId } = useParams()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const [aiLoading, setAiLoading] = useState({})

  useEffect(() => {
    applicationsAPI.getForJob(jobId)
      .then(r => setApplications(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [jobId])

  const updateStatus = async (appId, status) => {
    try {
      await applicationsAPI.updateStatus(appId, status)
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a))
      setNotification({ type: 'success', msg: `Status updated to ${status}` })
    } catch {
      setNotification({ type: 'error', msg: 'Failed to update status.' })
    }
    setTimeout(() => setNotification(null), 3000)
  }

  const runAIMatch = async (app) => {
    setAiLoading(l => ({ ...l, [app.id]: true }))
    try {
      const r = await aiAPI.matchJob(app.candidateId, jobId)
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, matchScore: r.data.matchScore || r.data.score, aiResult: r.data } : a))
    } catch {
      setNotification({ type: 'error', msg: 'AI analysis failed.' })
    } finally {
      setAiLoading(l => ({ ...l, [app.id]: false }))
      setTimeout(() => setNotification(null), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Applicants</h1>
            <p className="text-gray-500 text-sm">{applications.length} candidate(s) applied</p>
          </div>
        </div>

        {notification && (
          <div className={`mb-6 flex items-center gap-2 px-4 py-3 rounded-lg text-sm border ${
            notification.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            <AlertCircle className="w-4 h-4" /> {notification.msg}
          </div>
        )}

        {loading ? (
          <LoadingSpinner text="Loading applicants..." />
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-16 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No applicants yet</p>
            <p className="text-sm mt-1">Share this job listing to attract candidates</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Candidate</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Skills</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Match Score</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {applications.map(app => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{app.candidateName || app.candidate?.fullName || 'Candidate'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{app.candidateEmail || app.candidate?.email || ''}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(app.candidateSkills || app.candidate?.skills || '').split(',').filter(Boolean).slice(0, 4).map((s, i) => (
                            <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">{s.trim()}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ScoreBadge score={app.matchScore} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select
                          value={app.status}
                          onChange={e => updateStatus(app.id, e.target.value)}
                          className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${STATUS_STYLES[app.status] || 'bg-gray-100 text-gray-700'}`}
                        >
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {app.resumePath && (
                            <a href={`/api/candidates/resume/${app.candidateId}`} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                              <FileText className="w-3.5 h-3.5" /> Resume
                            </a>
                          )}
                          <button
                            onClick={() => runAIMatch(app)}
                            disabled={aiLoading[app.id]}
                            className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium disabled:opacity-50"
                          >
                            <Brain className="w-3.5 h-3.5" /> {aiLoading[app.id] ? '...' : 'AI Match'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

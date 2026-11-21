import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobsAPI } from '../services/api'
import { CheckCircle, AlertCircle, Briefcase } from 'lucide-react'

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE']
const STATUSES = ['ACTIVE', 'CLOSED', 'DRAFT']

export default function PostJobPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', requirements: '', skillsRequired: '',
    experienceRequired: 0, location: '', jobType: 'FULL_TIME', status: 'ACTIVE'
  })
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await jobsAPI.create({ ...form, experienceRequired: parseInt(form.experienceRequired) })
      setNotification({ type: 'success', msg: 'Job posted successfully!' })
      setTimeout(() => navigate('/recruiter'), 2000)
    } catch (err) {
      setNotification({ type: 'error', msg: err.response?.data?.message || 'Failed to post job.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
          </div>
          <p className="text-gray-500 text-sm">Fill in the details to attract the right candidates</p>
        </div>

        {notification && (
          <div className={`mb-6 flex items-center gap-2 px-4 py-3 rounded-lg text-sm border ${
            notification.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {notification.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title *</label>
            <input type="text" required value={form.title} onChange={set('title')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Senior React Developer" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea required value={form.description} onChange={set('description')} rows={5}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Describe the role, responsibilities, company culture..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Requirements (one per line)</label>
            <textarea value={form.requirements} onChange={set('requirements')} rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Bachelor's degree in Computer Science&#10;5+ years React experience&#10;Strong communication skills" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Skills Required (comma-separated)</label>
            <input type="text" value={form.skillsRequired} onChange={set('skillsRequired')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="React, TypeScript, Node.js, AWS" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience Required (years)</label>
              <input type="number" min="0" value={form.experienceRequired} onChange={set('experienceRequired')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
              <input type="text" value={form.location} onChange={set('location')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. New York, Remote" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Type</label>
              <select value={form.jobType} onChange={set('jobType')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                {JOB_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select value={form.status} onChange={set('status')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/recruiter')}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60">
              {loading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

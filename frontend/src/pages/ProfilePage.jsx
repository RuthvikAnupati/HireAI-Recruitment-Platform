import { useState, useEffect } from 'react'
import { candidateAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { User, Phone, GraduationCap, Briefcase, Globe, Save, CheckCircle } from 'lucide-react'

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    education: '',
    experienceYears: 0,
    skills: '',
    linkedinUrl: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    candidateAPI.getProfile()
      .then(res => {
        if (res.data) {
          setProfile({
            fullName: res.data.fullName || '',
            email: res.data.email || '',
            phone: res.data.phone || '',
            education: res.data.education || '',
            experienceYears: res.data.experienceYears || 0,
            skills: res.data.skills || '',
            linkedinUrl: res.data.linkedinUrl || ''
          })
        }
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await candidateAPI.updateProfile(profile)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner message="Loading candidate profile..." />

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6" /> Candidate Profile
            </h1>
            <p className="text-indigo-100 text-sm mt-1">
              Keep your profile and skills updated to improve AI job matching accuracy.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> {success}
              </div>
            )}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    name="experienceYears"
                    min="0"
                    max="50"
                    value={profile.experienceYears}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Education Background</label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="education"
                  value={profile.education}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. B.Tech Computer Science, IIT Bombay (2023)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technical Skills (Comma Separated)
              </label>
              <textarea
                name="skills"
                rows="3"
                value={profile.skills}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Java, Spring Boot, React.js, MySQL, REST APIs, Docker, Python"
              />
              <p className="text-xs text-gray-400 mt-1">
                Skills entered here are matched against job requirements by the AI matching engine.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn / Portfolio URL</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="url"
                  name="linkedinUrl"
                  value={profile.linkedinUrl}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-all shadow hover:shadow-indigo-200 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

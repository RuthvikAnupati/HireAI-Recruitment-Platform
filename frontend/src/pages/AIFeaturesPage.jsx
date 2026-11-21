import { useState, useEffect } from 'react'
import { aiAPI, jobsAPI, candidateAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import AIResultCard from '../components/AIResultCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { Brain, Sparkles, Target, MessageSquare, FileEdit, Award, UserCheck } from 'lucide-react'

export default function AIFeaturesPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('resume')
  const [jobs, setJobs] = useState([])
  const [candidate, setCandidate] = useState(null)
  const [candidatesList, setCandidatesList] = useState([])
  const [selectedCandidateId, setSelectedCandidateId] = useState('')

  // States for each feature
  const [selectedJobId, setSelectedJobId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [resumeResult, setResumeResult] = useState(null)
  const [matchResult, setMatchResult] = useState(null)
  const [interviewResult, setInterviewResult] = useState(null)
  const [improveResult, setImproveResult] = useState(null)

  const isRecruiter = user?.role === 'RECRUITER'

  useEffect(() => {
    // Fetch jobs for dropdowns
    jobsAPI.getAll().then(res => setJobs(res.data || [])).catch(console.error)

    if (isRecruiter) {
      candidateAPI.getAll().then(res => {
        const list = res.data || []
        setCandidatesList(list)
        if (list.length > 0) {
          setSelectedCandidateId(list[0].id)
          setCandidate(list[0])
        }
      }).catch(console.error)
    } else {
      // Fetch profile to get candidateId if candidate
      candidateAPI.getProfile().then(res => {
        setCandidate(res.data)
        if (res.data?.id) {
          setSelectedCandidateId(res.data.id)
          aiAPI.getAnalysis(res.data.id).then(aRes => {
            if (aRes.data && aRes.data.analysisText) {
              setResumeResult({
                result: aRes.data.analysisText,
                score: aRes.data.overallScore
              })
            }
          }).catch(() => {})
        }
      }).catch(console.error)
    }
  }, [isRecruiter])

  const handleCandidateChange = (id) => {
    setSelectedCandidateId(id)
    const found = candidatesList.find(c => String(c.id) === String(id))
    if (found) {
      setCandidate(found)
      setMatchResult(null)
      setResumeResult(null)
    }
  }

  const effectiveCandidateId = selectedCandidateId || candidate?.id

  const handleAnalyzeResume = async () => {
    if (!effectiveCandidateId) {
      setError('Please select or create a candidate profile to analyze.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await aiAPI.analyzeResume(effectiveCandidateId)
      setResumeResult(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze resume. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMatchJob = async () => {
    if (!selectedJobId) {
      setError('Please select a job to compare against.')
      return
    }
    if (!effectiveCandidateId) {
      setError('Please select a candidate to evaluate.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await aiAPI.matchJob(effectiveCandidateId, selectedJobId)
      setMatchResult(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Job matching failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleInterviewQuestions = async () => {
    if (!selectedJobId) {
      setError('Please select a job to generate tailored questions.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await aiAPI.interviewQuestions(selectedJobId, effectiveCandidateId)
      setInterviewResult(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate questions.')
    } finally {
      setLoading(false)
    }
  }

  const handleImproveResume = async () => {
    if (!effectiveCandidateId) {
      setError('Please select or create a candidate profile.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await aiAPI.improveResume(effectiveCandidateId, selectedJobId || null)
      setImproveResult(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate resume improvements.')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'resume', label: 'Resume Analyzer', icon: Brain },
    { id: 'match', label: 'Job Matching AI', icon: Target },
    { id: 'interview', label: 'Interview Prep', icon: MessageSquare },
    { id: 'improve', label: 'Resume Improver', icon: FileEdit },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Dynamic Semantic Matching & AI Engine
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AI Career & Talent Intelligence</h1>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto text-sm">
            Evaluate candidate profiles, compute skill overlap and match percentages, simulate role-specific interview questions, and polish resumes.
          </p>
        </div>

        {/* Recruiter Candidate Selector Bar */}
        {isRecruiter && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              <div>
                <span className="text-sm font-semibold text-indigo-900">Evaluating Candidate:</span>
                <p className="text-xs text-indigo-700">Choose which candidate profile to run AI models on</p>
              </div>
            </div>
            <select
              value={selectedCandidateId}
              onChange={(e) => handleCandidateChange(e.target.value)}
              className="w-full sm:w-72 p-2 bg-white border border-indigo-300 rounded-lg text-sm text-gray-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {candidatesList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.fullName || c.email} ({c.experienceYears || 0}y exp - {c.skills ? c.skills.slice(0, 30) : 'No skills listed'}...)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-4 pt-2 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setError('') }}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all ${
                  active
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content Box */}
        <div className="bg-white rounded-b-xl shadow-md p-6 border-t-0 border border-gray-100 mb-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* TAB 1: RESUME ANALYZER */}
          {activeTab === 'resume' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {candidate?.fullName ? `Resume Diagnostics for ${candidate.fullName}` : 'AI Deep Resume Diagnostics'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Extracts core technical competencies, benchmarks ATS compatibility, and highlights profile gaps.
                  </p>
                </div>
                <button
                  onClick={handleAnalyzeResume}
                  disabled={loading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-all shadow hover:shadow-indigo-200 disabled:opacity-50 flex items-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  {loading ? 'Analyzing...' : 'Run Full Resume Analysis'}
                </button>
              </div>

              {resumeResult && (
                <AIResultCard
                  title="Comprehensive Resume Assessment"
                  result={resumeResult.result}
                  score={resumeResult.score}
                  icon={Award}
                />
              )}
            </div>
          )}

          {/* TAB 2: JOB MATCHING */}
          {activeTab === 'match' && (
            <div>
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Semantic Job Matching</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Select a live job posting to calculate match percentage, missing skills, and hireability.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">-- Choose a Target Job --</option>
                    {jobs.map(j => (
                      <option key={j.id} value={j.id}>
                        {j.title} ({j.location || 'Remote'}) - {j.skillsRequired ? j.skillsRequired.slice(0, 40) : ''}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleMatchJob}
                    disabled={loading || !selectedJobId}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-all shadow disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Target className="w-4 h-4" />
                    {loading ? 'Evaluating...' : 'Compute AI Match'}
                  </button>
                </div>
              </div>

              {matchResult && (
                <AIResultCard
                  title="Job Compatibility Breakdown"
                  result={matchResult.result}
                  score={matchResult.score}
                  icon={Target}
                />
              )}
            </div>
          )}

          {/* TAB 3: INTERVIEW PREP */}
          {activeTab === 'interview' && (
            <div>
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Tailored Interview Question Simulator</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Generates 10 architectural, problem-solving, and behavioral interview questions mapped directly to the job.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">-- Choose Job Role --</option>
                    {jobs.map(j => (
                      <option key={j.id} value={j.id}>
                        {j.title} - {j.location || 'Remote'}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleInterviewQuestions}
                    disabled={loading || !selectedJobId}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-all shadow disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {loading ? 'Synthesizing...' : 'Generate 10 Questions'}
                  </button>
                </div>
              </div>

              {interviewResult && (
                <AIResultCard
                  title="Curated Technical & Behavioral Interview Questions"
                  result={interviewResult.result}
                  icon={MessageSquare}
                />
              )}
            </div>
          )}

          {/* TAB 4: RESUME IMPROVER */}
          {activeTab === 'improve' && (
            <div>
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Resume Polish & ATS Keyword Optimizer</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Get concrete bullet point rewrites, active verbs, and key industry buzzwords for any target role.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Target Role (Optional - or general review)</option>
                    {jobs.map(j => (
                      <option key={j.id} value={j.id}>
                        {j.title}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleImproveResume}
                    disabled={loading}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-all shadow disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FileEdit className="w-4 h-4" />
                    {loading ? 'Generating Tips...' : 'Get Resume Improvement Tips'}
                  </button>
                </div>
              </div>

              {improveResult && (
                <AIResultCard
                  title="Actionable Resume Enhancements"
                  result={improveResult.result}
                  icon={FileEdit}
                />
              )}
            </div>
          )}

          {loading && <LoadingSpinner message="Consulting AI Talent Engine..." />}
        </div>
      </div>
    </div>
  )
}

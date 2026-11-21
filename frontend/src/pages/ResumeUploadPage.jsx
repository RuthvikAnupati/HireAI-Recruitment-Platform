import { useState, useEffect, useCallback } from 'react'
import { candidateAPI, aiAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import AIResultCard from '../components/AIResultCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { Upload, FileText, Brain, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

export default function ResumeUploadPage() {
  const { user } = useAuth()
  const [candidate, setCandidate] = useState(null)
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [notification, setNotification] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    candidateAPI.getProfile()
      .then(res => {
        if (res.data) {
          setCandidate(res.data)
          if (res.data.resumePath || res.data.resumeText) {
            setUploaded(true)
          }
          if (res.data.id) {
            aiAPI.getAnalysis(res.data.id)
              .then(aRes => {
                if (aRes.data && aRes.data.analysisText) {
                  setAnalysis({
                    result: aRes.data.analysisText,
                    score: aRes.data.overallScore,
                    overallScore: aRes.data.overallScore
                  })
                }
              })
              .catch(() => {})
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoadingProfile(false))
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && (dropped.type === 'application/pdf' || dropped.name.endsWith('.txt') || dropped.name.endsWith('.pdf'))) {
      setFile(dropped)
      setUploaded(false)
    } else {
      setNotification({ type: 'error', msg: 'Please upload a PDF or TXT file.' })
    }
  }, [])

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const res = await candidateAPI.uploadResume(file)
      setUploaded(true)
      if (res.data) {
        setCandidate(res.data)
      }
      setNotification({ type: 'success', msg: 'Resume uploaded successfully!' })
    } catch (err) {
      setNotification({ type: 'error', msg: err.response?.data?.message || 'Upload failed.' })
    } finally {
      setUploading(false)
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      const targetId = candidate?.id || user?.id
      const r = await aiAPI.analyzeResume(targetId)
      setAnalysis(r.data)
      setNotification({ type: 'success', msg: 'AI analysis generated!' })
    } catch (err) {
      setNotification({ type: 'error', msg: err.response?.data?.message || 'Analysis failed. Make sure your resume is uploaded.' })
    } finally {
      setAnalyzing(false)
      setTimeout(() => setNotification(null), 4000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Upload & AI Analyzer</h1>
          <p className="text-gray-500">Upload your resume to extract skills, calculate your profile score, and get AI recommendations.</p>
        </div>

        {notification && (
          <div className={`mb-6 flex items-center gap-2 px-4 py-3 rounded-lg text-sm border ${
            notification.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {notification.msg}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          {/* Previously Uploaded Banner */}
          {uploaded && !file && candidate?.resumePath && (
            <div className="mb-4 flex items-center justify-between p-3.5 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-900">Resume on file</p>
                  <p className="text-xs text-green-700 truncate max-w-sm">{candidate.resumePath}</p>
                </div>
              </div>
              <button
                onClick={() => document.getElementById('file-input').click()}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1.5 rounded border border-indigo-200 shadow-sm"
              >
                Replace
              </button>
            </div>
          )}

          {/* Drag & Drop Zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
              dragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
            }`}
            onClick={() => document.getElementById('file-input').click()}
          >
            <Upload className={`w-12 h-12 mx-auto mb-3 ${dragging ? 'text-indigo-500' : 'text-gray-400'}`} />
            <p className="font-medium text-gray-700 mb-1">Drag & drop your resume here</p>
            <p className="text-sm text-gray-400 mb-4">or click to browse files</p>
            <p className="text-xs text-gray-400">Supported formats: PDF, TXT</p>
            <input
              id="file-input" type="file" accept=".pdf,.txt" className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0])
                  setUploaded(false)
                }
              }}
            />
          </div>

          {/* Selected File Info */}
          {file && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-indigo-900 truncate">{file.name}</p>
                <p className="text-xs text-indigo-600">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              {uploaded && <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleUpload}
              disabled={!file || uploading || uploaded}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : uploaded ? 'Uploaded ✓' : 'Upload Resume'}
            </button>
            <button
              onClick={handleAnalyze}
              disabled={analyzing || (!uploaded && !file && !candidate?.resumeText)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow"
            >
              <Brain className="w-4 h-4" />
              {analyzing ? 'Analyzing...' : 'Analyze with AI'}
            </button>
          </div>
        </div>

        {analyzing && <LoadingSpinner text="AI is evaluating your resume and extracting skills..." />}

        {analysis && !analyzing && (
          <AIResultCard
            title="Resume Analysis Results"
            result={analysis.result || analysis.analysisText}
            score={analysis.score || analysis.overallScore}
            icon={Brain}
          />
        )}
      </div>
    </div>
  )
}

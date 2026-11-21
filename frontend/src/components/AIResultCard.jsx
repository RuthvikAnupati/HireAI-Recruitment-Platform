import { Brain, TrendingUp, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react'

function CircleScore({ score }) {
  const color = score >= 70 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'
  const bg = score >= 70 ? '#dcfce7' : score >= 50 ? '#fef3c7' : '#fee2e2'
  return (
    <div className="flex items-center justify-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl border-4"
        style={{ borderColor: color, background: bg, color: color }}
      >
        {Math.round(score)}
      </div>
    </div>
  )
}

function formatText(text) {
  if (!text) return null
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim()
    if (!trimmed) return null
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      return <h4 key={i} className="font-semibold text-gray-800 mt-3 mb-1">{trimmed.replace(/\*\*/g, '')}</h4>
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      return (
        <li key={i} className="ml-4 text-gray-700 text-sm list-disc">
          {trimmed.replace(/^[-•]\s/, '')}
        </li>
      )
    }
    if (trimmed.match(/^\d+\./)) {
      return <li key={i} className="ml-4 text-gray-700 text-sm list-decimal">{trimmed.replace(/^\d+\.\s/, '')}</li>
    }
    return <p key={i} className="text-gray-700 text-sm mt-1">{trimmed}</p>
  })
}

export default function AIResultCard({ title, result, score, icon: Icon = Brain, loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-indigo-100 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded w-full"></div>
          <div className="h-3 bg-gray-100 rounded w-5/6"></div>
          <div className="h-3 bg-gray-100 rounded w-4/6"></div>
        </div>
      </div>
    )
  }

  if (!result) return null

  return (
    <div className="bg-white rounded-xl shadow-md border border-indigo-100 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Icon className="w-5 h-5" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        {score != null && <CircleScore score={score} />}
      </div>
      <div className="p-5">
        {typeof result === 'string' ? (
          <div className="space-y-1">{formatText(result)}</div>
        ) : (
          <div className="space-y-3">
            {result.overallScore != null && <CircleScore score={result.overallScore} />}
            {result.skillsExtracted && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-1 text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Skills Detected</h4>
                <div className="flex flex-wrap gap-1">
                  {result.skillsExtracted.split(',').map((s, i) => (
                    <span key={i} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full border border-indigo-200">{s.trim()}</span>
                  ))}
                </div>
              </div>
            )}
            {result.analysisText && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-1 text-sm flex items-center gap-1"><Brain className="w-4 h-4 text-indigo-500" /> Analysis</h4>
                <div className="space-y-1">{formatText(result.analysisText)}</div>
              </div>
            )}
            {result.improvementSuggestions && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-1 text-sm flex items-center gap-1"><Lightbulb className="w-4 h-4 text-yellow-500" /> Improvement Suggestions</h4>
                <div className="space-y-1">{formatText(result.improvementSuggestions)}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

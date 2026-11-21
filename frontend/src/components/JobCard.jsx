import { MapPin, Clock, Briefcase, CheckCircle } from 'lucide-react'

function ScoreBadge({ score }) {
  if (score == null) return null
  const color = score >= 70 ? 'bg-green-100 text-green-800' : score >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${color}`}>
      {score}% match
    </span>
  )
}

export default function JobCard({ job, onApply, applied, matchScore }) {
  const jobTypeColors = {
    FULL_TIME: 'bg-indigo-100 text-indigo-800',
    PART_TIME: 'bg-orange-100 text-orange-800',
    CONTRACT: 'bg-teal-100 text-teal-800',
    INTERNSHIP: 'bg-pink-100 text-pink-800',
    REMOTE: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{job.recruiterName || 'Company'}</p>
        </div>
        <ScoreBadge score={matchScore} />
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        {job.location && (
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
        )}
        {job.experienceRequired != null && (
          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.experienceRequired}+ yrs</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${jobTypeColors[job.jobType] || 'bg-gray-100 text-gray-700'}`}>
          {job.jobType?.replace('_', ' ')}
        </span>
        {job.status === 'ACTIVE' && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">Active</span>
        )}
      </div>

      {job.description && (
        <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
      )}

      <div className="mt-auto pt-2">
        {applied ? (
          <button disabled className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-green-50 text-green-700 font-medium text-sm border border-green-200 cursor-not-allowed">
            <CheckCircle className="w-4 h-4" /> Applied
          </button>
        ) : (
          <button
            onClick={() => onApply && onApply(job.id)}
            className="w-full py-2 px-4 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors"
          >
            Apply Now
          </button>
        )}
      </div>
    </div>
  )
}

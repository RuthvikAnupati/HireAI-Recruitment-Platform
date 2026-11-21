import { Link } from 'react-router-dom'
import { Brain, Target, MessageSquare, BarChart3, ArrowRight, Zap } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'Resume AI Analyzer',
    desc: 'Instantly parse and score resumes with Gemini AI. Get detailed skill extraction, strength analysis, and improvement recommendations.',
    color: 'bg-indigo-50 text-indigo-600'
  },
  {
    icon: Target,
    title: 'Smart Job Matching',
    desc: 'AI-powered matching engine that scores candidate-job compatibility on a 0-100 scale with detailed reasoning.',
    color: 'bg-purple-50 text-purple-600'
  },
  {
    icon: MessageSquare,
    title: 'Interview Prep',
    desc: 'Generate tailored interview questions based on job requirements and candidate profile. Walk in prepared.',
    color: 'bg-pink-50 text-pink-600'
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    desc: 'Real-time hiring metrics, pipeline tracking, and recruiter performance analytics all in one place.',
    color: 'bg-teal-50 text-teal-600'
  }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="gradient-bg py-24 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 text-sm font-medium">
            <Zap className="w-4 h-4" /> Powered by Google Gemini AI
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            AI-Powered Recruitment Platform
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
            Hire smarter, faster, and fairer. Our AI analyzes resumes, matches candidates, and streamlines every step of your recruitment pipeline.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
            >
              Find Jobs <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/40 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/30 transition-colors"
            >
              Post a Job <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[['10K+', 'Job Listings'], ['50K+', 'Candidates'], ['95%', 'Match Accuracy'], ['3x', 'Faster Hiring']].map(([val, label]) => (
            <div key={label}>
              <div className="text-3xl font-extrabold text-indigo-600">{val}</div>
              <div className="text-gray-500 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need to hire smarter</h2>
            <p className="text-gray-500 max-w-xl mx-auto">From AI resume screening to intelligent job matching, our platform handles the heavy lifting so you can focus on what matters.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
                <div className={`inline-flex p-3 rounded-xl ${color} mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-16 px-4 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to transform your hiring?</h2>
        <p className="text-indigo-200 mb-8 max-w-lg mx-auto">Join thousands of companies and candidates already using HireAI to find their perfect match.</p>
        <Link to="/register" className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
          Get Started Free <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>© 2024 HireAI — AI-Powered Smart Recruitment & Talent Management System</p>
      </footer>
    </div>
  )
}

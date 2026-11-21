import axios from 'axios'

export const authAPI = {
  login: (data) => axios.post('/api/auth/login', data),
  register: (data) => axios.post('/api/auth/register', data),
  me: () => axios.get('/api/auth/me')
}

export const jobsAPI = {
  getAll: () => axios.get('/api/jobs'),
  getById: (id) => axios.get(`/api/jobs/${id}`),
  create: (data) => axios.post('/api/jobs', data),
  update: (id, data) => axios.put(`/api/jobs/${id}`, data),
  delete: (id) => axios.delete(`/api/jobs/${id}`),
  getMy: () => axios.get('/api/jobs/my')
}

export const applicationsAPI = {
  apply: (jobId) => axios.post('/api/applications', { jobId }),
  getMy: () => axios.get('/api/applications/my'),
  getForJob: (jobId) => axios.get(`/api/applications/job/${jobId}`),
  updateStatus: (id, status) => axios.put(`/api/applications/${id}/status`, { status })
}

export const candidateAPI = {
  getAll: () => axios.get('/api/candidates'),
  getProfile: () => axios.get('/api/candidates/profile'),
  updateProfile: (data) => axios.put('/api/candidates/profile', data),
  uploadResume: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return axios.post('/api/candidates/upload-resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  }
}

export const aiAPI = {
  analyzeResume: (candidateId) => axios.post('/api/ai/analyze-resume', { candidateId }),
  matchJob: (candidateId, jobId) => axios.post('/api/ai/match-job', { candidateId, jobId }),
  interviewQuestions: (jobId, candidateId) => axios.post('/api/ai/interview-questions', { jobId, candidateId }),
  improveResume: (candidateId, jobId) => axios.post('/api/ai/improve-resume', { candidateId, jobId }),
  getAnalysis: (candidateId) => axios.get(`/api/ai/analysis/${candidateId}`)
}

export const analyticsAPI = {
  dashboard: () => axios.get('/api/analytics/dashboard')
}

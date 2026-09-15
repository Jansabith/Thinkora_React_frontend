import { apiRequest, buildQuery } from './api'

// Questions of every course, 20 per page: filters { course, topic, difficulty, search, page }
export function getAllQuestions(filters = {}) {
  return apiRequest(`/questions/${buildQuery(filters)}`)
}

// difficulty: '' for all questions, or 'easy', 'medium', 'hard'
export function getQuestions(topicId, difficulty = '') {
  const query = difficulty ? `?difficulty=${difficulty}` : ''
  return apiRequest(`/topics/${topicId}/questions/${query}`)
}

export function createQuestion(topicId, data) {
  return apiRequest(`/topics/${topicId}/questions/`, { method: 'POST', body: data })
}

export function updateQuestion(questionId, data) {
  return apiRequest(`/questions/${questionId}/`, { method: 'PATCH', body: data })
}

export function deleteQuestion(questionId) {
  return apiRequest(`/questions/${questionId}/`, { method: 'DELETE' })
}

export function extractQuestionsFromPdf(topicId, difficulty, file) {
  const formData = new FormData()
  formData.append('topic', topicId)
  formData.append('difficulty', difficulty)
  formData.append('file', file)
  return apiRequest('/questions/extract-pdf/', { method: 'POST', body: formData })
}

export function bulkCreateQuestions(topicId, questions) {
  return apiRequest('/questions/bulk/', { 
    method: 'POST', 
    body: { topic: topicId, questions } 
  })
}

export function getAssignedQuestions() {
  return apiRequest('/assigned-questions/')
}

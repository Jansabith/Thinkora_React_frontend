import { apiRequest, buildQuery } from './api'

// ---------- Students: my own progress ----------

export function getMyOverview() {
  return apiRequest('/progress/overview/')
}

// filters: { course, topic, difficulty, search, status: 'todo' | 'done' | 'doubt' | 'bookmarked', page }
export function getPracticeQuestions(filters = {}) {
  return apiRequest(`/progress/practice/${buildQuery(filters)}`)
}

export function getMyMessages() {
  return apiRequest('/progress/messages/')
}

export function markMessagesSeen() {
  return apiRequest('/progress/messages/mark-seen/', { method: 'POST' })
}

export function getMyCertificates() {
  return apiRequest('/progress/certificates/')
}

export function getMyCalendar(year, month) {
  return apiRequest(`/progress/calendar/${buildQuery({ year, month })}`)
}

export function getMyTopicProgress(topicId) {
  return apiRequest(`/progress/topics/${topicId}/`)
}

export function getMyCourseProgress(courseId) {
  return apiRequest(`/progress/courses/${courseId}/`)
}

// changes: { is_done: true }  or  { doubt_status: 'open', doubt_message: '...' }  or  { doubt_status: 'none' }
export function updateMyProgress(questionId, changes) {
  return apiRequest(`/progress/questions/${questionId}/`, { method: 'PATCH', body: changes })
}

// ---------- Admins: every student's progress ----------

// filters: { student, course, topic, question, status: 'done' | 'open' | 'resolved' | 'doubts' }
export function getProgressRecords(filters = {}) {
  const params = new URLSearchParams()
  for (const [name, value] of Object.entries(filters)) {
    if (value) {
      params.set(name, value)
    }
  }
  const query = params.toString()
  return apiRequest(`/admin/progress/${query ? `?${query}` : ''}`)
}

// shareAnswer (optional): true = also show the answer to the student, false = hide it
export function resolveDoubt(recordId, reply, shareAnswer) {
  const body = shareAnswer === undefined ? { reply } : { reply, share_answer: shareAnswer }
  return apiRequest(`/admin/progress/${recordId}/resolve/`, { method: 'POST', body })
}

// Show (true) or hide (false) the question's answer for this one student.
export function shareAnswer(recordId, shared) {
  return apiRequest(`/admin/progress/${recordId}/share-answer/`, { method: 'POST', body: { shared } })
}

export function getStudentProgress(studentId) {
  return apiRequest(`/admin/students/${studentId}/progress/`)
}

import { apiRequest, buildQuery } from './api'

// Topics of every course: filters { course, search }
export function getAllTopics(filters = {}) {
  return apiRequest(`/topics/${buildQuery(filters)}`)
}

// ---------- Courses ----------

export function getCourses() {
  return apiRequest('/courses/')
}

export function getCourse(courseId) {
  return apiRequest(`/courses/${courseId}/`)
}

export function createCourse(data) {
  return apiRequest('/courses/', { method: 'POST', body: data })
}

export function updateCourse(courseId, data) {
  return apiRequest(`/courses/${courseId}/`, { method: 'PATCH', body: data })
}

export function deleteCourse(courseId) {
  return apiRequest(`/courses/${courseId}/`, { method: 'DELETE' })
}

// ---------- Topics ----------

export function getTopics(courseId) {
  return apiRequest(`/courses/${courseId}/topics/`)
}

export function getTopic(topicId) {
  return apiRequest(`/topics/${topicId}/`)
}

export function createTopic(courseId, data) {
  return apiRequest(`/courses/${courseId}/topics/`, { method: 'POST', body: data })
}

export function updateTopic(topicId, data) {
  return apiRequest(`/topics/${topicId}/`, { method: 'PATCH', body: data })
}

export function deleteTopic(topicId) {
  return apiRequest(`/topics/${topicId}/`, { method: 'DELETE' })
}

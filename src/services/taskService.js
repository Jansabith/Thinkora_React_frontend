import { apiRequest } from './api'

export function getTasks() {
  return apiRequest('/tasks/')
}

// data: { title: 'Read Django Models', due_date: '2026-09-20' (optional) }
export function createTask(data) {
  return apiRequest('/tasks/', { method: 'POST', body: data })
}

export function updateTask(taskId, data) {
  return apiRequest(`/tasks/${taskId}/`, { method: 'PATCH', body: data })
}

export function deleteTask(taskId) {
  return apiRequest(`/tasks/${taskId}/`, { method: 'DELETE' })
}

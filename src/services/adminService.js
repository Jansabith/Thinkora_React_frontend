import { apiRequest } from './api'

export function getDashboardStats() {
  return apiRequest('/admin/stats/')
}

// ---------- Students ----------

export function getStudents({ status = '', search = '' } = {}) {
  const params = new URLSearchParams()
  if (status) {
    params.set('status', status)
  }
  if (search) {
    params.set('search', search)
  }
  const query = params.toString()
  return apiRequest(`/admin/students/${query ? `?${query}` : ''}`)
}

export function approveStudent(studentId) {
  return apiRequest(`/admin/students/${studentId}/approve/`, { method: 'POST' })
}

export function rejectStudent(studentId) {
  return apiRequest(`/admin/students/${studentId}/reject/`, { method: 'POST' })
}

export function assignQuestionsToStudent(studentId, questionIds) {
  return apiRequest(`/students/${studentId}/assign-questions/`, {
    method: 'POST',
    body: { question_ids: questionIds }
  })
}

export function getAssignedQuestionIdsForStudent(studentId) {
  return apiRequest(`/students/${studentId}/assign-questions/`)
}

// data: { first_name, last_name, email, password (optional) }
export function updateStudent(studentId, data) {
  return apiRequest(`/admin/students/${studentId}/`, { method: 'PATCH', body: data })
}

export function deleteStudent(studentId) {
  return apiRequest(`/admin/students/${studentId}/`, { method: 'DELETE' })
}

// ---------- Admins (Main Admin only) ----------

export function getAdmins() {
  return apiRequest('/main-admin/admins/')
}

export function createAdmin(data) {
  return apiRequest('/main-admin/admins/', { method: 'POST', body: data })
}

export function updateAdmin(adminId, data) {
  return apiRequest(`/main-admin/admins/${adminId}/`, { method: 'PATCH', body: data })
}

export function deleteAdmin(adminId) {
  return apiRequest(`/main-admin/admins/${adminId}/`, { method: 'DELETE' })
}

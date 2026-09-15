import { apiRequest, buildQuery } from './api'

export function getStudentDashboard() {
  return apiRequest('/student/dashboard/')
}

export function getAdminDashboard() {
  return apiRequest('/admin/dashboard/')
}

// months: 3, 6 or 12
export function getStudentGrowth(months) {
  return apiRequest(`/admin/student-growth/${buildQuery({ months })}`)
}

export function getReports() {
  return apiRequest('/admin/reports/')
}

export function getNotifications() {
  return apiRequest('/notifications/')
}

// filters: { period: 'week' | 'month' | 'all', course, limit }
export function getLeaderboard(filters = {}) {
  return apiRequest(`/leaderboard/${buildQuery(filters)}`)
}

export function searchEverything(query) {
  return apiRequest(`/search/${buildQuery({ q: query })}`)
}

// filters: { kind: 'content', page: 2 }
export function getActivityLog(filters = {}) {
  return apiRequest(`/admin/activity/${buildQuery(filters)}`)
}

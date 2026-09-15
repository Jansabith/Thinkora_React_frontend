import { apiRequest } from './api'

export function requestAccess(formData) {
  return apiRequest('/auth/request-access/', { method: 'POST', body: formData, auth: false })
}

export function loginRequest(username, password) {
  return apiRequest('/auth/login/', { method: 'POST', body: { username, password }, auth: false })
}

export function logoutRequest() {
  return apiRequest('/auth/logout/', { method: 'POST' })
}

export function getCurrentUser() {
  return apiRequest('/auth/me/')
}

export function updateProfile(data) {
  return apiRequest('/auth/me/', { method: 'PATCH', body: data })
}

export function changePassword(data) {
  return apiRequest('/auth/change-password/', { method: 'POST', body: data })
}

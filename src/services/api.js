// Base address of the Django API.
// Development: http://127.0.0.1:8000 (from .env)
// Production:  '' (empty, from .env.production), so requests go to the same domain: /api/...
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

const TOKEN_STORAGE_KEY = 'lms_token'

// Sent to the whole app when Django says our token is no longer valid.
export const UNAUTHORIZED_EVENT = 'lms:unauthorized'

// ---------- Token storage ----------
// "Keep me signed in" ON  -> localStorage: the user stays logged in after closing the browser.
// "Keep me signed in" OFF -> sessionStorage: the token is forgotten when the browser closes.

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY) ?? sessionStorage.getItem(TOKEN_STORAGE_KEY)
}

export function storeToken(token, remember = localStorage.getItem(TOKEN_STORAGE_KEY) !== null) {
  clearStoredToken()
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  sessionStorage.removeItem(TOKEN_STORAGE_KEY)
}

// ---------- URLs ----------

// buildQuery({ status: 'open', page: 2, search: '' }) -> '?status=open&page=2' (empty values are skipped)
export function buildQuery(params = {}) {
  const query = new URLSearchParams()
  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.set(name, value)
    }
  }
  const text = query.toString()
  return text ? `?${text}` : ''
}

// ---------- Errors ----------

// An Error that also remembers the HTTP status and Django's error data.
export class ApiError extends Error {
  constructor(status, data) {
    super(getErrorMessage(status, data))
    this.status = status
    this.data = data
  }
}

function getErrorMessage(status, data) {
  if (status === 404) {
    return 'Not found. It may have been deleted, or you may not have access to it.'
  }
  if (data?.detail) {
    return data.detail
  }
  if (status === 400) {
    return 'Please check the form for errors.'
  }
  return `Something went wrong (status ${status}).`
}

// Django's form errors look like { "email": ["This field is required."] }.
export function getFieldErrors(error) {
  return error?.status === 400 && error.data ? error.data : {}
}

// Finds the first readable message inside a (possibly nested) error value.
export function getErrorText(error) {
  if (!error) {
    return null
  }
  if (typeof error === 'string') {
    return error
  }
  const values = Array.isArray(error) ? error : Object.values(error)
  for (const value of values) {
    const text = getErrorText(value)
    if (text) {
      return text
    }
  }
  return null
}

// ---------- Requests ----------

// Sends a request to Django and returns the JSON answer.
// Throws an ApiError when Django answers with an error status (400, 401, 403, 404, 500 ...).
// auth: false -> do not send the token (used for login and "Get Access").
export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }

  const token = getStoredToken()
  if (auth && token) {
    headers.Authorization = `Token ${token}`
  }
  if (body !== undefined) {
    if (!(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    })
  } catch {
    // fetch() only throws when the server cannot be reached at all (or CORS blocked it).
    throw new ApiError(0, { detail: 'Cannot reach the server. Please try again in a moment.' })
  }

  // 204 No Content (for example after DELETE) has no body to read.
  const data = response.status === 204 ? null : await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401 && auth && token) {
      // Our token is no longer valid (logged out elsewhere, account disabled ...).
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    throw new ApiError(response.status, data)
  }

  return data
}

export function getHealthStatus() {
  return apiRequest('/health/', { auth: false })
}

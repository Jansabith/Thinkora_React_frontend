import { useCallback, useEffect, useState } from 'react'
import { UNAUTHORIZED_EVENT, clearStoredToken, getStoredToken, storeToken } from '../services/api'
import { getCurrentUser, loginRequest, logoutRequest } from '../services/authService'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // If a token is saved, we must ask Django who it belongs to before showing protected pages.
  const [isLoading, setIsLoading] = useState(() => Boolean(getStoredToken()))

  const clearSession = useCallback(() => {
    clearStoredToken()
    setUser(null)
  }, [])

  // When the app opens: turn a saved token back into a user.
  useEffect(() => {
    if (!getStoredToken()) {
      return
    }
    getCurrentUser()
      .then(setUser)
      .catch(clearSession)
      .finally(() => setIsLoading(false))
  }, [clearSession])

  // If any API request answers 401, the token is no longer valid: log out locally.
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, clearSession)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, clearSession)
  }, [clearSession])

  // remember: "Keep me signed in" (see storeToken in services/api.js)
  const login = useCallback(async (username, password, remember = true) => {
    clearStoredToken()
    const data = await loginRequest(username, password)
    storeToken(data.token, remember)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } catch {
      // Even if the server cannot be reached, forget the token in this browser.
    }
    clearSession()
  }, [clearSession])

  const value = { user, isLoading, login, logout, updateUser: setUser }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

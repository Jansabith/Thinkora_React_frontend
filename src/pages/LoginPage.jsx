import { ArrowRight, GraduationCap, ShieldCheck, User } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import Alert from '../components/Alert'
import FormField from '../components/FormField'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../hooks/useAuth'
import { getDashboardPath } from '../utils/auth'

// Used for both /login (students) and /admin/login (admins). The API is the same.
function LoginPage({ isAdminLogin = false }) {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Already logged in? Go straight to the dashboard.
  if (user && !isSubmitting) {
    return <Navigate to={getDashboardPath(user)} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    setError('')
    setIsSubmitting(true)

    try {
      const loggedInUser = await login(username, password, remember)

      if (isAdminLogin && loggedInUser.role === 'student') {
        await logout()
        setError('This login page is for admins. Students, please use the Student tab.')
        setIsSubmitting(false)
        return
      }

      // Signal the AppShell to show the welcome screen
      sessionStorage.setItem('justLoggedIn', 'true')

      // Go back to the page the user wanted, or to their dashboard.
      navigate(location.state?.from ?? getDashboardPath(loggedInUser), { replace: true })
    } catch (loginError) {
      setError(loginError.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-card">
      <nav className="segmented" aria-label="Choose how to log in">
        <Link to="/login" aria-current={isAdminLogin ? undefined : 'page'}>
          <GraduationCap size={16} aria-hidden="true" /> Student
        </Link>
        <Link to="/admin/login" aria-current={isAdminLogin ? 'page' : undefined}>
          <ShieldCheck size={16} aria-hidden="true" /> Admin
        </Link>
      </nav>

      <h1>{isAdminLogin ? 'Admin sign in' : 'Welcome back'}</h1>
      <p className="auth-subtitle">
        {isAdminLogin ? 'Manage students, courses, questions and doubts.' : 'Log in to continue your learning journey.'}
      </p>

      <Alert type="error">{error}</Alert>

      <form onSubmit={handleSubmit}>
        <FormField label="Username" htmlFor="username">
          <div className="input-with-icon">
            <User size={18} aria-hidden="true" />
            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="Your username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>
        </FormField>

        <FormField label="Password" htmlFor="password">
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </FormField>

        <div className="auth-options">
          <label className="checkbox-field">
            <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
            Keep me signed in
          </label>
        </div>

        <button type="submit" className="btn btn-primary btn-block btn-large" disabled={isSubmitting}>
          {isSubmitting ? (
            'Signing in...'
          ) : (
            <>
              Sign in <ArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      {isAdminLogin ? (
        <p className="form-footer">Admin accounts are created by the Main Admin.</p>
      ) : (
        <>
          <div className="auth-divider">New here?</div>
          <Link to="/get-access" className="btn btn-secondary btn-block">
            Request access
          </Link>
        </>
      )}
    </div>
  )
}

export default LoginPage

import { ArrowRight, CircleCheck, Clock, GraduationCap, Mail, ShieldCheck, User } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import Alert from '../components/Alert'
import FormField from '../components/FormField'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../hooks/useAuth'
import { getFieldErrors } from '../services/api'
import { requestAccess } from '../services/authService'
import PhoneInput from '../components/PhoneInput'
import { getDashboardPath } from '../utils/auth'

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  whatsapp_number: '',
  username: '',
  password: '',
  confirm_password: '',
  request_message: '',
}

function GetAccessPage() {
  const { user } = useAuth()
  const [form, setForm] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (user) {
    return <Navigate to={getDashboardPath(user)} replace />
  }

  // One change handler for every input: the input's "name" says which field changed.
  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setFieldErrors({})

    // Quick check in the browser. Django checks again, because browsers can be bypassed.
    if (form.password !== form.confirm_password) {
      setFieldErrors({ confirm_password: 'The two passwords do not match.' })
      return
    }

    setIsSubmitting(true)
    try {
      const data = await requestAccess(form)
      setSuccessMessage(data.detail)
      setForm(EMPTY_FORM)
    } catch (requestError) {
      setFieldErrors(getFieldErrors(requestError))
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (successMessage) {
    return (
      <div className="auth-card text-center">
        <span className="auth-success-icon">
          <CircleCheck size={34} aria-hidden="true" />
        </span>
        <h1>Request sent</h1>
        <p className="auth-subtitle">{successMessage}</p>
        <ol className="auth-steps">
          <li>
            <span className="activity-icon tone-blue" aria-hidden="true">
              <Clock size={17} />
            </span>
            A teacher reviews your request.
          </li>
          <li>
            <span className="activity-icon tone-green" aria-hidden="true">
              <ShieldCheck size={17} />
            </span>
            Once approved, your account is activated.
          </li>
          <li>
            <span className="activity-icon tone-violet" aria-hidden="true">
              <GraduationCap size={17} />
            </span>
            Log in and start learning.
          </li>
        </ol>
        <Link to="/login" className="btn btn-primary btn-block btn-large">
          Go to log in <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    )
  }

  return (
    <div className="auth-card auth-card-wide">
      <h1>Get access</h1>
      <p className="auth-subtitle">Tell us who you are. A teacher approves your account before you can log in.</p>

      <Alert type="error">{error}</Alert>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <FormField label="First name" htmlFor="first_name" error={fieldErrors.first_name}>
            <input id="first_name" name="first_name" type="text" autoComplete="given-name" value={form.first_name} onChange={handleChange} required />
          </FormField>
          <FormField label="Last name" htmlFor="last_name" error={fieldErrors.last_name}>
            <input id="last_name" name="last_name" type="text" autoComplete="family-name" value={form.last_name} onChange={handleChange} required />
          </FormField>
        </div>

        <FormField label="Email" htmlFor="email" error={fieldErrors.email}>
          <div className="input-with-icon">
            <Mail size={18} aria-hidden="true" />
            <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>
        </FormField>

        <FormField
          label="WhatsApp number (optional)"
          htmlFor="whatsapp_number"
          error={fieldErrors.whatsapp_number}
          hint="Type your number without country code. Select your country code on the left."
        >
          <PhoneInput
            id="whatsapp_number"
            name="whatsapp_number"
            value={form.whatsapp_number}
            onChange={handleChange}
          />
        </FormField>

        <FormField
          label="Username"
          htmlFor="username"
          error={fieldErrors.username}
          hint="Letters, numbers and @ . + - _ only. You will use it to log in."
        >
          <div className="input-with-icon">
            <User size={18} aria-hidden="true" />
            <input id="username" name="username" type="text" autoComplete="username" value={form.username} onChange={handleChange} required />
          </div>
        </FormField>

        <div className="form-row">
          <FormField label="Password" htmlFor="password" error={fieldErrors.password} hint="At least 8 characters.">
            <PasswordInput id="password" name="password" autoComplete="new-password" value={form.password} onChange={handleChange} required />
          </FormField>
          <FormField label="Confirm password" htmlFor="confirm_password" error={fieldErrors.confirm_password}>
            <PasswordInput
              id="confirm_password"
              name="confirm_password"
              autoComplete="new-password"
              value={form.confirm_password}
              onChange={handleChange}
              required
            />
          </FormField>
        </div>

        <FormField
          label="Message for your teacher (optional)"
          htmlFor="request_message"
          error={fieldErrors.request_message}
          hint="For example your class or roll number."
        >
          <textarea id="request_message" name="request_message" rows={3} value={form.request_message} onChange={handleChange} />
        </FormField>

        <button type="submit" className="btn btn-primary btn-block btn-large" disabled={isSubmitting}>
          {isSubmitting ? 'Sending request...' : 'Request access'}
        </button>
      </form>

      <p className="form-footer">
        Already approved? <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}

export default GetAccessPage

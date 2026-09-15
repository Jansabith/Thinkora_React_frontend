import { Monitor, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import Alert from '../components/Alert'
import FormField from '../components/FormField'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import PasswordInput from '../components/PasswordInput'
import { useTheme } from '../hooks/useTheme'
import { getFieldErrors, storeToken } from '../services/api'
import { changePassword } from '../services/authService'

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

const EMPTY_PASSWORD_FORM = { current_password: '', new_password: '', confirm_new_password: '' }

function SettingsPage() {
  const { preference, setPreference } = useTheme()
  const [passwords, setPasswords] = useState(EMPTY_PASSWORD_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setPasswords((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFieldErrors({})
    setMessage(null)

    if (passwords.new_password !== passwords.confirm_new_password) {
      setFieldErrors({ confirm_new_password: 'The two new passwords do not match.' })
      return
    }

    setIsSaving(true)
    try {
      const data = await changePassword({
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      })
      // Django gave us a new token (the old one was deleted for safety).
      storeToken(data.token)
      setPasswords(EMPTY_PASSWORD_FORM)
      setMessage({ type: 'success', text: 'Your password was changed. Other devices were logged out.' })
    } catch (saveError) {
      setFieldErrors(getFieldErrors(saveError))
      setMessage({ type: 'error', text: saveError.message })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Choose how the LMS looks, and keep your account secure." />

      <div className="profile-grid">
        <Panel title="Appearance" subtitle="System follows your computer's light or dark setting.">
          <div className="theme-options" role="radiogroup" aria-label="Theme">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={preference === option.value}
                  className="theme-option"
                  onClick={() => setPreference(option.value)}
                >
                  <Icon size={22} aria-hidden="true" />
                  {option.label}
                </button>
              )
            })}
          </div>
        </Panel>

        <Panel title="Change password">
          {message && <Alert type={message.type}>{message.text}</Alert>}
          <form onSubmit={handleSubmit}>
            <FormField label="Current password" htmlFor="current_password" error={fieldErrors.current_password}>
              <PasswordInput
                id="current_password"
                name="current_password"
                autoComplete="current-password"
                value={passwords.current_password}
                onChange={handleChange}
                required
              />
            </FormField>
            <FormField label="New password" htmlFor="new_password" error={fieldErrors.new_password}>
              <PasswordInput
                id="new_password"
                name="new_password"
                autoComplete="new-password"
                value={passwords.new_password}
                onChange={handleChange}
                required
              />
            </FormField>
            <FormField label="Confirm new password" htmlFor="confirm_new_password" error={fieldErrors.confirm_new_password}>
              <PasswordInput
                id="confirm_new_password"
                name="confirm_new_password"
                autoComplete="new-password"
                value={passwords.confirm_new_password}
                onChange={handleChange}
                required
              />
            </FormField>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Changing...' : 'Change password'}
            </button>
          </form>
        </Panel>
      </div>
    </>
  )
}

export default SettingsPage

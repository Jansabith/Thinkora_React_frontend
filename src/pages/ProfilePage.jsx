import { useState } from 'react'
import { Link } from 'react-router'
import Alert from '../components/Alert'
import Avatar from '../components/Avatar'
import AvatarPicker from '../components/AvatarPicker'
import FormField from '../components/FormField'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../hooks/useAuth'
import { getFieldErrors } from '../services/api'
import { updateProfile } from '../services/authService'
import { ROLE_LABELS } from '../utils/auth'
import { formatDate, getFullName } from '../utils/format'

function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setProfile((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFieldErrors({})
    setMessage(null)
    setIsSaving(true)
    try {
      const updatedUser = await updateProfile(profile)
      updateUser(updatedUser)
      setMessage({ type: 'success', text: 'Your profile was saved.' })
    } catch (saveError) {
      setFieldErrors(getFieldErrors(saveError))
      setMessage({ type: 'error', text: saveError.message })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="My profile" subtitle="Your account details." />

      <div className="profile-grid">
        <Panel>
          <div className="profile-identity">
            <Avatar name={getFullName(user)} size={64} color={user.avatar_color} icon={user.avatar_icon} />
            <div>
              <h2>{getFullName(user)}</h2>
              <span className="muted">@{user.username}</span>
            </div>
          </div>
          <dl className="details-list">
            <dt>Role</dt>
            <dd>{ROLE_LABELS[user.role]}</dd>
            {user.role === 'student' && (
              <>
                <dt>Access</dt>
                <dd>
                  <StatusBadge status={user.access_status} />
                </dd>
              </>
            )}
            <dt>Email</dt>
            <dd>{user.email}</dd>
            <dt>Joined</dt>
            <dd>{formatDate(user.date_joined)}</dd>
          </dl>
          <p className="field-hint">
            To change your password or the light/dark theme, open <Link to="/settings">Settings</Link>.
          </p>
        </Panel>

        <Panel title="Personal details">
          {message && <Alert type={message.type}>{message.text}</Alert>}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <FormField label="First name" htmlFor="first_name" error={fieldErrors.first_name}>
                <input id="first_name" name="first_name" type="text" value={profile.first_name} onChange={handleChange} />
              </FormField>
              <FormField label="Last name" htmlFor="last_name" error={fieldErrors.last_name}>
                <input id="last_name" name="last_name" type="text" value={profile.last_name} onChange={handleChange} />
              </FormField>
            </div>
            <FormField label="Email" htmlFor="email" error={fieldErrors.email}>
              <input id="email" name="email" type="email" value={profile.email} onChange={handleChange} required />
            </FormField>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save details'}
            </button>
          </form>
        </Panel>

        <Panel title="Appearance">
          <AvatarPicker user={user} onSaved={updateUser} />
        </Panel>
      </div>
    </>
  )
}

export default ProfilePage

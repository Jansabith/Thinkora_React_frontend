import { useState } from 'react'
import Alert from './Alert'
import Avatar from './Avatar'
import { updateProfile } from '../services/authService'
import { AVATAR_COLORS, AVATAR_ICONS } from '../utils/avatars'
import { getFullName } from '../utils/format'

// Lets the logged-in user choose the colour and the picture of their own avatar.
// Each click saves straight away, so the change feels instant.
function AvatarPicker({ user, onSaved }) {
  const [choice, setChoice] = useState({
    avatar_color: user.avatar_color || '',
    avatar_icon: user.avatar_icon || 'initials',
  })
  const [error, setError] = useState('')
  const name = getFullName(user)

  async function save(changes) {
    const previous = choice
    const next = { ...choice, ...changes }
    // Show the new avatar immediately, then tell the server.
    setChoice(next)
    setError('')
    try {
      const updatedUser = await updateProfile(next)
      onSaved?.(updatedUser)
    } catch (saveError) {
      setChoice(previous)
      setError(saveError.message)
    }
  }

  return (
    <div className="avatar-picker">
      <div className="avatar-picker-preview">
        <Avatar name={name} size={88} color={choice.avatar_color} icon={choice.avatar_icon} ring />
        <div>
          <h3>Your picture</h3>
          <p className="muted">Pick a colour and a character. Only you can change it.</p>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <fieldset className="avatar-picker-group">
        <legend>Colour</legend>
        <div className="avatar-swatches">
          {AVATAR_COLORS.map((color) => (
            <button
              key={color.key}
              type="button"
              className={`avatar-swatch ${choice.avatar_color === color.key ? 'is-selected' : ''}`}
              style={{ background: color.background }}
              onClick={() => save({ avatar_color: color.key })}
              aria-pressed={choice.avatar_color === color.key}
              title={color.label}
            >
              <span className="sr-only">{color.label}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="avatar-picker-group">
        <legend>Character</legend>
        <div className="avatar-icons">
          {AVATAR_ICONS.map((icon) => (
            <button
              key={icon.key}
              type="button"
              className={`avatar-icon-option ${choice.avatar_icon === icon.key ? 'is-selected' : ''}`}
              onClick={() => save({ avatar_icon: icon.key })}
              aria-pressed={choice.avatar_icon === icon.key}
              title={icon.label}
            >
              <span aria-hidden="true">{icon.character || 'Aa'}</span>
              <span className="sr-only">{icon.label}</span>
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

export default AvatarPicker

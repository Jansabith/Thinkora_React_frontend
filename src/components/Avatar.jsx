import { getAvatarBackground, getAvatarCharacter } from '../utils/avatars'
import { getInitials } from '../utils/format'

// A round picture for a person.
//   name:  'Sara Ahmed' -> SA
//   color: a key from AVATAR_COLORS (empty = an automatic colour made from the name)
//   icon:  a key from AVATAR_ICONS  (empty or 'initials' = show the letters)
function Avatar({ name = '', size = 40, color = '', icon = '', ring = false }) {
  const character = getAvatarCharacter(icon)
  const content = character || getInitials(name) || '?'

  return (
    <span
      className={`avatar ${ring ? 'avatar-ring' : ''}`}
      style={{
        width: size,
        height: size,
        background: getAvatarBackground(color, name),
        // Pictures need more room inside the circle than two letters do.
        fontSize: Math.round(size * (character ? 0.52 : 0.38)),
      }}
      aria-hidden="true"
    >
      {content}
    </span>
  )
}

export default Avatar

import { getInitials } from '../utils/format'

// Dark enough for white letters to stay readable.
const COLORS = ['#3151d8', '#6d28d9', '#0e7490', '#be185d', '#c2410c', '#047857']

// A round picture with the person's initials: 'Sara Ahmed' -> SA
function Avatar({ name = '', size = 40 }) {
  const colorIndex = [...name].reduce((sum, character) => sum + character.charCodeAt(0), 0) % COLORS.length

  return (
    <span
      className="avatar"
      style={{ width: size, height: size, background: COLORS[colorIndex], fontSize: Math.round(size * 0.38) }}
      aria-hidden="true"
    >
      {getInitials(name) || '?'}
    </span>
  )
}

export default Avatar

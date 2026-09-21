import { useCountUp } from '../hooks/useCountUp'

// Matches values the animation can handle: 12, 67%, 1,240, 4.5s
const NUMERIC = /^(-?[\d,]+(?:\.\d+)?)(.*)$/

// Animates a number up from zero when it first appears.
// Anything that is not a number (a date, a dash, a word) is shown unchanged.
function CountUp({ value }) {
  const match = typeof value === 'string' ? value.match(NUMERIC) : null
  const target = typeof value === 'number' ? value : match ? Number(match[1].replace(/,/g, '')) : null
  const suffix = match ? match[2] : ''

  const shown = useCountUp(target === null || Number.isNaN(target) ? value : target)

  if (target === null || Number.isNaN(target)) {
    return value
  }
  // Keep thousands separators and any suffix like % or s.
  return `${typeof shown === 'number' ? shown.toLocaleString() : shown}${suffix}`
}

export default CountUp

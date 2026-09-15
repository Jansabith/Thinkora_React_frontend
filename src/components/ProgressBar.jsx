import { percent } from '../utils/format'

// A thin bar that fills up as questions are done, with "3/7" (or "43%") next to it.
function ProgressBar({ value, max, label = 'Progress', showPercent = false }) {
  const filled = percent(value, max)

  return (
    <span className="progress">
      <span
        className="progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <span className="progress-fill" style={{ width: `${filled}%` }} />
      </span>
      <span className="progress-text">{showPercent ? `${filled}%` : `${value}/${max}`}</span>
    </span>
  )
}

export default ProgressBar

import { DIFFICULTIES } from '../utils/difficulties'

// Small coloured counters: "Easy 3  Medium 2  Hard 1"
function DifficultyCounts({ topic }) {
  return (
    <span className="difficulty-counts">
      {DIFFICULTIES.map((difficulty) => (
        <span key={difficulty.value} className={`badge badge-${difficulty.value}`}>
          {difficulty.label} {topic[difficulty.countField]}
        </span>
      ))}
    </span>
  )
}

export default DifficultyCounts

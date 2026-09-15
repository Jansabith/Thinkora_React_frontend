import { DIFFICULTIES } from '../utils/difficulties'

const TABS = [{ value: '', label: 'All', countField: 'question_count' }, ...DIFFICULTIES]

// Buttons: All | Easy | Medium | Hard, each with its number of questions.
// counts: a topic from the API (it has question_count, easy_count, medium_count, hard_count)
function DifficultyTabs({ selected, counts, onSelect }) {
  return (
    <div className="filter-tabs" role="group" aria-label="Filter questions by difficulty">
      {TABS.map((tab) => (
        <button
          key={tab.value || 'all'}
          type="button"
          className={`filter-tab ${selected === tab.value ? 'active' : ''}`}
          aria-pressed={selected === tab.value}
          onClick={() => onSelect(tab.value)}
        >
          {tab.label} <span className="tab-count">{counts[tab.countField]}</span>
        </button>
      ))}
    </div>
  )
}

export default DifficultyTabs

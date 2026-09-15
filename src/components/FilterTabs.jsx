// A row of buttons where exactly one is selected, for example: Open | Resolved | All doubts
// options: [{ value: 'open', label: 'Open' }, ...]
function FilterTabs({ options, value, onChange, label }) {
  return (
    <div className="filter-tabs" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value || 'all'}
          type="button"
          className={`filter-tab ${value === option.value ? 'active' : ''}`}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default FilterTabs

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useApiData } from '../hooks/useApiData'
import { getMyCalendar } from '../services/progressService'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toDateKey(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// A month calendar. Today is highlighted, and a green dot marks days when the student finished questions.
function ActivityCalendar() {
  const today = new Date()
  const [shown, setShown] = useState({ year: today.getFullYear(), month: today.getMonth() + 1 })

  const loadDays = useCallback(() => getMyCalendar(shown.year, shown.month), [shown])
  const { data } = useApiData(loadDays, { keepPreviousData: true })
  const activeDays = data && data.year === shown.year && data.month === shown.month ? data.days : {}

  function changeMonth(step) {
    setShown(({ year, month }) => {
      const date = new Date(year, month - 1 + step, 1)
      return { year: date.getFullYear(), month: date.getMonth() + 1 }
    })
  }

  const firstWeekday = new Date(shown.year, shown.month - 1, 1).getDay()
  const daysInMonth = new Date(shown.year, shown.month, 0).getDate()
  const monthLabel = new Date(shown.year, shown.month - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const isThisMonth = shown.year === today.getFullYear() && shown.month === today.getMonth() + 1

  return (
    <div>
      <div className="calendar-header">
        <button type="button" className="icon-button icon-button-small" onClick={() => changeMonth(-1)} aria-label="Previous month">
          <ChevronLeft size={16} />
        </button>
        <h2 aria-live="polite">{monthLabel}</h2>
        <button type="button" className="icon-button icon-button-small" onClick={() => changeMonth(1)} aria-label="Next month">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="calendar-grid">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday} className="calendar-weekday">
            {weekday}
          </span>
        ))}
        {Array.from({ length: firstWeekday }, (_, index) => (
          <span key={`empty-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1
          const doneCount = activeDays[toDateKey(shown.year, shown.month, day)] ?? 0
          const isToday = isThisMonth && day === today.getDate()
          const description = doneCount ? `${day}: ${doneCount} question${doneCount === 1 ? '' : 's'} done` : undefined
          return (
            <span
              key={day}
              className={`calendar-day ${isToday ? 'is-today' : ''} ${doneCount ? 'has-activity' : ''}`}
              title={description}
              aria-label={description}
              aria-current={isToday ? 'date' : undefined}
            >
              {day}
            </span>
          )
        })}
      </div>
      <p className="calendar-legend">Days you finished questions</p>
    </div>
  )
}

export default ActivityCalendar

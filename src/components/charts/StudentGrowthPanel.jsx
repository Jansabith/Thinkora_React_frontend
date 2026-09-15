import { useCallback, useState } from 'react'
import { useApiData } from '../../hooks/useApiData'
import { getStudentGrowth } from '../../services/dashboardService'
import ChartPanel from './ChartPanel'
import LineChart from './LineChart'

const RANGES = [3, 6, 12]

function toChartPoints(points) {
  return points.map((point) => {
    const [year, month] = point.month.split('-').map(Number)
    const date = new Date(year, month - 1, 1)
    return {
      label: date.toLocaleDateString(undefined, { month: 'short' }),
      fullLabel: date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
      value: point.total_students,
      newStudents: point.new_students,
    }
  })
}

// Total students at the end of each month, with a time-range menu.
// initialPoints: the numbers the dashboard already loaded (so the first view needs no extra request).
function StudentGrowthPanel({ initialPoints, className }) {
  const [months, setMonths] = useState(initialPoints.length)

  const loadGrowth = useCallback(
    () => (months === initialPoints.length ? Promise.resolve(initialPoints) : getStudentGrowth(months)),
    [months, initialPoints],
  )
  // keepPreviousData: the old line stays (faded) while the new range loads.
  const { data, isLoading } = useApiData(loadGrowth, { keepPreviousData: true })
  const points = toChartPoints(data ?? initialPoints)

  return (
    <ChartPanel
      className={className}
      title="Student Growth"
      subtitle="Total students at the end of each month"
      isRefreshing={isLoading}
      actions={
        <select
          className="compact-select"
          aria-label="Time range"
          value={months}
          onChange={(event) => setMonths(Number(event.target.value))}
        >
          {RANGES.map((range) => (
            <option key={range} value={range}>
              Last {range} months
            </option>
          ))}
        </select>
      }
      chart={<LineChart points={points} valueLabel="students" ariaLabel="Total students per month" />}
      columns={[
        { key: 'fullLabel', label: 'Month' },
        { key: 'newStudents', label: 'New students', numeric: true },
        { key: 'value', label: 'Total students', numeric: true },
      ]}
      rows={points}
    />
  )
}

export default StudentGrowthPanel

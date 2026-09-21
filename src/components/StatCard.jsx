import CountUp from './CountUp'

// A big number with a label, used on dashboards. small: for longer values like dates.
function StatCard({ label, value, highlight = false, small = false }) {
  return (
    <div className={`card stat-card ${highlight ? 'highlight' : ''}`}>
      <span className={small ? 'stat-value stat-value-small' : 'stat-value'}>
        <CountUp value={value} />
      </span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

export default StatCard

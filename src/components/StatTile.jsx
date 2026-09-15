import { TrendingUp } from 'lucide-react'

// A big number with an icon and a label.
//   tone:   blue | green | violet | amber
//   tinted: coloured background (admin dashboard)
//   delta:  { text: '+3 new this month', flat: false }
function StatTile({ icon: Icon, tone = 'blue', value, label, delta, tinted = false }) {
  return (
    <div className={`stat-tile stat-tile-${tone} ${tinted ? 'stat-tile-tinted' : ''}`}>
      <span className="stat-tile-icon" aria-hidden="true">
        <Icon size={24} />
      </span>
      <div>
        <span className="stat-tile-value">{value}</span>
        <span className="stat-tile-label">{label}</span>
        {delta && (
          <span className={`stat-tile-delta ${delta.flat ? 'stat-tile-delta-flat' : ''}`}>
            {!delta.flat && <TrendingUp size={14} aria-hidden="true" />}
            {delta.text}
          </span>
        )}
      </div>
    </div>
  )
}

export default StatTile

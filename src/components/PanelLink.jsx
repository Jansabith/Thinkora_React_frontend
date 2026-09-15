import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'

// The small "View all →" link in a panel header.
function PanelLink({ to, children }) {
  return (
    <Link to={to} className="panel-link">
      {children} <ArrowRight size={14} aria-hidden="true" />
    </Link>
  )
}

export default PanelLink

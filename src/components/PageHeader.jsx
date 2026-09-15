import { Link } from 'react-router'

// Page title, optional subtitle, optional "back" link, and optional buttons (children).
function PageHeader({ title, subtitle, backTo, backLabel = 'Back', children }) {
  return (
    <div className="page-header">
      {backTo && (
        <Link to={backTo} className="back-link">
          ← {backLabel}
        </Link>
      )}
      <div className="page-header-row">
        <div>
          <h1>{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {children && <div className="page-actions">{children}</div>}
      </div>
    </div>
  )
}

export default PageHeader

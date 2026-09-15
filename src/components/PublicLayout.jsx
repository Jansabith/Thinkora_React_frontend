import { Link, Outlet, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { getDashboardPath } from '../utils/auth'
import BrandLogo from './BrandLogo'
import ThemeToggle from './ThemeToggle'

// The simple header for public pages (home page, page not found).
function PublicLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <>
      {!isHomePage && (
        <header className="public-header">
          <BrandLogo tone="dark" />
          <nav aria-label="Account">
            <ThemeToggle />
            {user ? (
              <Link to={getDashboardPath(user)} className="btn btn-primary">
                My dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">
                  Log in
                </Link>
                <Link to="/get-access" className="btn btn-primary">
                  Get Access
                </Link>
              </>
            )}
          </nav>
        </header>
      )}
      <main className={isHomePage ? '' : 'public-main'}>
        <Outlet />
      </main>
    </>
  )
}

export default PublicLayout

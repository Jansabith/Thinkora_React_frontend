import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { getDashboardPath } from '../utils/auth'
import Alert from './Alert'
import Loading from './Loading'

// Wraps pages that need a logged-in user.
//   allowedRoles:       for example ['student'] (not given = any logged-in user)
//   requiredPermission: 'students' or 'content' (for admins with limited rights)
//
// IMPORTANT: this only improves the user experience.
// The REAL protection is in Django, which checks the token and permissions on every API request.
function ProtectedRoute({ allowedRoles, requiredPermission }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  // Pass the app shell's shared functions (like refreshNotifications) on to the pages inside.
  const outletContext = useOutletContext()

  if (isLoading) {
    return <Loading message="Checking your login..." />
  }

  if (!user) {
    const isAdminArea = location.pathname.startsWith('/admin') || location.pathname.startsWith('/main-admin')
    return <Navigate to={isAdminArea ? '/admin/login' : '/login'} replace state={{ from: location.pathname }} />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user)} replace />
  }

  const permissions = { students: user.can_manage_students, content: user.can_manage_content }
  if (requiredPermission && !permissions[requiredPermission]) {
    return (
      <Alert type="error">You do not have permission to open this page. Ask the Main Admin for access.</Alert>
    )
  }

  return <Outlet context={outletContext} />
}

export default ProtectedRoute

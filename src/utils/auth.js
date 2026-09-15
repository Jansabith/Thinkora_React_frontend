export const ADMIN_ROLES = ['admin', 'main_admin']

export const ROLE_LABELS = {
  student: 'Student',
  admin: 'Admin',
  main_admin: 'Main Admin',
}

export function isAdminRole(role) {
  return ADMIN_ROLES.includes(role)
}

// Where each kind of user starts after logging in.
export function getDashboardPath(user) {
  return isAdminRole(user.role) ? '/admin' : '/student'
}

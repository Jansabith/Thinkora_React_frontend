import { BookOpen, LayoutDashboard, Menu, MessageCircleQuestion, PencilLine, Trophy, Users } from 'lucide-react'
import { NavLink } from 'react-router'
import { useAuth } from '../hooks/useAuth'

const MAX_LINKS = 4

// The most used pages for this user. Everything else is in the full menu.
function getItems(user, badges) {
  if (user.role === 'student') {
    return [
      { to: '/student', label: 'Home', icon: LayoutDashboard, end: true },
      { to: '/student/courses', label: 'Courses', icon: BookOpen },
      { to: '/student/practice', label: 'Practice', icon: PencilLine },
      { to: '/student/leaderboard', label: 'Ranks', icon: Trophy },
    ]
  }

  const items = [{ to: '/admin', label: 'Home', icon: LayoutDashboard, end: true }]
  if (user.can_manage_students) {
    items.push(
      { to: '/admin/students', label: 'Students', icon: Users, badge: badges.pending_requests },
      { to: '/admin/doubts', label: 'Doubts', icon: MessageCircleQuestion, badge: badges.open_doubts },
    )
  }
  if (user.can_manage_content) {
    items.push({ to: '/admin/courses', label: 'Courses', icon: BookOpen })
  }
  items.push({ to: '/admin/leaderboard', label: 'Ranks', icon: Trophy })
  return items.slice(0, MAX_LINKS)
}

// The bar at the bottom of the screen on phones: the main pages, plus "Menu" for the full sidebar.
function MobileNav({ badges, isMenuOpen, onOpenMenu }) {
  const { user } = useAuth()
  const items = getItems(user, badges)

  return (
    <nav className="mobile-nav" aria-label="Quick navigation">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <NavLink key={item.to} to={item.to} end={item.end} className="mobile-nav-link">
            <span className="mobile-nav-icon">
              <Icon size={20} aria-hidden="true" />
            </span>
            {item.label}
            {item.badge > 0 && (
              <span className="mobile-nav-badge">
                {item.badge}
                <span className="sr-only"> new</span>
              </span>
            )}
          </NavLink>
        )
      })}
      <button type="button" className="mobile-nav-link" onClick={onOpenMenu} aria-expanded={isMenuOpen}>
        <span className="mobile-nav-icon">
          <Menu size={20} aria-hidden="true" />
        </span>
        Menu
      </button>
    </nav>
  )
}

export default MobileNav

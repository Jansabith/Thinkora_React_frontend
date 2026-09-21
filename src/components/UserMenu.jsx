import { ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useClickOutside } from '../hooks/useClickOutside'
import { ROLE_LABELS } from '../utils/auth'
import { getFullName } from '../utils/format'
import Avatar from './Avatar'

// Avatar, name and role in the top bar, with Profile, Settings and Log out.
function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const close = useCallback(() => setIsOpen(false), [])
  const ref = useClickOutside(isOpen, close)
  const name = getFullName(user)

  async function handleLogout() {
    const loginPage = user.role === 'student' ? '/login' : '/admin/login'
    close()
    await logout()
    navigate(loginPage)
  }

  return (
    <div className="dropdown" ref={ref}>
      <button
        type="button"
        className="user-menu-button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Avatar name={name} size={40} color={user.avatar_color} icon={user.avatar_icon} />
        <span className="user-menu-text">
          <span className="user-menu-name">{name}</span>
          <span className="user-menu-role">{ROLE_LABELS[user.role]}</span>
        </span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="dropdown-panel" role="menu" style={{ width: 220 }}>
          <Link to="/profile" className="dropdown-item" role="menuitem" onClick={close}>
            <User size={16} aria-hidden="true" /> Profile
          </Link>
          <Link to="/settings" className="dropdown-item" role="menuitem" onClick={close}>
            <Settings size={16} aria-hidden="true" /> Settings
          </Link>
          <div className="dropdown-divider" />
          <button type="button" className="dropdown-item dropdown-item-danger" role="menuitem" onClick={handleLogout}>
            <LogOut size={16} aria-hidden="true" /> Log out
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu

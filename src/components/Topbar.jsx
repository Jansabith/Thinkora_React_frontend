import { Menu } from 'lucide-react'
import NotificationBell from './NotificationBell'
import SearchBox from './SearchBox'
import ThemeToggle from './ThemeToggle'
import UserMenu from './UserMenu'

// The bar at the top of every logged-in page: menu (small screens), search, theme, bell, user.
function Topbar({ notifications, onOpenSidebar }) {
  return (
    <header className="topbar">
      <button type="button" className="icon-button sidebar-toggle" onClick={onOpenSidebar} aria-label="Open menu">
        <Menu size={20} />
      </button>
      <SearchBox />
      <div className="topbar-actions">
        <ThemeToggle />
        <NotificationBell notifications={notifications} />
        <UserMenu />
      </div>
    </header>
  )
}

export default Topbar

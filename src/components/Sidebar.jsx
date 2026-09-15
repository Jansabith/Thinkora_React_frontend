import {
  Award,
  BookOpen,
  Bookmark,
  ChartColumn,
  CircleHelp,
  History,
  LayoutDashboard,
  Layers,
  ListChecks,
  MessageCircleQuestion,
  MessageSquare,
  PencilLine,
  Settings,
  ShieldCheck,
  TrendingUp,
  Trophy,
  User,
  UserPlus,
  Users,
} from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { BRAND } from '../utils/brand'
import BrandLogo from './BrandLogo'
import QuoteCard from './QuoteCard'

// Each user only sees the pages they may use. (Hiding links is for convenience: Django still checks every request.)
function getStudentSections(badges) {
  return [
    {
      items: [
        { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/student/courses', label: 'My Courses', icon: BookOpen },
        { to: '/student/topics', label: 'All Topics', icon: Layers },
        { to: '/student/practice', label: 'Practice', icon: PencilLine },
        { to: '/student/assigned', label: 'Teacher Assigned', icon: ListChecks },
        { to: '/student/bookmarks', label: 'Bookmarks', icon: Bookmark },
        { to: '/student/progress', label: 'My Progress', icon: TrendingUp },
        { to: '/student/leaderboard', label: 'Leaderboard', icon: Trophy },
        { to: '/student/certificates', label: 'Certificates', icon: Award },
        { to: '/student/messages', label: 'Messages', icon: MessageSquare, badge: badges.unread_messages, badgeTone: 'blue' },
        { to: '/profile', label: 'Profile', icon: User },
        { to: '/settings', label: 'Settings', icon: Settings },
      ],
    },
  ]
}

function getAdminSections(user, badges) {
  const manage = []
  if (user.can_manage_students) {
    manage.push(
      { to: '/admin/students', label: 'Students', icon: Users },
      { to: '/admin/requests', label: 'Student Requests', icon: UserPlus, badge: badges.pending_requests },
      { to: '/admin/doubts', label: 'Doubts', icon: MessageCircleQuestion, badge: badges.open_doubts, badgeTone: 'blue' },
    )
  }
  if (user.can_manage_content) {
    manage.push(
      { to: '/admin/courses', label: 'Courses', icon: BookOpen },
      { to: '/admin/topics', label: 'Topics', icon: Layers },
      { to: '/admin/questions', label: 'Questions', icon: ListChecks },
    )
  }

  const administration = []
  if (user.role === 'main_admin') {
    administration.push({ to: '/main-admin/admins', label: 'Manage Admins', icon: ShieldCheck })
  }
  if (user.can_manage_students) {
    administration.push({ to: '/admin/reports', label: 'Reports', icon: ChartColumn })
  }
  administration.push(
    { to: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/admin/activity', label: 'Activity Log', icon: History },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  )

  return [
    { items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }] },
    { label: 'Manage', items: manage },
    { label: 'Administration', items: administration },
  ].filter((section) => section.items.length > 0)
}

// onNavigate: closes the sidebar on small screens after a link is clicked.
function Sidebar({ badges, onNavigate }) {
  const { user } = useAuth()
  const isStudent = user.role === 'student'
  const sections = isStudent ? getStudentSections(badges) : getAdminSections(user, badges)

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <BrandLogo to={isStudent ? '/student' : '/admin'} onClick={onNavigate} withBackground maxWidth="180px" />

      <nav className="sidebar-nav">
        {sections.map((section) => (
          <div key={section.label ?? 'main'}>
            {section.label && <p className="sidebar-section-label">{section.label}</p>}
            {section.items.map((item) => {
              const Icon = item.icon
              return (
                <NavLink key={item.to} to={item.to} end={item.end} className="sidebar-link" onClick={onNavigate}>
                  <Icon size={19} aria-hidden="true" />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className={`sidebar-badge ${item.badgeTone === 'blue' ? 'sidebar-badge-blue' : ''}`}>
                      {item.badge}
                      <span className="sr-only"> new</span>
                    </span>
                  )}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {isStudent && (
        <div className="sidebar-help">
          <div className="sidebar-help-title">
            <CircleHelp size={20} aria-hidden="true" /> Need help?
          </div>
          <p>Stuck on a question? Press its Doubt button and your teacher will reply.</p>
          <Link to="/student/messages" className="btn btn-small" onClick={onNavigate}>
            Open my messages
          </Link>
        </div>
      )}

      <div className="sidebar-spacer" />

      <QuoteCard
        variant="dusk"
        rotate
        title={BRAND.name}
        subtitle={isStudent ? 'Knowledge today creates a brighter tomorrow.' : 'Empowering learners every day.'}
      />
    </aside>
  )
}

export default Sidebar

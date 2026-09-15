import { Award, BookOpen, ChevronLeft, MessageSquareText, Target } from 'lucide-react'
import { Link, Outlet } from 'react-router'
import BrandLogo from './BrandLogo'
import MountainScene from './MountainScene'
import ThemeToggle from './ThemeToggle'

const FEATURES = [
  { icon: BookOpen, text: 'Courses organised into clear topics' },
  { icon: Target, text: 'Practice questions from easy to hard' },
  { icon: MessageSquareText, text: 'Ask doubts and get answers from your teacher' },
  { icon: Award, text: 'Track your progress and earn certificates' },
]

// Login and Get Access: an illustrated panel on the left, the form on the right.
function AuthLayout() {
  return (
    <div className="auth-layout">
      <section className="auth-visual">
        <MountainScene variant="dusk" stars />
        <BrandLogo to="/" maxWidth="360px" />
        <div className="auth-visual-copy">
          <h2>Learn without limits.</h2>
          <p>Read, practise and grow step by step, with teachers who answer your doubts.</p>
        </div>
        <ul className="auth-features">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <li key={feature.text}>
                <Icon size={20} aria-hidden="true" />
                {feature.text}
              </li>
            )
          })}
        </ul>
      </section>

      <main className="auth-panel">
        <div className="auth-panel-top">
          <Link to="/" className="back-link">
            <ChevronLeft size={16} aria-hidden="true" /> Back to home
          </Link>
          <ThemeToggle />
        </div>
        <Outlet />
      </main>
    </div>
  )
}

export default AuthLayout

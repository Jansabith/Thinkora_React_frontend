import {
  ArrowRight,
  BookOpen,
  ChartColumn,
  CircleCheck,
  CirclePlay,
  GraduationCap,
  Lightbulb,
  Lock,
  MessageCircleQuestion,
  MessageSquareText,
  PencilLine,
  Star,
  Trophy,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router'
import ActivityCalendar from '../../components/ActivityCalendar'
import ChartLegend from '../../components/charts/ChartLegend'
import DonutChart from '../../components/charts/DonutChart'
import CourseIcon from '../../components/CourseIcon'
import LeaderboardPanel from '../../components/LeaderboardPanel'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import MountainScene from '../../components/MountainScene'
import Panel from '../../components/Panel'
import PanelLink from '../../components/PanelLink'
import ProgressBar from '../../components/ProgressBar'
import StatTile from '../../components/StatTile'
import StatusBadge from '../../components/StatusBadge'
import TasksWidget from '../../components/TasksWidget'
import { useApiData } from '../../hooks/useApiData'
import { useAuth } from '../../hooks/useAuth'
import { getStudentDashboard } from '../../services/dashboardService'
import { getQuoteOfTheDay } from '../../utils/brand'
import { pluralize, timeAgo } from '../../utils/format'

const ACTIVITY_STYLES = {
  done: { icon: CircleCheck, tone: 'tone-green' },
  doubt: { icon: MessageCircleQuestion, tone: 'tone-amber' },
  reply: { icon: MessageSquareText, tone: 'tone-blue' },
  answer: { icon: Lightbulb, tone: 'tone-violet' },
}

const ACHIEVEMENT_STYLES = {
  first_step: { icon: Star, background: 'linear-gradient(135deg, #3b82f6, #6366f1)' },
  curious_mind: { icon: Lightbulb, background: 'linear-gradient(135deg, #f59e0b, #ea580c)' },
  quick_learner: { icon: Zap, background: 'linear-gradient(135deg, #10b981, #047857)' },
  problem_solver: { icon: Trophy, background: 'linear-gradient(135deg, #f43f5e, #be123c)' },
  course_master: { icon: GraduationCap, background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
}

function ContinueCard({ course, isFeatured }) {
  const topicLink = `/student/topics/${course.current_topic.id}/questions`
  return (
    <article className={`course-card ${isFeatured ? 'course-card-featured' : ''}`}>
      <div className="course-card-top">
        <CourseIcon course={course} size={isFeatured ? 56 : 48} />
        <div>
          <h3>{course.title}</h3>
          <p className="course-card-description">{course.description || course.category || 'Keep going!'}</p>
        </div>
      </div>
      <ProgressBar value={course.done_count} max={course.question_count} label={`${course.title} progress`} showPercent />
      <div className="course-card-footer">
        <span className="course-card-current">
          <CirclePlay size={20} aria-hidden="true" />
          <span>
            Current topic
            <strong>{course.current_topic.title}</strong>
          </span>
        </span>
        <Link to={topicLink} className={`btn btn-small ${isFeatured ? 'btn-primary' : 'btn-secondary'}`}>
          {course.done_count ? 'Continue' : 'Start'} <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

function AchievementBadge({ achievement }) {
  const style = ACHIEVEMENT_STYLES[achievement.key] ?? ACHIEVEMENT_STYLES.first_step
  const Icon = achievement.earned ? style.icon : Lock
  return (
    <div className={`achievement ${achievement.earned ? '' : 'is-locked'}`}>
      <span className="achievement-medal" style={{ background: style.background }} aria-hidden="true">
        <Icon size={24} />
      </span>
      <strong>{achievement.title}</strong>
      <span>
        {achievement.earned ? achievement.description : `${achievement.current}/${achievement.goal} · ${achievement.description}`}
      </span>
      <span className="sr-only">{achievement.earned ? 'Earned' : 'Not earned yet'}</span>
    </div>
  )
}

function StudentDashboardPage() {
  const { user } = useAuth()
  const { data, error, isLoading, reload } = useApiData(getStudentDashboard)

  if (isLoading) {
    return <Loading message="Loading your dashboard..." />
  }
  if (error) {
    return <LoadError error={error} onRetry={reload} />
  }

  const { stats, topic_progress: topicProgress, recent_activity: recentActivity, achievements, recommended } = data
  const continueLearning = data.continue_learning
  const firstCourse = continueLearning[0]
  const continueLink = firstCourse ? `/student/topics/${firstCourse.current_topic.id}/questions` : '/student/courses'

  const progressSegments = [
    { key: 'completed', label: 'Completed', value: topicProgress.completed, color: 'var(--status-good)' },
    { key: 'in_progress', label: 'In progress', value: topicProgress.in_progress, color: 'var(--series-1)' },
    { key: 'not_started', label: 'Not started', value: topicProgress.not_started, color: 'var(--series-other)' },
  ]

  return (
    <>
      <div className="dashboard-grid">
        <div className="dashboard-column">
          <section className="hero-banner">
            <div className="hero-art">
              <MountainScene variant="dawn" />
            </div>
            <p className="hero-quote">“{getQuoteOfTheDay()}”</p>
            <div className="hero-content">
              <p className="hero-eyebrow">Welcome back, {user.first_name || user.username}</p>
              <h1 className="hero-title">
                Learn <span className="text-gradient">Without Limits</span>
              </h1>
              <p className="hero-text">Explore. Practice. Improve. Your learning journey continues here.</p>
              <Link to={continueLink} className="btn btn-primary btn-large">
                Continue Learning <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </section>

          <div className="stat-tiles">
            <StatTile icon={BookOpen} tone="blue" value={stats.started_courses} label="Courses started" />
            <StatTile icon={CircleCheck} tone="green" value={`${stats.topics_completed}/${stats.topic_count}`} label="Topics completed" />
            <StatTile icon={PencilLine} tone="violet" value={stats.questions_solved} label="Questions solved" />
            <StatTile icon={ChartColumn} tone="amber" value={`${stats.overall_progress}%`} label="Overall progress" />
          </div>

          <Panel title="Continue Learning" action={<PanelLink to="/student/courses">View all</PanelLink>}>
            {continueLearning.length === 0 ? (
              <p className="muted">No courses are available yet. Please check back later.</p>
            ) : (
              <div className="course-cards">
                {continueLearning.map((course, index) => (
                  <ContinueCard key={course.id} course={course} isFeatured={index === 0} />
                ))}
              </div>
            )}
          </Panel>
        </div>

        <aside className="dashboard-column dashboard-side" aria-label="Calendar and tasks">
          <LeaderboardPanel />
          <Panel>
            <ActivityCalendar />
          </Panel>
          <TasksWidget title="Today's Tasks" placeholder="Add a task, e.g. Solve 5 questions" />
        </aside>
      </div>

      <div className="dashboard-row dashboard-row-1-1-1">
        <Panel title="My Progress" subtitle="Topics by status" action={<PanelLink to="/student/progress">View details</PanelLink>}>
          <div className="donut-with-legend">
            <DonutChart
              segments={progressSegments}
              centerValue={`${stats.overall_progress}%`}
              centerLabel="Overall progress"
              ariaLabel="Topics completed, in progress and not started"
            />
            <ChartLegend vertical items={progressSegments.map((segment) => ({ ...segment, value: segment.value }))} />
          </div>
        </Panel>

        <Panel title="Recent Activity" action={<PanelLink to="/student/practice">Practice</PanelLink>}>
          {recentActivity.length === 0 ? (
            <p className="muted">Your activity appears here when you mark questions as done or ask doubts.</p>
          ) : (
            <ul className="activity-list">
              {recentActivity.map((event) => {
                const style = ACTIVITY_STYLES[event.type] ?? ACTIVITY_STYLES.done
                const Icon = style.icon
                return (
                  <li key={`${event.type}-${event.time}-${event.message}`}>
                    <Link to={event.link} className="activity-item">
                      <span className={`activity-icon ${style.tone}`} aria-hidden="true">
                        <Icon size={17} />
                      </span>
                      <span className="activity-text">
                        {event.message}
                        <span className="activity-time">{timeAgo(event.time)}</span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Achievements">
          <div className="achievement-grid">
            {achievements.map((achievement) => (
              <AchievementBadge key={achievement.key} achievement={achievement} />
            ))}
          </div>
        </Panel>
      </div>

      <div className="dashboard-row dashboard-row-2-1">
        <Panel title="Recommended for You" subtitle="Courses you have not started yet" action={<PanelLink to="/student/courses">View all</PanelLink>}>
          {recommended.length === 0 ? (
            <p className="muted">You have started every course. Great work!</p>
          ) : (
            <div className="recommend-grid">
              {recommended.map((course) => (
                <Link key={course.id} to={`/student/courses/${course.id}`} className="recommend-card">
                  <div className="recommend-card-top">
                    <CourseIcon course={course} size={40} />
                    <div>
                      <strong>{course.title}</strong>
                      <small>{course.category || 'General'}</small>
                    </div>
                  </div>
                  <div className="recommend-card-footer">
                    <StatusBadge status={course.level} />
                    <span>{pluralize(course.topic_count, 'topic')}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Panel>

        <section className="promo-banner">
          <MountainScene variant="night" stars />
          <h2>Upgrade your skills</h2>
          <p>Build a brighter future, one topic at a time.</p>
          <Link to="/student/courses" className="btn btn-primary">
            Explore courses <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      </div>
    </>
  )
}

export default StudentDashboardPage

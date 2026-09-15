import { ArrowRight, Award } from 'lucide-react'
import { useCallback } from 'react'
import { Link } from 'react-router'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import Panel from '../../components/Panel'
import ProgressBar from '../../components/ProgressBar'
import { useApiData } from '../../hooks/useApiData'
import { getMyCertificates, getMyOverview } from '../../services/progressService'
import { formatDate, pluralize } from '../../utils/format'

// Certificates earned by finishing every question of a course, and courses still in progress.
function CertificatesPage() {
  const loadData = useCallback(async () => {
    const [certificates, overview] = await Promise.all([getMyCertificates(), getMyOverview()])
    return { certificates, overview }
  }, [])
  const { data, error, isLoading, reload } = useApiData(loadData)

  if (isLoading) {
    return <Loading message="Loading certificates..." />
  }
  if (error) {
    return <LoadError error={error} onRetry={reload} />
  }

  const earnedCourseIds = new Set(data.certificates.map((certificate) => certificate.course_id))
  const inProgress = data.overview.courses.filter((course) => !earnedCourseIds.has(course.id))

  return (
    <>
      <PageHeader title="Certificates" subtitle="Finish every practice question of a course to earn its certificate." />

      <div className="stacked">
        <Panel title="Earned certificates">
          {data.certificates.length === 0 ? (
            <p className="muted">No certificates yet. Keep going: every question brings you closer!</p>
          ) : (
            <div className="earned-grid">
              {data.certificates.map((certificate) => (
                <article key={certificate.course_id} className="earned-card">
                  <span className="certificate-seal" aria-hidden="true">
                    <Award size={26} />
                  </span>
                  <h3>{certificate.course_title}</h3>
                  <span className="muted">Completed {formatDate(certificate.completed_at)}</span>
                  <span className="cell-sub">Certificate ID {certificate.certificate_id}</span>
                  <Link to={`/student/certificates/${certificate.course_id}`} className="btn btn-primary btn-small" style={{ alignSelf: 'flex-start' }}>
                    View &amp; print <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </Panel>

        {inProgress.length > 0 && (
          <Panel title="In progress">
            <ul className="progress-rows">
              {inProgress.map((course) => (
                <li key={course.id}>
                  <strong style={{ flex: 1, minWidth: 160 }}>{course.title}</strong>
                  <ProgressBar value={course.done_count} max={course.question_count} label={`${course.title} progress`} showPercent />
                  <span className="card-meta">{pluralize(course.question_count - course.done_count, 'question')} to go</span>
                  <Link to={`/student/courses/${course.id}/questions`} className="btn btn-secondary btn-small">
                    Practise
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>
    </>
  )
}

export default CertificatesPage

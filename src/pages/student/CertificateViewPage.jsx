import { Award, Printer } from 'lucide-react'
import { useParams } from 'react-router'
import Alert from '../../components/Alert'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import { useApiData } from '../../hooks/useApiData'
import { getMyCertificates } from '../../services/progressService'
import { BRAND } from '../../utils/brand'
import { formatDate, pluralize } from '../../utils/format'
import { getLevelLabel } from '../../utils/levels'

// One certificate, ready to print or save as PDF (the browser's print dialog can save a PDF).
function CertificateViewPage() {
  const { courseId } = useParams()
  const { data: certificates, error, isLoading, reload } = useApiData(getMyCertificates)

  if (isLoading) {
    return <Loading message="Loading certificate..." />
  }
  if (error) {
    return <LoadError error={error} onRetry={reload} />
  }

  // Certificates come from Django, which only lists courses the student really finished.
  const certificate = certificates.find((item) => String(item.course_id) === courseId)

  if (!certificate) {
    return (
      <>
        <PageHeader title="Certificate" backTo="/student/certificates" backLabel="All certificates" />
        <Alert type="info">You have not earned this certificate yet. Finish every practice question of the course first.</Alert>
      </>
    )
  }

  return (
    <>
      <div className="no-print">
        <PageHeader title="Certificate" backTo="/student/certificates" backLabel="All certificates">
          <button type="button" className="btn btn-primary" onClick={() => window.print()}>
            <Printer size={16} aria-hidden="true" /> Print or save as PDF
          </button>
        </PageHeader>
      </div>

      <article className="certificate">
        <span className="certificate-seal" aria-hidden="true">
          <Award size={36} />
        </span>
        <p className="certificate-eyebrow">Certificate of completion</p>
        <p className="muted">This certifies that</p>
        <p className="certificate-name">{certificate.student_name}</p>
        <p className="muted">has completed every practice question of</p>
        <p className="certificate-course">{certificate.course_title}</p>
        <p className="muted">
          {pluralize(certificate.topic_count, 'topic')} · {pluralize(certificate.question_count, 'question')} · {getLevelLabel(certificate.level)}
        </p>

        <div className="certificate-footer">
          <div>
            <strong>{formatDate(certificate.completed_at)}</strong>
            Date completed
          </div>
          <div className="text-center">
            <strong>{BRAND.name}</strong>
            {BRAND.tagline}
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong>{certificate.certificate_id}</strong>
            Certificate ID
          </div>
        </div>
      </article>
    </>
  )
}

export default CertificateViewPage

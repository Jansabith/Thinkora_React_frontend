import { MessageCircle } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link } from 'react-router'
import Alert from '../../components/Alert'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import { useApiData } from '../../hooks/useApiData'
import { approveStudent, deleteStudent, getStudents, rejectStudent } from '../../services/adminService'
import { formatDate, getFullName } from '../../utils/format'

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
]

function StudentsPage() {
  const [status, setStatus] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState(null)
  const [busyStudentId, setBusyStudentId] = useState(null)

  const loadStudents = useCallback(() => getStudents({ status, search }), [status, search])
  const { data: students, error, isLoading, reload } = useApiData(loadStudents)

  function handleSearchSubmit(event) {
    event.preventDefault()
    setSearch(searchInput.trim())
  }

  // Runs an action (approve, reject, delete) and shows the result.
  async function runAction(student, action, successText) {
    setMessage(null)
    setBusyStudentId(student.id)
    try {
      await action(student.id)
      setMessage({ type: 'success', text: successText })
      reload()
    } catch (actionError) {
      setMessage({ type: 'error', text: actionError.message })
    } finally {
      setBusyStudentId(null)
    }
  }

  function handleReject(student) {
    const isApproved = student.access_status === 'approved'
    const question = isApproved
      ? `Remove access for ${getFullName(student)}? They will be logged out.`
      : `Reject ${getFullName(student)}?`
    if (window.confirm(question)) {
      runAction(student, rejectStudent, `${getFullName(student)} no longer has access.`)
    }
  }

  function handleDelete(student) {
    if (window.confirm(`Delete the account of ${getFullName(student)}? This cannot be undone.`)) {
      runAction(student, deleteStudent, `${getFullName(student)} was deleted.`)
    }
  }

  return (
    <>
      <PageHeader title="Students" subtitle="Everyone who has requested access. Open a student to see their progress, doubts and account." backTo="/admin" backLabel="Dashboard" />

      <div className="toolbar">
        <div className="filter-tabs" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`filter-tab ${status === filter.value ? 'active' : ''}`}
              aria-pressed={status === filter.value}
              onClick={() => setStatus(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <form className="search-form" onSubmit={handleSearchSubmit} role="search">
          <input
            type="search"
            placeholder="Search name, username or email"
            aria-label="Search students"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>
      </div>

      {message && <Alert type={message.type}>{message.text}</Alert>}
      {isLoading && <Loading message="Loading students..." />}
      {error && <LoadError error={error} onRetry={reload} />}

      {students && students.length === 0 && <p className="empty-state">No students match these filters.</p>}

      {students && students.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>WhatsApp</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Last login</th>
                <th>Reviewed by</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const isBusy = busyStudentId === student.id
                return (
                  <tr key={student.id}>
                    <td>
                      <Link to={`/admin/students/${student.id}`}>
                        <strong>{getFullName(student)}</strong>
                      </Link>
                      <span className="cell-sub">@{student.username}</span>
                      {student.request_message && <span className="cell-sub">“{student.request_message}”</span>}
                    </td>
                    <td>{student.email}</td>
                    <td>
                      {student.whatsapp_number ? (
                        <a
                          href={`https://api.whatsapp.com/send/?phone=${student.whatsapp_number.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={student.whatsapp_number}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)' }}
                        >
                          <MessageCircle size={15} aria-hidden="true" />
                          {student.whatsapp_number}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <StatusBadge status={student.access_status} />
                    </td>
                    <td>{formatDate(student.date_joined)}</td>
                    <td>{formatDate(student.last_login)}</td>
                    <td>{student.reviewed_by ?? '—'}</td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/admin/students/${student.id}`} className="btn btn-primary btn-small">
                          Open
                        </Link>
                        {student.access_status !== 'approved' && (
                          <button
                            type="button"
                            className="btn btn-success btn-small"
                            disabled={isBusy}
                            onClick={() => runAction(student, approveStudent, `${getFullName(student)} was approved.`)}
                          >
                            Approve
                          </button>
                        )}
                        {student.access_status !== 'rejected' && (
                          <button type="button" className="btn btn-danger btn-small" disabled={isBusy} onClick={() => handleReject(student)}>
                            {student.access_status === 'approved' ? 'Remove access' : 'Reject'}
                          </button>
                        )}
                        <button type="button" className="btn btn-danger btn-small" disabled={isBusy} onClick={() => handleDelete(student)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default StudentsPage

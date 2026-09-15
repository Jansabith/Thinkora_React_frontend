import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import Alert from '../../components/Alert'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import { useApiData } from '../../hooks/useApiData'
import { deleteAdmin, getAdmins, updateAdmin } from '../../services/adminService'
import { formatDate, getFullName } from '../../utils/format'

// Main Admin: see all admins, change their rights, disable or delete them.
function ManageAdminsPage() {
  const location = useLocation()
  const { data: admins, error, isLoading, reload } = useApiData(getAdmins)
  // A message can arrive from the Create Admin page.
  const [message, setMessage] = useState(() =>
    location.state?.message ? { type: 'success', text: location.state.message } : null,
  )
  const [busyAdminId, setBusyAdminId] = useState(null)

  async function saveChange(admin, changes, successText) {
    setMessage(null)
    setBusyAdminId(admin.id)
    try {
      await updateAdmin(admin.id, changes)
      setMessage({ type: 'success', text: successText })
      reload()
    } catch (saveError) {
      setMessage({ type: 'error', text: saveError.message })
    } finally {
      setBusyAdminId(null)
    }
  }

  function handleToggleActive(admin) {
    if (admin.is_active && !window.confirm(`Disable ${getFullName(admin)}? They will be logged out immediately.`)) {
      return
    }
    const text = admin.is_active ? `${getFullName(admin)} was disabled.` : `${getFullName(admin)} was enabled.`
    saveChange(admin, { is_active: !admin.is_active }, text)
  }

  async function handleDelete(admin) {
    if (!window.confirm(`Delete the admin account of ${getFullName(admin)}? This cannot be undone.`)) {
      return
    }
    setMessage(null)
    setBusyAdminId(admin.id)
    try {
      await deleteAdmin(admin.id)
      setMessage({ type: 'success', text: `${getFullName(admin)} was deleted.` })
      reload()
    } catch (deleteError) {
      setMessage({ type: 'error', text: deleteError.message })
    } finally {
      setBusyAdminId(null)
    }
  }

  return (
    <>
      <PageHeader title="Admins" subtitle="Give admins access to student management and content management." backTo="/admin" backLabel="Dashboard">
        <Link to="/main-admin/admins/new" className="btn btn-primary">
          + Create admin
        </Link>
      </PageHeader>

      {message && <Alert type={message.type}>{message.text}</Alert>}
      {isLoading && <Loading message="Loading admins..." />}
      {error && <LoadError error={error} onRetry={reload} />}

      {admins && admins.length === 0 && <p className="empty-state">No admins yet. Create the first admin account.</p>}

      {admins && admins.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Admin</th>
                <th>Status</th>
                <th>Manage students</th>
                <th>Manage content</th>
                <th>Last login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => {
                const isBusy = busyAdminId === admin.id
                return (
                  <tr key={admin.id}>
                    <td>
                      <strong>{getFullName(admin)}</strong>
                      <span className="cell-sub">
                        @{admin.username} · {admin.email}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={admin.is_active ? 'active' : 'disabled'} />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={admin.can_manage_students}
                        disabled={isBusy}
                        aria-label={`${getFullName(admin)} can manage students`}
                        onChange={() =>
                          saveChange(admin, { can_manage_students: !admin.can_manage_students }, `Rights updated for ${getFullName(admin)}.`)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={admin.can_manage_content}
                        disabled={isBusy}
                        aria-label={`${getFullName(admin)} can manage content`}
                        onChange={() =>
                          saveChange(admin, { can_manage_content: !admin.can_manage_content }, `Rights updated for ${getFullName(admin)}.`)
                        }
                      />
                    </td>
                    <td>{formatDate(admin.last_login)}</td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="btn btn-secondary btn-small" disabled={isBusy} onClick={() => handleToggleActive(admin)}>
                          {admin.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button type="button" className="btn btn-danger btn-small" disabled={isBusy} onClick={() => handleDelete(admin)}>
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

export default ManageAdminsPage

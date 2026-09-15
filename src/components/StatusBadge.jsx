const LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  published: 'Published',
  draft: 'Draft',
  active: 'Active',
  disabled: 'Disabled',
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  done: 'Done',
  open: 'Open doubt',
  resolved: 'Doubt answered',
  shared: 'Answer shown',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  new: 'New',
}

function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{LABELS[status] ?? status}</span>
}

export default StatusBadge

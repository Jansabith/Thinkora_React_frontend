import { useCallback, useState } from 'react'
import FilterTabs from '../../components/FilterTabs'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import ProgressRecordList from '../../components/ProgressRecordList'
import { useApiData } from '../../hooks/useApiData'
import { getProgressRecords } from '../../services/progressService'

const FILTERS = [
  { value: 'open', label: 'Open doubts' },
  { value: 'resolved', label: 'Answered doubts' },
  { value: 'doubts', label: 'All doubts' },
  { value: 'done', label: 'Done questions' },
]

const EMPTY_TEXT = {
  open: 'No open doubts. Everyone is on track!',
  resolved: 'No answered doubts yet.',
  doubts: 'No student has asked a doubt yet.',
  done: 'No student has marked a question as done yet.',
}

// Admin: doubts and activity from ALL students, newest first.
function DoubtsPage() {
  const [status, setStatus] = useState('open')
  const loadRecords = useCallback(() => getProgressRecords({ status }), [status])
  const { data: records, error, isLoading, reload } = useApiData(loadRecords)

  return (
    <>
      <PageHeader
        title="Doubts & activity"
        subtitle="See which student finished or asked about which question. Reply to a doubt to answer it."
        backTo="/admin"
        backLabel="Dashboard"
      />

      <FilterTabs options={FILTERS} value={status} onChange={setStatus} label="Filter doubts and activity" />

      {isLoading && <Loading message="Loading..." />}
      {error && <LoadError error={error} onRetry={reload} />}
      {records && <ProgressRecordList records={records} showStudent onChanged={reload} emptyText={EMPTY_TEXT[status]} />}
    </>
  )
}

export default DoubtsPage

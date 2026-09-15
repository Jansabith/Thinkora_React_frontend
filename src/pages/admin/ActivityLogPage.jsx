import { useCallback, useState } from 'react'
import ActivityFeed from '../../components/ActivityFeed'
import FilterTabs from '../../components/FilterTabs'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import Panel from '../../components/Panel'
import { useApiData } from '../../hooks/useApiData'
import { getActivityLog } from '../../services/dashboardService'

const KIND_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'student', label: 'Students' },
  { value: 'content', label: 'Content' },
  { value: 'doubt', label: 'Doubts' },
  { value: 'admin', label: 'Admins' },
]

const EMPTY_PAGE = { count: 0, results: [], next: null }

// Admin: the full history of who changed what, newest first.
function ActivityLogPage() {
  const [kind, setKind] = useState('')
  const [pageCount, setPageCount] = useState(1)

  const loadLogs = useCallback(async () => {
    const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1)
    const pages = await Promise.all(
      pageNumbers.map((page) =>
        getActivityLog({ kind, page }).catch((pageError) => {
          if (pageError.status === 404) {
            return EMPTY_PAGE
          }
          throw pageError
        }),
      ),
    )
    return { results: pages.flatMap((page) => page.results), hasMore: Boolean(pages[pages.length - 1].next) }
  }, [kind, pageCount])

  const { data, error, isLoading, reload } = useApiData(loadLogs, { keepPreviousData: true })

  return (
    <>
      <PageHeader title="Activity Log" subtitle="Who changed what, newest first." backTo="/admin" backLabel="Dashboard" />

      <FilterTabs
        options={KIND_OPTIONS}
        value={kind}
        onChange={(value) => {
          setKind(value)
          setPageCount(1)
        }}
        label="Filter activity"
      />

      {isLoading && !data && <Loading message="Loading activity..." />}
      {error && <LoadError error={error} onRetry={reload} />}

      {data && (
        <Panel className={isLoading ? 'chart-refreshing' : ''}>
          <ActivityFeed logs={data.results} emptyText="Nothing has happened here yet." />
          {data.hasMore && (
            <div className="load-more">
              <button type="button" className="btn btn-secondary" onClick={() => setPageCount((count) => count + 1)} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Load older activity'}
              </button>
            </div>
          )}
        </Panel>
      )}
    </>
  )
}

export default ActivityLogPage

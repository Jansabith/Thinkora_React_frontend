import { useCallback, useEffect, useState } from 'react'

// Loads data from the API when a page opens, and tracks loading and error state.
//
//   const { data, error, isLoading, reload } = useApiData(getCourses)
//
// If loadData uses page values (like courseId), wrap it in useCallback,
// so it only changes when those values change.
//
// keepPreviousData: true -> while new data loads (for example after changing a filter),
// keep showing the old data instead of an empty page. Charts and lists stay steady.
export function useApiData(loadData, { keepPreviousData = false } = {}) {
  // 'loader' remembers which loadData function produced this result.
  const [result, setResult] = useState({ loader: null, data: null, error: null })
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    // 'ignore' stops an old, slow request from overwriting newer data.
    let ignore = false

    loadData()
      .then((data) => {
        if (!ignore) {
          setResult({ loader: loadData, data, error: null })
        }
      })
      .catch((error) => {
        if (!ignore) {
          setResult((previous) => ({ loader: loadData, data: previous.data, error }))
        }
      })

    return () => {
      ignore = true
    }
  }, [loadData, reloadCount])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])

  // While the result belongs to an older loadData (for example a different courseId), we are loading.
  const isCurrent = result.loader === loadData

  return {
    data: isCurrent || keepPreviousData ? result.data : null,
    error: isCurrent ? result.error : null,
    isLoading: !isCurrent,
    reload,
  }
}

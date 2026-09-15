import { Layers } from 'lucide-react'
import { Link } from 'react-router'
import { useState, useEffect } from 'react'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import PracticeQuestionCard from '../../components/PracticeQuestionCard'
import { useApiData } from '../../hooks/useApiData'
import { getAssignedQuestions } from '../../services/questionService'
import { formatDate } from '../../utils/format'

function TeacherAssignedPage() {
  const { data: assignments, error, isLoading, reload } = useApiData(getAssignedQuestions)
  const [progressChanges, setProgressChanges] = useState({})

  // When new assignments load, initialize progress state
  useEffect(() => {
    if (assignments) {
      const initialProgress = {}
      assignments.forEach(a => {
        if (a.progress) {
          initialProgress[a.question.id] = a.progress
        }
      })
      setProgressChanges(initialProgress)
    }
  }, [assignments])

  function handleProgressChange(updatedProgress) {
    setProgressChanges(current => ({ ...current, [updatedProgress.question]: updatedProgress }))
  }

  if (isLoading) return <Loading message="Loading assigned questions..." />
  if (error) return <LoadError error={error} onRetry={reload} />

  return (
    <>
      <PageHeader title="Teacher Assigned" subtitle="Practice questions hand-picked for you." />
      
      {assignments?.length === 0 && (
        <div className="card empty-state">
          <h2>You're all caught up!</h2>
          <p className="muted">Your teachers haven't assigned you any specific questions yet.</p>
        </div>
      )}

      {assignments?.length > 0 && (
        <div className="questions-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {assignments.map((assignment, index) => {
            const q = assignment.question
            return (
              <div key={assignment.id}>
                <PracticeQuestionCard
                  question={q}
                  number={index + 1}
                  progress={progressChanges[q.id]}
                  onProgressChange={handleProgressChange}
                >
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem' }} className="muted">
                    Assigned by <strong>{assignment.assigned_by_name}</strong> on {formatDate(assignment.assigned_at)}
                  </div>
                </PracticeQuestionCard>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

export default TeacherAssignedPage

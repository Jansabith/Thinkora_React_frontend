import { Check, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useApiData } from '../hooks/useApiData'
import { getErrorText } from '../services/api'
import { createTask, deleteTask, getTasks, updateTask } from '../services/taskService'
import Alert from './Alert'
import Loading from './Loading'
import Panel from './Panel'

function describeDueDate(dueDate) {
  if (!dueDate) {
    return null
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(`${dueDate}T00:00:00`)
  const days = Math.round((due - today) / 86400000)
  if (days === 0) {
    return { text: 'Today', isOverdue: false }
  }
  if (days === 1) {
    return { text: 'Tomorrow', isOverdue: false }
  }
  if (days < 0) {
    return { text: days === -1 ? 'Yesterday' : `${-days} days late`, isOverdue: true }
  }
  return { text: due.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), isOverdue: false }
}

// A personal to-do list saved in Django, so it is the same on every device.
function TasksWidget({ title = "Today's Tasks", placeholder = 'Add a task...' }) {
  const { data, error, isLoading, reload } = useApiData(getTasks, { keepPreviousData: true })
  // Changes shown immediately, before Django answers ("optimistic" updates).
  const [overrides, setOverrides] = useState({})
  const [newTitle, setNewTitle] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [showCompleted, setShowCompleted] = useState(false)
  const [actionError, setActionError] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const tasks = (data ?? []).map((task) => ({ ...task, ...overrides[task.id] })).filter((task) => !task.isDeleted)
  const openTasks = tasks.filter((task) => !task.is_done)
  const doneTasks = tasks.filter((task) => task.is_done)
  const visibleTasks = showCompleted ? [...openTasks, ...doneTasks] : openTasks

  function setOverride(taskId, change) {
    setOverrides((current) => ({ ...current, [taskId]: { ...current[taskId], ...change } }))
  }

  async function handleToggle(task) {
    const isDone = !task.is_done
    setActionError('')
    setOverride(task.id, { is_done: isDone })
    try {
      await updateTask(task.id, { is_done: isDone })
      reload()
    } catch (toggleError) {
      setOverride(task.id, { is_done: !isDone })
      setActionError(toggleError.message)
    }
  }

  async function handleDelete(task) {
    setActionError('')
    setOverride(task.id, { isDeleted: true })
    try {
      await deleteTask(task.id)
      reload()
    } catch (deleteError) {
      setOverride(task.id, { isDeleted: false })
      setActionError(deleteError.message)
    }
  }

  async function handleAdd(event) {
    event.preventDefault()
    const title = newTitle.trim()
    if (!title) {
      return
    }
    setActionError('')
    setIsAdding(true)
    try {
      await createTask({ title, due_date: newDueDate || null })
      setNewTitle('')
      setNewDueDate('')
      reload()
    } catch (addError) {
      setActionError(getErrorText(addError.data) ?? addError.message)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Panel
      title={title}
      action={
        doneTasks.length > 0 && (
          <button type="button" className="panel-link btn-ghost" style={{ border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => setShowCompleted((shown) => !shown)}>
            {showCompleted ? 'Hide completed' : `Show completed (${doneTasks.length})`}
          </button>
        )
      }
    >
      {isLoading && !data && <Loading message="Loading tasks..." />}
      {error && <Alert type="error">{error.message}</Alert>}
      <Alert type="error">{actionError}</Alert>

      {data && visibleTasks.length === 0 && (
        <p className="muted">{doneTasks.length ? 'Everything is done. Nice work!' : 'No tasks yet. Add your first one below.'}</p>
      )}

      <ul className="task-list">
        {visibleTasks.map((task) => {
          const due = describeDueDate(task.due_date)
          return (
            <li key={task.id} className={`task-item ${task.is_done ? 'is-done' : ''}`}>
              <button
                type="button"
                role="checkbox"
                aria-checked={task.is_done}
                aria-label={`Mark "${task.title}" as ${task.is_done ? 'not done' : 'done'}`}
                className="task-check"
                onClick={() => handleToggle(task)}
              >
                {task.is_done && <Check size={14} strokeWidth={3} />}
              </button>
              <span className="task-title">{task.title}</span>
              {due && !task.is_done && <span className={`task-due ${due.isOverdue ? 'is-overdue' : ''}`}>{due.text}</span>}
              <button
                type="button"
                className="icon-button icon-button-small task-delete"
                onClick={() => handleDelete(task)}
                aria-label={`Delete "${task.title}"`}
              >
                <Trash2 size={14} />
              </button>
            </li>
          )
        })}
      </ul>

      <form className="task-add" onSubmit={handleAdd}>
        <input
          type="text"
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          placeholder={placeholder}
          aria-label="New task"
          maxLength={200}
        />
        <input type="date" value={newDueDate} onChange={(event) => setNewDueDate(event.target.value)} aria-label="Due date (optional)" />
        <button type="submit" className="btn btn-primary btn-small" disabled={isAdding || !newTitle.trim()} aria-label="Add task">
          <Plus size={16} /> Add
        </button>
      </form>
    </Panel>
  )
}

export default TasksWidget

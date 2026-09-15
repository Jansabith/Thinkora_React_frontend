import { BookOpen, Layers, ListChecks, Search, User } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useClickOutside } from '../hooks/useClickOutside'
import { searchEverything } from '../services/dashboardService'

const MIN_LENGTH = 2
const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.userAgent)

// Turns Django's grouped results into one list of clickable items with the right page for each role.
function buildItems(results, isStudent) {
  const items = []
  for (const course of results.courses) {
    items.push({
      group: 'Courses',
      icon: BookOpen,
      title: course.title,
      subtitle: course.category || 'Course',
      to: isStudent ? `/student/courses/${course.id}` : `/admin/courses/${course.id}`,
    })
  }
  for (const topic of results.topics) {
    items.push({
      group: 'Topics',
      icon: Layers,
      title: topic.title,
      subtitle: topic.course_title,
      to: isStudent ? `/student/topics/${topic.id}/questions` : `/admin/topics/${topic.id}/questions`,
    })
  }
  for (const question of results.questions) {
    items.push({
      group: 'Questions',
      icon: ListChecks,
      title: question.text,
      subtitle: `${question.course_title} › ${question.topic_title}`,
      to: isStudent ? `/student/topics/${question.topic_id}/questions` : `/admin/topics/${question.topic_id}/questions`,
    })
  }
  for (const student of results.students) {
    items.push({
      group: 'Students',
      icon: User,
      title: student.name,
      subtitle: `@${student.username}`,
      to: `/admin/students/${student.id}`,
    })
  }
  return items
}

// The search box in the top bar. Ctrl+K (or ⌘K on a Mac) jumps into it from anywhere.
function SearchBox() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const close = useCallback(() => setIsOpen(false), [])
  const containerRef = useClickOutside(isOpen, close)
  const isStudent = user.role === 'student'

  useEffect(() => {
    function handleShortcut(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  // Search 250 ms after the user stops typing, so we do not send a request for every letter.
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < MIN_LENGTH) {
      return undefined
    }
    let ignore = false
    const timer = setTimeout(() => {
      searchEverything(trimmed)
        .then((data) => {
          if (!ignore) {
            setResults({ query: trimmed, data })
            setActiveIndex(0)
          }
        })
        .catch(() => {
          if (!ignore) {
            setResults({ query: trimmed, data: { courses: [], topics: [], questions: [], students: [] } })
          }
        })
    }, 250)
    return () => {
      ignore = true
      clearTimeout(timer)
    }
  }, [query])

  const trimmedQuery = query.trim()
  const hasCurrentResults = results?.query === trimmedQuery
  const items = hasCurrentResults ? buildItems(results.data, isStudent) : []
  const showPanel = isOpen && trimmedQuery.length >= MIN_LENGTH

  function goTo(item) {
    navigate(item.to)
    setIsOpen(false)
    setQuery('')
    inputRef.current?.blur()
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, items.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter' && items[activeIndex]) {
      event.preventDefault()
      goTo(items[activeIndex])
    }
  }

  return (
    <div className="search-box" ref={containerRef}>
      <div className="search-box-input">
        <Search size={18} aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label="Search"
          aria-expanded={showPanel}
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-activedescendant={showPanel && items[activeIndex] ? `search-item-${activeIndex}` : undefined}
          placeholder={isStudent ? 'Search courses, topics, or questions...' : 'Search students, courses, topics, questions...'}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        <kbd className="search-kbd">{IS_MAC ? '⌘K' : 'Ctrl K'}</kbd>
      </div>

      {showPanel && (
        <div className="search-results" id="search-results" role="listbox">
          {items.length === 0 && <p className="search-empty">{hasCurrentResults ? 'No results found.' : 'Searching...'}</p>}
          {items.map((item, index) => {
            const Icon = item.icon
            const isNewGroup = index === 0 || items[index - 1].group !== item.group
            return (
              <div key={`${item.group}-${item.to}-${item.title}`}>
                {isNewGroup && <p className="search-group-label">{item.group}</p>}
                <button
                  type="button"
                  id={`search-item-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`search-result ${index === activeIndex ? 'is-active' : ''}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => goTo(item)}
                >
                  <span className="search-result-icon" aria-hidden="true">
                    <Icon size={16} />
                  </span>
                  <span className="search-result-text">
                    <span className="search-result-title">{item.title}</span>
                    <span className="search-result-sub">{item.subtitle}</span>
                  </span>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SearchBox

import { createElement } from 'react'
import { getCourseGradient, getCourseIcon } from '../utils/courseVisuals'

// A coloured square with an icon that matches the course's category.
function CourseIcon({ course, size = 48 }) {
  return (
    <span className="course-icon" style={{ width: size, height: size, background: getCourseGradient(course) }} aria-hidden="true">
      {createElement(getCourseIcon(course), { size: Math.round(size * 0.5), strokeWidth: 2 })}
    </span>
  )
}

export default CourseIcon

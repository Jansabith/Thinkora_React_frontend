import { BookOpen, CodeXml, Database, Globe, Palette, Server, Sparkles } from 'lucide-react'

// A course icon is chosen from words in its category or title (first match wins).
const ICON_RULES = [
  [/web|html|css|react|frontend|javascript/i, Globe],
  [/data|sql|database|analytics/i, Database],
  [/design|ui|ux|art/i, Palette],
  [/devops|cloud|server|linux|network/i, Server],
  [/\bai\b|machine learning|\bml\b/i, Sparkles],
  [/python|program|code|java|software|c\+\+/i, CodeXml],
]

const GRADIENTS = [
  'linear-gradient(135deg, #3b82f6, #6366f1)',
  'linear-gradient(135deg, #f97316, #e11d48)',
  'linear-gradient(135deg, #10b981, #0284c7)',
  'linear-gradient(135deg, #8b5cf6, #db2777)',
  'linear-gradient(135deg, #f59e0b, #ea580c)',
  'linear-gradient(135deg, #06b6d4, #4f46e5)',
]

export function getCourseIcon(course) {
  const text = `${course.category ?? ''} ${course.title ?? ''}`
  return ICON_RULES.find(([pattern]) => pattern.test(text))?.[1] ?? BookOpen
}

// The same course always gets the same colour.
export function getCourseGradient(course) {
  return GRADIENTS[(course.id ?? 0) % GRADIENTS.length]
}

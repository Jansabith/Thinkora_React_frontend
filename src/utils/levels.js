// Must match Course.Level in Django (backend/courses/models.py).
export const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export function getLevelLabel(value) {
  return LEVELS.find((level) => level.value === value)?.label ?? value
}

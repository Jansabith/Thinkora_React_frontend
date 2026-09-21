// Everything the round profile picture can look like.
// The keys here must match AVATAR_COLORS and AVATAR_ICONS in backend/users/models.py.

// Each colour is a gradient, so the avatar has a little depth instead of a flat disc.
export const AVATAR_COLORS = [
  { key: 'indigo', label: 'Indigo', background: 'linear-gradient(135deg, #4f6bf6 0%, #6d4df2 100%)' },
  { key: 'violet', label: 'Violet', background: 'linear-gradient(135deg, #8b5cf6 0%, #c026d3 100%)' },
  { key: 'teal', label: 'Teal', background: 'linear-gradient(135deg, #0ea5a4 0%, #0891b2 100%)' },
  { key: 'rose', label: 'Rose', background: 'linear-gradient(135deg, #f43f5e 0%, #be185d 100%)' },
  { key: 'amber', label: 'Amber', background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' },
  { key: 'emerald', label: 'Emerald', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' },
  { key: 'sky', label: 'Sky', background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)' },
  { key: 'slate', label: 'Slate', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)' },
]

// 'initials' is the default: the first letters of the person's name.
export const AVATAR_ICONS = [
  { key: 'initials', label: 'My initials', character: '' },
  { key: 'fox', label: 'Fox', character: '\u{1F98A}' },
  { key: 'panda', label: 'Panda', character: '\u{1F43C}' },
  { key: 'owl', label: 'Owl', character: '\u{1F989}' },
  { key: 'penguin', label: 'Penguin', character: '\u{1F427}' },
  { key: 'turtle', label: 'Turtle', character: '\u{1F422}' },
  { key: 'lion', label: 'Lion', character: '\u{1F981}' },
  { key: 'whale', label: 'Whale', character: '\u{1F433}' },
  { key: 'unicorn', label: 'Unicorn', character: '\u{1F984}' },
  { key: 'rocket', label: 'Rocket', character: '\u{1F680}' },
  { key: 'star', label: 'Star', character: '\u{2B50}' },
  { key: 'flame', label: 'Flame', character: '\u{1F525}' },
  { key: 'sprout', label: 'Sprout', character: '\u{1F331}' },
]

// Someone who never picked a colour still gets a stable one, made from their name.
export function getAutomaticColor(name = '') {
  const total = [...name].reduce((sum, character) => sum + character.charCodeAt(0), 0)
  return AVATAR_COLORS[total % AVATAR_COLORS.length]
}

export function getAvatarBackground(colorKey, name) {
  return AVATAR_COLORS.find((color) => color.key === colorKey)?.background ?? getAutomaticColor(name).background
}

export function getAvatarCharacter(iconKey) {
  return AVATAR_ICONS.find((icon) => icon.key === iconKey)?.character ?? ''
}

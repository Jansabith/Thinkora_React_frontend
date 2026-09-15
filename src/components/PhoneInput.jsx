import { useEffect, useRef, useState } from 'react'

const COUNTRIES = [
  { code: '+971', name: 'United Arab Emirates', flag: 'AE' },
  { code: '+966', name: 'Saudi Arabia', flag: 'SA' },
  { code: '+974', name: 'Qatar', flag: 'QA' },
  { code: '+965', name: 'Kuwait', flag: 'KW' },
  { code: '+973', name: 'Bahrain', flag: 'BH' },
  { code: '+968', name: 'Oman', flag: 'OM' },
  { code: '+962', name: 'Jordan', flag: 'JO' },
  { code: '+961', name: 'Lebanon', flag: 'LB' },
  { code: '+20', name: 'Egypt', flag: 'EG' },
  { code: '+964', name: 'Iraq', flag: 'IQ' },
  { code: '+91', name: 'India', flag: 'IN' },
  { code: '+92', name: 'Pakistan', flag: 'PK' },
  { code: '+880', name: 'Bangladesh', flag: 'BD' },
  { code: '+94', name: 'Sri Lanka', flag: 'LK' },
  { code: '+977', name: 'Nepal', flag: 'NP' },
  { code: '+960', name: 'Maldives', flag: 'MV' },
  { code: '+63', name: 'Philippines', flag: 'PH' },
  { code: '+62', name: 'Indonesia', flag: 'ID' },
  { code: '+60', name: 'Malaysia', flag: 'MY' },
  { code: '+65', name: 'Singapore', flag: 'SG' },
  { code: '+66', name: 'Thailand', flag: 'TH' },
  { code: '+84', name: 'Vietnam', flag: 'VN' },
  { code: '+95', name: 'Myanmar', flag: 'MM' },
  { code: '+1', name: 'USA / Canada', flag: 'US' },
  { code: '+44', name: 'United Kingdom', flag: 'GB' },
  { code: '+61', name: 'Australia', flag: 'AU' },
  { code: '+64', name: 'New Zealand', flag: 'NZ' },
  { code: '+55', name: 'Brazil', flag: 'BR' },
  { code: '+52', name: 'Mexico', flag: 'MX' },
  { code: '+54', name: 'Argentina', flag: 'AR' },
  { code: '+57', name: 'Colombia', flag: 'CO' },
  { code: '+49', name: 'Germany', flag: 'DE' },
  { code: '+33', name: 'France', flag: 'FR' },
  { code: '+39', name: 'Italy', flag: 'IT' },
  { code: '+34', name: 'Spain', flag: 'ES' },
  { code: '+31', name: 'Netherlands', flag: 'NL' },
  { code: '+32', name: 'Belgium', flag: 'BE' },
  { code: '+41', name: 'Switzerland', flag: 'CH' },
  { code: '+43', name: 'Austria', flag: 'AT' },
  { code: '+351', name: 'Portugal', flag: 'PT' },
  { code: '+46', name: 'Sweden', flag: 'SE' },
  { code: '+47', name: 'Norway', flag: 'NO' },
  { code: '+45', name: 'Denmark', flag: 'DK' },
  { code: '+358', name: 'Finland', flag: 'FI' },
  { code: '+48', name: 'Poland', flag: 'PL' },
  { code: '+90', name: 'Turkey', flag: 'TR' },
  { code: '+7', name: 'Russia', flag: 'RU' },
  { code: '+380', name: 'Ukraine', flag: 'UA' },
  { code: '+98', name: 'Iran', flag: 'IR' },
  { code: '+86', name: 'China', flag: 'CN' },
  { code: '+81', name: 'Japan', flag: 'JP' },
  { code: '+82', name: 'South Korea', flag: 'KR' },
  { code: '+27', name: 'South Africa', flag: 'ZA' },
  { code: '+234', name: 'Nigeria', flag: 'NG' },
  { code: '+254', name: 'Kenya', flag: 'KE' },
  { code: '+256', name: 'Uganda', flag: 'UG' },
  { code: '+255', name: 'Tanzania', flag: 'TZ' },
  { code: '+233', name: 'Ghana', flag: 'GH' },
  { code: '+251', name: 'Ethiopia', flag: 'ET' },
]

// Convert 2-letter ISO code to flag emoji (works in all modern browsers)
function toFlag(iso) {
  return iso
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('')
}

const SORTED = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length)

function parseValue(value) {
  if (!value) return { country: COUNTRIES[0], number: '' }
  for (const c of SORTED) {
    if (value.startsWith(c.code)) return { country: c, number: value.slice(c.code.length) }
  }
  return { country: COUNTRIES[0], number: value }
}

function PhoneInput({ id, name, value, onChange, placeholder = '501234567' }) {
  const parsed = parseValue(value)
  const [selectedCountry, setSelectedCountry] = useState(parsed.country)
  const [number, setNumber] = useState(parsed.number)
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    const p = parseValue(value)
    setSelectedCountry(p.country)
    setNumber(p.number)
  }, [value])

  useEffect(() => {
    function onOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  useEffect(() => {
    if (isOpen) searchRef.current?.focus()
  }, [isOpen])

  function fireChange(country, num) {
    onChange({ target: { name, value: num ? country.code + num : '' } })
  }

  function handleSelect(country) {
    setSelectedCountry(country)
    setIsOpen(false)
    setSearch('')
    fireChange(country, number)
  }

  function handleNumberChange(e) {
    const digits = e.target.value.replace(/\D/g, '')
    setNumber(digits)
    fireChange(selectedCountry, digits)
  }

  function toggleOpen() {
    setIsOpen((prev) => {
      if (prev) setSearch('')
      return !prev
    })
  }

  const filtered = search.trim()
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.includes(search),
      )
    : COUNTRIES

  return (
    <div ref={wrapperRef} className="phone-input-wrapper">
      <button
        type="button"
        className="phone-code-btn"
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={selectedCountry.name}
      >
        <span className="phone-flag" aria-hidden="true">{toFlag(selectedCountry.flag)}</span>
        <span className="phone-code-text">{selectedCountry.code}</span>
        <span className="phone-chevron" aria-hidden="true">{isOpen ? '▴' : '▾'}</span>
      </button>

      {isOpen && (
        <div className="phone-dropdown" role="listbox" aria-label="Select country code">
          <input
            ref={searchRef}
            type="text"
            className="phone-search"
            placeholder="Search country or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search country"
          />
          <div className="phone-dropdown-list">
            {filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                role="option"
                aria-selected={c.code === selectedCountry.code}
                className={'phone-option' + (c.code === selectedCountry.code ? ' phone-option-active' : '')}
                onClick={() => handleSelect(c)}
              >
                <span className="phone-flag" aria-hidden="true">{toFlag(c.flag)}</span>
                <span className="phone-option-name">{c.name}</span>
                <span className="phone-option-code">{c.code}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="phone-empty">No country found</p>
            )}
          </div>
        </div>
      )}

      <input
        id={id}
        type="tel"
        className="phone-number-input"
        placeholder={placeholder}
        value={number}
        onChange={handleNumberChange}
        autoComplete="tel-national"
        inputMode="numeric"
      />
    </div>
  )
}

export default PhoneInput
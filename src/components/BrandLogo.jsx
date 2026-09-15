import { useId } from 'react'
import { Link } from 'react-router'
import { BRAND } from '../utils/brand'

// The logo: an open book with a bookmark, plus the name and tagline.
// tone: 'light' (white text, for dark backgrounds) or 'dark' (for light backgrounds)
function BrandLogo({ to = '/', tone = 'light', showTagline = true, onClick, withBackground = false, maxWidth = '240px' }) {
  const id = useId().replace(/:/g, '')

  const baseStyle = { display: withBackground ? 'inline-flex' : 'flex', alignItems: 'center', maxWidth: '100%', boxSizing: 'border-box' }
  const bgStyle = withBackground ? { backgroundColor: 'white', padding: '12px 16px', borderRadius: '8px' } : {}

  return (
    <Link to={to} className={`brand ${tone === 'dark' ? 'brand-dark' : ''}`} onClick={onClick} style={{ ...baseStyle, ...bgStyle }}>
      <img src="/thinkora%20image.webp" alt="Thinkora" style={{ width: '100%', maxWidth: maxWidth, height: 'auto', objectFit: 'contain' }} />
    </Link>
  )
}

export default BrandLogo

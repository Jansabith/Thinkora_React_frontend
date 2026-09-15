import { Link } from 'react-router'

function NotFoundPage() {
  return (
    <div className="card narrow text-center">
      <h1>Page not found</h1>
      <p className="muted">The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary">
        Go to the home page
      </Link>
    </div>
  )
}

export default NotFoundPage

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App.jsx'
import ViewTransitions from './components/ViewTransitions.jsx'
import { AuthProvider } from './context/AuthProvider.jsx'
import { SplashProvider } from './context/SplashProvider.jsx'
import { ThemeProvider } from './context/ThemeProvider.jsx'

// The app's styles, split by purpose. Order matters: tokens (colours, fonts) first.
import './styles/tokens.css'
import './styles/base.css'
import './styles/shell.css'
import './styles/pages.css'
import './styles/dashboard.css'
import './styles/charts.css'
import './styles/auth.css'
import './styles/splash.css'
import './styles/skeleton.css'
import './styles/transitions.css'
import './styles/print.css'

// BrowserRouter: lets React show different pages for different URLs.
// ThemeProvider: light / dark mode.
// AuthProvider:  shares "who is logged in" with every page.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <SplashProvider>
          <AuthProvider>
            <ViewTransitions>{(location) => <App location={location} />}</ViewTransitions>
          </AuthProvider>
        </SplashProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)

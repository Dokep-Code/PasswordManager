import ThemeToggle from './ThemeToggle.jsx'
import UserMenu from './UserMenu.jsx'

// Full-width bar at the top of every screen: logo, theme switch and,
// once someone is signed in, their account menu.
export default function Topbar({ user, onLogout }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <h1 className="brand">
          <svg className="logo" viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
            <rect width="32" height="32" rx="9" />
            <path d="M16 8a4.5 4.5 0 0 0-2.1 8.5L12.6 24h6.8l-1.3-7.5A4.5 4.5 0 0 0 16 8z" />
          </svg>
          Password Manager
        </h1>
        <ThemeToggle />
        {user && <UserMenu user={user} onLogout={onLogout} />}
      </div>
    </header>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { MoonIcon, SunIcon } from './icons.jsx'

const THEME_KEY = 'password-manager.theme'

// The inline script in index.html has already put the saved theme on <html>
// before the first paint, so start from whatever it chose.
function readTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(readTheme)

  // index.css switches all colours based on the data-theme attribute.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={label} title={label}>
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

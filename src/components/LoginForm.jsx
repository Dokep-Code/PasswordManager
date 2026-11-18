import { useCallback, useState } from 'react'
import { checkNewPassword, countLegacyEntries, hasAccounts, logIn, register } from '../utils/auth.js'
import { InfoIcon } from './icons.jsx'

// Log in, or create an account. With no accounts yet it starts on "Create account".
export default function LoginForm({ onLogin }) {
  const [mode, setMode] = useState(() => (hasAccounts() ? 'login' : 'register'))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const registering = mode === 'register'

  const handleUsernameChange = useCallback((event) => setUsername(event.target.value), [])
  const handlePasswordChange = useCallback((event) => setPassword(event.target.value), [])
  const handleConfirmChange = useCallback((event) => setConfirm(event.target.value), [])

  const switchMode = useCallback(() => {
    setMode((current) => (current === 'login' ? 'register' : 'login'))
    setPassword('')
    setConfirm('')
    setError('')
  }, [])

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      const name = username.trim()

      if (!name || !password) {
        setError('Enter a username and a password.')
        return
      }
      const problem = registering ? checkNewPassword(password, confirm) : ''
      if (problem) {
        setError(problem)
        return
      }

      setBusy(true)
      setError('')
      try {
        const user = registering ? await register(name, password) : await logIn(name, password)
        onLogin(user) // App swaps this form for the vault
      } catch (err) {
        setError(err.message)
        setBusy(false)
      }
    },
    [username, password, confirm, registering, onLogin],
  )

  // Only the first account takes over entries saved before logins existed.
  const legacyCount = registering && !hasAccounts() ? countLegacyEntries() : 0

  return (
    <form className="auth-card" onSubmit={handleSubmit} noValidate>
      <div className="auth-heading">
        <h2>{registering ? 'Create an account' : 'Welcome back'}</h2>
        <p className="note">
          {registering
            ? 'Your account is kept in this browser only.'
            : 'Log in to open your saved passwords.'}
        </p>
      </div>

      <label htmlFor="auth-username">
        Username
        <input
          id="auth-username"
          value={username}
          onChange={handleUsernameChange}
          autoComplete="username"
          maxLength={32}
          autoFocus
        />
      </label>

      <label htmlFor="auth-password">
        Master password
        <input
          id="auth-password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          autoComplete={registering ? 'new-password' : 'current-password'}
        />
      </label>

      {registering && (
        <label htmlFor="auth-confirm">
          Repeat master password
          <input
            id="auth-confirm"
            type="password"
            value={confirm}
            onChange={handleConfirmChange}
            autoComplete="new-password"
          />
        </label>
      )}

      {legacyCount > 0 && (
        <p className="auth-info">
          <InfoIcon />
          <span>
            The <strong>{legacyCount === 1 ? '1 password' : `${legacyCount} passwords`}</strong> already saved in this
            browser will move into this account.
          </span>
        </p>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy}>
        {busy ? 'Checking…' : registering ? 'Create account' : 'Log in'}
      </button>

      <p className="auth-switch">
        {registering ? 'Already have an account?' : 'No account yet?'}{' '}
        <button type="button" className="link-button" onClick={switchMode}>
          {registering ? 'Log in' : 'Create one'}
        </button>
      </p>
    </form>
  )
}

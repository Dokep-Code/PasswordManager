import { useCallback, useState } from 'react'
import { generatePassword } from '../utils/generatePassword.js'

const EMPTY_ENTRY = { site: '', username: '', password: '' }

// Form used both for adding a new entry and for editing an existing one.
// The parent passes callbacks (onSubmit, onCancel) and decides what they do.
export default function EntryForm({ initialValues = EMPTY_ENTRY, editing = false, onSubmit, onCancel }) {
  const [site, setSite] = useState(initialValues.site)
  const [username, setUsername] = useState(initialValues.username)
  const [password, setPassword] = useState(initialValues.password)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSiteChange = useCallback((event) => setSite(event.target.value), [])
  const handleUsernameChange = useCallback((event) => setUsername(event.target.value), [])
  const handlePasswordChange = useCallback((event) => setPassword(event.target.value), [])

  const toggleShowPassword = useCallback(() => {
    setShowPassword((current) => !current)
  }, [])

  const handleGenerate = useCallback(() => {
    setPassword(generatePassword(16))
    setShowPassword(true)
  }, [])

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault()

      if (!site.trim() || !username.trim() || !password) {
        setError('Fill in site, username and password.')
        return
      }

      onSubmit({ site: site.trim(), username: username.trim(), password })
      setError('')

      if (!editing) {
        setSite('')
        setUsername('')
        setPassword('')
        setShowPassword(false)
      }
    },
    [site, username, password, editing, onSubmit],
  )

  return (
    <form className={editing ? 'entry-form editing' : 'entry-form'} onSubmit={handleSubmit}>
      <h2>{editing ? 'Edit entry' : 'Add entry'}</h2>

      <label>
        Site
        <input value={site} onChange={handleSiteChange} placeholder="e.g. github.com" />
      </label>

      <label>
        Username / e-mail
        <input value={username} onChange={handleUsernameChange} autoComplete="off" />
      </label>

      <label>
        Password
        <div className="password-row">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={handlePasswordChange}
            autoComplete="new-password"
          />
          <button type="button" onClick={toggleShowPassword}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
          <button type="button" onClick={handleGenerate}>
            Generate
          </button>
        </div>
      </label>

      {error && <p className="error">{error}</p>}

      <div className="form-actions">
        <button type="submit">{editing ? 'Save changes' : 'Add'}</button>
        {editing && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

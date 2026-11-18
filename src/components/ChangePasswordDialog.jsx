import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { changePassword, checkNewPassword } from '../utils/auth.js'
import { CheckIcon } from './icons.jsx'

// Window for changing the master password. The browser's <dialog> with showModal()
// dims the page, keeps keyboard focus inside, and closes on Escape by itself.
// Whatever closes it (Cancel, Done, Escape) fires the dialog's close event -> onClose.
export default function ChangePasswordDialog({ user, onClose }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [repeated, setRepeated] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  // Open as soon as it appears; the browser then focuses the first field.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog.open) dialog.showModal()
  }, [])

  const close = useCallback(() => dialogRef.current.close(), [])

  const handleCurrentChange = useCallback((event) => setCurrentPassword(event.target.value), [])
  const handleNewChange = useCallback((event) => setNewPassword(event.target.value), [])
  const handleRepeatedChange = useCallback((event) => setRepeated(event.target.value), [])

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault()

      const problem = currentPassword ? checkNewPassword(newPassword, repeated) : 'Enter your current master password.'
      if (problem) {
        setError(problem)
        return
      }

      setBusy(true)
      setError('')
      try {
        await changePassword(user.key, currentPassword, newPassword)
        setDone(true)
      } catch (err) {
        setError(err.message)
      }
      setBusy(false)
    },
    [user.key, currentPassword, newPassword, repeated],
  )

  return (
    <dialog ref={dialogRef} className="dialog" onClose={onClose} aria-labelledby={titleId}>
      {done ? (
        <div className="dialog-body">
          <h2 id={titleId}>Master password changed</h2>
          <p className="dialog-success">
            <CheckIcon />
            Use it the next time you log in.
          </p>
          <div className="dialog-actions">
            <button type="button" onClick={close} autoFocus>
              Done
            </button>
          </div>
        </div>
      ) : (
        <form className="dialog-body" onSubmit={handleSubmit} noValidate>
          <h2 id={titleId}>Change master password</h2>

          <label>
            Current master password
            <input type="password" value={currentPassword} onChange={handleCurrentChange} autoComplete="current-password" />
          </label>

          <label>
            New master password
            <input type="password" name="new" value={newPassword} onChange={handleNewChange} autoComplete="new-password" />
          </label>

          <label>
            Repeat new master password
            <input
              type="password"
              name="confirm"
              value={repeated}
              onChange={handleRepeatedChange}
              autoComplete="new-password"
            />
          </label>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          <div className="dialog-actions">
            <button type="button" onClick={close}>
              Cancel
            </button>
            <button type="submit" disabled={busy}>
              {busy ? 'Checking…' : 'Change password'}
            </button>
          </div>
        </form>
      )}
    </dialog>
  )
}

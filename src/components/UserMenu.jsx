import { useCallback, useEffect, useId, useRef, useState } from 'react'
import ChangePasswordDialog from './ChangePasswordDialog.jsx'
import { ChevronDownIcon, KeyIcon, LogOutIcon } from './icons.jsx'

// Avatar button in the topbar that opens a small panel with the user's name,
// "Change master password" and "Log out".
export default function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const panelId = useId()

  const toggleOpen = useCallback(() => setOpen((current) => !current), [])

  const startChangingPassword = useCallback(() => {
    setOpen(false)
    setChangingPassword(true)
  }, [])

  // The menu item that opened the dialog is gone by now, so give focus back to the avatar button.
  const stopChangingPassword = useCallback(() => {
    setChangingPassword(false)
    triggerRef.current.focus()
  }, [])

  // While the panel is open, a click anywhere else or the Escape key closes it.
  useEffect(() => {
    if (!open) return

    function handlePointerDown(event) {
      if (!rootRef.current.contains(event.target)) setOpen(false)
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const initial = user.name.charAt(0).toUpperCase()

  return (
    <div className="user-menu" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="user-trigger"
        onClick={toggleOpen}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Account menu for ${user.name}`}
      >
        <span className="avatar" aria-hidden="true">
          {initial}
        </span>
        <span className="user-name">{user.name}</span>
        <ChevronDownIcon />
      </button>

      {open && (
        <div className="user-menu-panel" id={panelId}>
          <div className="user-menu-header">
            <span className="avatar large" aria-hidden="true">
              {initial}
            </span>
            <div>
              <span className="note">Signed in as</span>
              <strong>{user.name}</strong>
            </div>
          </div>
          <button type="button" className="menu-item" onClick={startChangingPassword} data-action="change-password">
            <KeyIcon />
            Change master password
          </button>
          <button type="button" className="menu-item danger" onClick={onLogout}>
            <LogOutIcon />
            Log out
          </button>
        </div>
      )}

      {changingPassword && <ChangePasswordDialog user={user} onClose={stopChangingPassword} />}
    </div>
  )
}

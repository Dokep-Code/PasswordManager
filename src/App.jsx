import { useCallback, useState } from 'react'
import LoginForm from './components/LoginForm.jsx'
import Topbar from './components/Topbar.jsx'
import Vault from './components/Vault.jsx'
import { clearSession, loadSessionUser, saveSession } from './utils/auth.js'

export default function App() {
  // { key, name } of the signed-in user, or null. A reload in the same tab keeps it.
  const [user, setUser] = useState(loadSessionUser)

  const handleLogin = useCallback((signedInUser) => {
    saveSession(signedInUser.key)
    setUser(signedInUser)
  }, [])

  const handleLogout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  return (
    <>
      <Topbar user={user} onLogout={handleLogout} />
      <main className="app">
        {user ? <Vault key={user.key} userKey={user.key} /> : <LoginForm onLogin={handleLogin} />}
      </main>
    </>
  )
}

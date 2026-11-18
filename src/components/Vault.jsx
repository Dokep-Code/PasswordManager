import { useCallback, useEffect, useState } from 'react'
import { entriesKey } from '../utils/auth.js'
import EntryForm from './EntryForm.jsx'
import EntryList from './EntryList.jsx'

// Lazy initial state: runs once on the first render, not on every render.
function loadEntries(storageKey) {
  try {
    const saved = localStorage.getItem(storageKey)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

// The signed-in user's passwords. App renders it with key={userKey}, so a
// different user always gets a fresh Vault with their own state.
export default function Vault({ userKey }) {
  const storageKey = entriesKey(userKey)
  const [entries, setEntries] = useState(() => loadEntries(storageKey))
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)

  // Save to the browser every time the list changes.
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(entries))
  }, [storageKey, entries])

  // All callbacks use the functional form of setEntries (prev => ...),
  // so they don't depend on `entries` and stay the same between renders.
  const addEntry = useCallback((data) => {
    setEntries((prev) => [...prev, { id: createId(), ...data }])
  }, [])

  const updateEntry = useCallback(
    (data) => {
      setEntries((prev) => prev.map((entry) => (entry.id === editingId ? { ...entry, ...data } : entry)))
      setEditingId(null)
    },
    [editingId],
  )

  const deleteEntry = useCallback((id) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
    setEditingId((current) => (current === id ? null : current))
  }, [])

  const startEditing = useCallback((id) => setEditingId(id), [])
  const cancelEditing = useCallback(() => setEditingId(null), [])

  const handleSearchChange = useCallback((event) => setSearch(event.target.value), [])

  const editingEntry = entries.find((entry) => entry.id === editingId)

  const query = search.trim().toLowerCase()
  const visibleEntries = entries.filter(
    (entry) => entry.site.toLowerCase().includes(query) || entry.username.toLowerCase().includes(query),
  )

  return (
    <>
      {/* key forces a fresh form (fresh useState values) when switching between add and edit */}
      <EntryForm
        key={editingId ?? 'new'}
        initialValues={editingEntry}
        editing={Boolean(editingEntry)}
        onSubmit={editingEntry ? updateEntry : addEntry}
        onCancel={cancelEditing}
      />

      <section>
        <div className="list-header">
          <h2>Saved passwords ({entries.length})</h2>
          <input type="search" value={search} onChange={handleSearchChange} placeholder="Search site or username" />
        </div>

        <EntryList entries={visibleEntries} editingId={editingId} onEdit={startEditing} onDelete={deleteEntry} />
      </section>
    </>
  )
}

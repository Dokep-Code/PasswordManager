import EntryItem from './EntryItem.jsx'

export default function EntryList({ entries, editingId, onEdit, onDelete }) {
  if (entries.length === 0) {
    return <p className="empty">No passwords to show.</p>
  }

  return (
    <div className="table-wrap">
      <table className="entry-list">
        <thead>
          <tr>
            <th>Site</th>
            <th>Username</th>
            <th>Password</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <EntryItem
              key={entry.id}
              entry={entry}
              isEditing={entry.id === editingId}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

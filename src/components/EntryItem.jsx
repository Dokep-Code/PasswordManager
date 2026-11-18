import { memo, useCallback, useState } from 'react'
import { AlertIcon, CheckIcon, CopyIcon, EyeIcon, EyeOffIcon, PencilIcon, TrashIcon } from './icons.jsx'

// Button text for each copy state. The text is hidden on wide screens (icons only)
// but still read by screen readers, and shown next to the icon on phones.
const COPY_LABELS = { idle: 'Copy', copied: 'Copied!', failed: 'Copy failed' }

// memo() skips re-rendering a row when its props haven't changed. That only works
// because App passes stable callbacks (useCallback) for onEdit and onDelete.
function EntryItem({ entry, isEditing, onEdit, onDelete }) {
  const [visible, setVisible] = useState(false)
  const [copyStatus, setCopyStatus] = useState('idle') // 'idle' | 'copied' | 'failed'

  const toggleVisible = useCallback(() => {
    setVisible((current) => !current)
  }, [])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(entry.password)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('failed')
    }
    setTimeout(() => setCopyStatus('idle'), 1500)
  }, [entry.password])

  const handleEdit = useCallback(() => {
    onEdit(entry.id)
  }, [onEdit, entry.id])

  const handleDelete = useCallback(() => {
    if (window.confirm(`Delete the entry for ${entry.site}?`)) {
      onDelete(entry.id)
    }
  }, [onDelete, entry.id, entry.site])

  const copyLabel = COPY_LABELS[copyStatus]
  const copyIcon = { idle: <CopyIcon />, copied: <CheckIcon />, failed: <AlertIcon /> }[copyStatus]

  return (
    <tr className={isEditing ? 'editing' : undefined}>
      <td>{entry.site}</td>
      <td>{entry.username}</td>
      <td className="password-cell">{visible ? entry.password : '••••••••'}</td>
      <td className="actions">
        <button type="button" onClick={toggleVisible} title={visible ? 'Hide password' : 'Show password'}>
          {visible ? <EyeOffIcon /> : <EyeIcon />}
          <span className="btn-label">{visible ? 'Hide' : 'Show'}</span>
        </button>
        {/* data-feedback feeds the small "Copied!" bubble drawn by CSS */}
        <button
          type="button"
          className={copyStatus === 'idle' ? undefined : copyStatus}
          onClick={handleCopy}
          title="Copy password"
          data-feedback={copyStatus === 'idle' ? undefined : copyLabel}
        >
          {/* key restarts the icon's pop animation each time the state changes */}
          <span className="btn-icon" key={copyStatus}>
            {copyIcon}
          </span>
          <span className="btn-label">{copyLabel}</span>
        </button>
        <button type="button" onClick={handleEdit} title="Edit entry">
          <PencilIcon />
          <span className="btn-label">Edit</span>
        </button>
        <button type="button" className="danger" onClick={handleDelete} title="Delete entry">
          <TrashIcon />
          <span className="btn-label">Delete</span>
        </button>
        {/* Announces the copy result to screen readers */}
        <span className="sr-only" role="status">
          {copyStatus === 'idle' ? '' : copyLabel}
        </span>
      </td>
    </tr>
  )
}

export default memo(EntryItem)

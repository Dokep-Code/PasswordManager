// Small line icons (24×24 grid, drawn with the current text colour).
// aria-hidden: the button around each icon carries the text for screen readers.
function Icon({ children, size = 16 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function EyeIcon() {
  return (
    <Icon>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  )
}

export function EyeOffIcon() {
  return (
    <Icon>
      <path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-2.2 3.1M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M2 2l20 20" />
    </Icon>
  )
}

export function CopyIcon() {
  return (
    <Icon>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </Icon>
  )
}

export function CheckIcon() {
  return (
    <Icon>
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  )
}

export function AlertIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4M12 16h.01" />
    </Icon>
  )
}

export function PencilIcon() {
  return (
    <Icon>
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </Icon>
  )
}

export function TrashIcon() {
  return (
    <Icon>
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
    </Icon>
  )
}

export function SunIcon() {
  return (
    <Icon size={18}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </Icon>
  )
}

export function MoonIcon() {
  return (
    <Icon size={18}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </Icon>
  )
}

export function ChevronDownIcon() {
  return (
    <Icon size={14}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  )
}

export function LogOutIcon() {
  return (
    <Icon>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </Icon>
  )
}

export function InfoIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </Icon>
  )
}

export function KeyIcon() {
  return (
    <Icon>
      <circle cx="7.5" cy="15.5" r="5" />
      <path d="M11 12 21 2M16 7l3 3M19 4l2 2" />
    </Icon>
  )
}

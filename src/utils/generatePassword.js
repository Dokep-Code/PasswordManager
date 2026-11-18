const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGITS = '0123456789'
const SYMBOLS = '!@#$%^&*-_=+?'
const ALL = LOWER + UPPER + DIGITS + SYMBOLS

// Uses the browser's cryptographically secure random generator (not Math.random).
export function generatePassword(length = 16) {
  const values = crypto.getRandomValues(new Uint32Array(length))
  return Array.from(values, (value) => ALL[value % ALL.length]).join('')
}

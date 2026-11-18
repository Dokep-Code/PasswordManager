// Local accounts, for this browser only. There is no server: user names and
// password hashes live in localStorage, and each user gets their own entry list.
// The saved entries are still NOT encrypted. The login keeps users apart,
// it does not protect the data from someone who opens the browser's storage.

import { pbkdf2Sha256 } from './pbkdf2.js'

const USERS_KEY = 'password-manager.users'
const SESSION_KEY = 'password-manager.session'
const LEGACY_ENTRIES_KEY = 'password-manager.entries' // the single list from before logins existed
const ITERATIONS = 100_000

const MIN_PASSWORD_LENGTH = 8

// Where one user's entries are stored.
export function entriesKey(userKey) {
  return `${LEGACY_ENTRIES_KEY}.${userKey}`
}

// { [userKey]: { name, salt, hash } }, where userKey is the lower-cased name.
function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) ?? {}
  } catch {
    return {}
  }
}

export function hasAccounts() {
  return Object.keys(loadUsers()).length > 0
}

// How many entries were saved before logins existed (the first account takes them over).
export function countLegacyEntries() {
  try {
    const entries = JSON.parse(localStorage.getItem(LEGACY_ENTRIES_KEY))
    return Array.isArray(entries) ? entries.length : 0
  } catch {
    return 0
  }
}

const toHex = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
const fromHex = (hex) => new Uint8Array(hex.match(/../g).map((pair) => parseInt(pair, 16)))

const newSalt = () => toHex(crypto.getRandomValues(new Uint8Array(16)))

// PBKDF2: a deliberately slow, salted hash, so the stored value can't be turned
// back into the password quickly. Only the hash and the salt are saved.
async function hashPassword(password, saltHex) {
  const passwordBytes = new TextEncoder().encode(password)
  const salt = fromHex(saltHex)

  if (crypto.subtle) {
    const key = await crypto.subtle.importKey('raw', passwordBytes, 'PBKDF2', false, ['deriveBits'])
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS }, key, 256)
    return toHex(new Uint8Array(bits))
  }

  // No Web Crypto on plain http:// pages that aren't localhost: compute the same
  // hash in plain JavaScript. It blocks the page for a moment, so first wait for
  // the next frame to be drawn (the button already says "Checking…").
  await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)))
  return toHex(pbkdf2Sha256(passwordBytes, salt, ITERATIONS))
}

// What's wrong with a new master password, or '' if it is fine.
export function checkNewPassword(password, repeated) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters for the master password.`
  }
  if (password !== repeated) {
    return "The two passwords don't match."
  }
  return ''
}

// Both functions resolve to the signed-in user ({ key, name })
// or reject with an Error whose message can be shown in the form.
export async function register(name, password) {
  const key = name.toLowerCase()
  const users = loadUsers()
  if (users[key]) {
    throw new Error('That username is already taken.')
  }

  const salt = newSalt()
  const hash = await hashPassword(password, salt)

  // The very first account takes over the entries saved before logins existed.
  const legacyEntries = localStorage.getItem(LEGACY_ENTRIES_KEY)
  if (Object.keys(users).length === 0 && legacyEntries) {
    localStorage.setItem(entriesKey(key), legacyEntries)
    localStorage.removeItem(LEGACY_ENTRIES_KEY)
  }

  localStorage.setItem(USERS_KEY, JSON.stringify({ ...users, [key]: { name, salt, hash } }))
  return { key, name }
}

export async function logIn(name, password) {
  const key = name.toLowerCase()
  const account = loadUsers()[key]
  if (!account || (await hashPassword(password, account.salt)) !== account.hash) {
    throw new Error('Wrong username or password.')
  }
  return { key, name: account.name }
}

// Checks the current password, then stores a hash of the new one (with a new salt).
export async function changePassword(userKey, currentPassword, newPassword) {
  const account = loadUsers()[userKey]
  if (!account || (await hashPassword(currentPassword, account.salt)) !== account.hash) {
    throw new Error('Your current master password is wrong.')
  }

  const salt = newSalt()
  const hash = await hashPassword(newPassword, salt)
  localStorage.setItem(USERS_KEY, JSON.stringify({ ...loadUsers(), [userKey]: { ...account, salt, hash } }))
}

// The session lives in sessionStorage: a reload keeps you signed in,
// closing the tab signs you out.
export function saveSession(userKey) {
  sessionStorage.setItem(SESSION_KEY, userKey)
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

export function loadSessionUser() {
  try {
    const key = sessionStorage.getItem(SESSION_KEY)
    const account = key && loadUsers()[key]
    return account ? { key, name: account.name } : null
  } catch {
    return null
  }
}

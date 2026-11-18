# Password Manager

A basic password manager built with React (Vite) using `useState` and `useCallback`.

Features: log in with a local account and change its master password; add, edit, delete and search entries;
show/hide and copy passwords; generate random passwords; dark/light theme.

Accounts exist only in this browser (there is no server). Each user has their own list of entries. Master passwords
are stored as salted PBKDF2 hashes, but the entries themselves are saved in `localStorage` **without encryption**:
this is a learning project, not a real vault. The first account created takes over any entries saved before logins
were added. Hashing uses the browser's Web Crypto API; on plain `http://` pages that aren't `localhost` (for example
a phone opening the dev server by its network address) that API is missing, so the same hash is computed in plain
JavaScript instead.

## Run

```sh
npm install
npm run dev
```

## Structure

- `src/App.jsx` — who is signed in; shows the login form or the vault
- `src/components/Topbar.jsx` — top bar: logo, theme switch, account menu
- `src/components/UserMenu.jsx` — avatar button: the user's name, Change master password, Log out
- `src/components/ChangePasswordDialog.jsx` — window for changing the master password
- `src/components/LoginForm.jsx` — log in / create account form
- `src/components/Vault.jsx` — holds the list state and the add/update/delete callbacks
- `src/components/EntryForm.jsx` — add/edit form (controlled inputs, password generator)
- `src/components/EntryList.jsx` — table of entries
- `src/components/EntryItem.jsx` — one row (show/hide, copy, edit, delete)
- `src/components/ThemeToggle.jsx` — dark/light theme switch (saved in `localStorage`)
- `src/components/icons.jsx` — small SVG icons used by the buttons
- `src/utils/generatePassword.js` — random password generator
- `src/utils/auth.js` — local accounts: password hashing, sign-up, log-in, password change, session
- `src/utils/pbkdf2.js` — plain-JavaScript PBKDF2, used when Web Crypto is missing

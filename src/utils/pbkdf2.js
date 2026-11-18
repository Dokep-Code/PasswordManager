// PBKDF2-HMAC-SHA256 in plain JavaScript. auth.js uses it only when the browser's
// Web Crypto API (crypto.subtle) is missing, which happens on plain http:// pages
// that aren't localhost (for example the dev server opened from a phone by its
// network address). It gives exactly the same result as crypto.subtle, just slower.

// SHA-256 round constants and starting state (from the SHA-2 standard, FIPS 180-4).
const K = new Int32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98,
  0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8,
  0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819,
  0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
  0xc67178f2,
])
const INITIAL_STATE = new Int32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
])

// Mixes one 64-byte block (16 words in w[0..15]; w has room for 64) into the 8-word state.
function compress(state, w) {
  for (let i = 16; i < 64; i++) {
    const x = w[i - 15]
    const y = w[i - 2]
    const s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3)
    const s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10)
    w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0
  }

  let a = state[0]
  let b = state[1]
  let c = state[2]
  let d = state[3]
  let e = state[4]
  let f = state[5]
  let g = state[6]
  let h = state[7]

  for (let i = 0; i < 64; i++) {
    const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))
    const t1 = (h + S1 + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0
    const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))
    const t2 = (S0 + ((a & b) ^ (a & c) ^ (b & c))) | 0
    h = g
    g = f
    f = e
    e = (d + t1) | 0
    d = c
    c = b
    b = a
    a = (t1 + t2) | 0
  }

  state[0] = (state[0] + a) | 0
  state[1] = (state[1] + b) | 0
  state[2] = (state[2] + c) | 0
  state[3] = (state[3] + d) | 0
  state[4] = (state[4] + e) | 0
  state[5] = (state[5] + f) | 0
  state[6] = (state[6] + g) | 0
  state[7] = (state[7] + h) | 0
}

// SHA-256 of `bytes`, carrying on from `startState` after `bytesBefore` bytes
// (a whole number of 64-byte blocks) were already mixed in. Returns 8 words.
function sha256Words(bytes, startState = INITIAL_STATE, bytesBefore = 0) {
  const state = Int32Array.from(startState)
  const bitLength = (bytesBefore + bytes.length) * 8

  // Padding: a 1 bit, zeros, then the total length in bits in the last 8 bytes.
  const padded = new Uint8Array(Math.ceil((bytes.length + 9) / 64) * 64)
  padded.set(bytes)
  padded[bytes.length] = 0x80
  const view = new DataView(padded.buffer)
  view.setUint32(padded.length - 8, Math.floor(bitLength / 2 ** 32))
  view.setUint32(padded.length - 4, bitLength >>> 0)

  const w = new Int32Array(64)
  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getInt32(offset + i * 4)
    compress(state, w)
  }
  return state
}

function wordsToBytes(words) {
  const bytes = new Uint8Array(words.length * 4)
  const view = new DataView(bytes.buffer)
  words.forEach((word, i) => view.setInt32(i * 4, word))
  return bytes
}

// Hot path of the loop below: SHA-256 of a 32-byte message (8 words) that follows a
// 64-byte HMAC key block already mixed into `keyState`. That is always exactly one block.
function hash32AfterKey(keyState, words, out, w) {
  for (let i = 0; i < 8; i++) w[i] = words[i]
  w[8] = 0x80000000 | 0 // the padding's 1 bit
  for (let i = 9; i < 15; i++) w[i] = 0
  w[15] = (64 + 32) * 8 // total length in bits
  out.set(keyState)
  compress(out, w)
}

// Returns the 32-byte PBKDF2-HMAC-SHA256 key, same as
// crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256).
export function pbkdf2Sha256(passwordBytes, saltBytes, iterations) {
  // HMAC: a key longer than one block is hashed first; then it is XOR-ed into two pads.
  const key = passwordBytes.length > 64 ? wordsToBytes(sha256Words(passwordBytes)) : passwordBytes
  const innerPad = new Uint8Array(64).fill(0x36)
  const outerPad = new Uint8Array(64).fill(0x5c)
  key.forEach((byte, i) => {
    innerPad[i] ^= byte
    outerPad[i] ^= byte
  })

  // Mix each pad in once, up front; every HMAC below continues from these two states.
  const w = new Int32Array(64)
  const innerState = Int32Array.from(INITIAL_STATE)
  const outerState = Int32Array.from(INITIAL_STATE)
  const padView = (pad) => new DataView(pad.buffer)
  for (const [state, pad] of [
    [innerState, padView(innerPad)],
    [outerState, padView(outerPad)],
  ]) {
    for (let i = 0; i < 16; i++) w[i] = pad.getInt32(i * 4)
    compress(state, w)
  }

  // U1 = HMAC(password, salt + block number 1)
  const firstMessage = new Uint8Array(saltBytes.length + 4)
  firstMessage.set(saltBytes)
  firstMessage[firstMessage.length - 1] = 1
  const u = sha256Words(wordsToBytes(sha256Words(firstMessage, innerState, 64)), outerState, 64)

  // U2..Un, each the HMAC of the one before; the result is all of them XOR-ed together.
  const result = Int32Array.from(u)
  const innerHash = new Int32Array(8)
  for (let n = 1; n < iterations; n++) {
    hash32AfterKey(innerState, u, innerHash, w)
    hash32AfterKey(outerState, innerHash, u, w)
    for (let i = 0; i < 8; i++) result[i] ^= u[i]
  }
  return wordsToBytes(result)
}

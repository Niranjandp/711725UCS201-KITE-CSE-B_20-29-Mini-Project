/**
 * crypto.js
 * Encryption layer using the Web Crypto API.
 *
 * Key Derivation:  PBKDF2 (SHA-256, 200 000 iterations) → AES-256-GCM key
 * Encryption:      AES-256-GCM with a random 12-byte IV per operation
 * Storage format:  base64(iv) + ":" + base64(ciphertext)
 */

const PBKDF2_ITERATIONS = 200_000;
const KEY_LENGTH = 256;
const SALT_KEY = "finvault_salt";

/* ── helpers ─────────────────────────────────────────── */
function buf2b64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function b642buf(b64) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;
}

/** Get-or-create a random 16-byte salt stored in localStorage */
function getOrCreateSalt() {
  let stored = localStorage.getItem(SALT_KEY);
  if (stored) return b642buf(stored);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  localStorage.setItem(SALT_KEY, buf2b64(salt.buffer));
  return salt.buffer;
}

/**
 * Derive an AES-GCM CryptoKey from a plaintext password.
 * Returns a { cryptoKey, exportedRaw } object.
 * Call this once after login and pass cryptoKey to encrypt/decrypt.
 */
export async function deriveKey(password) {
  const enc = new TextEncoder();
  const salt = getOrCreateSalt();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const cryptoKey = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH },
    true,
    ["encrypt", "decrypt"]
  );

  // Export raw bytes so we can verify the key during login
  const exportedRaw = buf2b64(await crypto.subtle.exportKey("raw", cryptoKey));

  return { cryptoKey, exportedRaw };
}

/**
 * Encrypt any JSON-serialisable value.
 * Returns a compact string: base64(iv):base64(ciphertext)
 */
export async function encryptValue(cryptoKey, value) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    enc.encode(JSON.stringify(value))
  );
  return `${buf2b64(iv.buffer)}:${buf2b64(cipherBuf)}`;
}

/**
 * Decrypt a string produced by encryptValue.
 * Returns the original JS value.
 */
export async function decryptValue(cryptoKey, payload) {
  const [ivB64, ctB64] = payload.split(":");
  const dec = new TextDecoder();
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(b642buf(ivB64)) },
    cryptoKey,
    b642buf(ctB64)
  );
  return JSON.parse(dec.decode(plain));
}

/**
 * Produce a SHA-256 hex hash of a string.
 * Used for password verification.
 */
export async function sha256hex(text) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

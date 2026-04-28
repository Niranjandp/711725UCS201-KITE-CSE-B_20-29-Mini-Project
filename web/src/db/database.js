/**
 * database.js
 * IndexedDB service layer – all data is AES-256-GCM encrypted at rest.
 *
 * Stores
 * ──────
 *   users        – login credentials  (unencrypted meta + encrypted payload)
 *   accounts     – bank accounts
 *   transactions – transfer log
 */

import { openDB } from "idb";
import { encryptValue, decryptValue, sha256hex } from "./crypto";

const DB_NAME    = "finvault_db";
const DB_VERSION = 1;

let _db = null;

async function getDB() {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // users store
      if (!db.objectStoreNames.contains("users")) {
        const us = db.createObjectStore("users", { keyPath: "username" });
        us.createIndex("username", "username", { unique: true });
      }
      // accounts store
      if (!db.objectStoreNames.contains("accounts")) {
        const as = db.createObjectStore("accounts", { keyPath: "id", autoIncrement: true });
        as.createIndex("acctNum", "acctNum", { unique: true });
      }
      // transactions store
      if (!db.objectStoreNames.contains("transactions")) {
        const ts = db.createObjectStore("transactions", { keyPath: "id", autoIncrement: true });
        ts.createIndex("timestamp", "timestamp");
      }
    },
  });
  return _db;
}

/* ══════════════════════════════════════════════
   AUTH
══════════════════════════════════════════════ */

/**
 * Seed the DB with a default admin user on first run.
 * Password is stored as SHA-256; payload is stored plain (no account data here).
 */
export async function seedDefaultUsers() {
  const db = await getDB();
  const existing = await db.get("users", "admin");
  if (!existing) {
    const hash = await sha256hex("admin");
    await db.put("users", { username: "admin", passwordHash: hash, role: "Administrator" });
    const mgrHash = await sha256hex("pass123");
    await db.put("users", { username: "manager", passwordHash: mgrHash, role: "Manager" });
    console.log("[FinVault DB] Default users seeded.");
  }
}

/**
 * Verify login. Returns { ok, role } or { ok: false }.
 */
export async function verifyLogin(username, password) {
  const db   = await getDB();
  const user = await db.get("users", username);
  if (!user) return { ok: false };
  const hash = await sha256hex(password);
  if (hash !== user.passwordHash) return { ok: false };
  return { ok: true, role: user.role };
}

/* ══════════════════════════════════════════════
   ACCOUNTS
══════════════════════════════════════════════ */

/**
 * Save an account (encrypted). Returns the stored record.
 */
export async function saveAccount(cryptoKey, account) {
  const db       = await getDB();
  const payload  = await encryptValue(cryptoKey, account);
  const record   = { acctNum: account.acctNum, _enc: payload };

  const existing = await db.getFromIndex("accounts", "acctNum", account.acctNum);
  if (existing) {
    record.id = existing.id;
    await db.put("accounts", record);
  } else {
    await db.add("accounts", record);
  }
  return account;
}

/**
 * Load and decrypt all accounts.
 */
export async function loadAccounts(cryptoKey) {
  const db      = await getDB();
  const records = await db.getAll("accounts");
  const results = [];
  for (const r of records) {
    try {
      const dec = await decryptValue(cryptoKey, r._enc);
      results.push(dec);
    } catch {
      // skip corrupted records
    }
  }
  return results;
}

/**
 * Delete an account by acctNum.
 */
export async function deleteAccount(acctNum) {
  const db      = await getDB();
  const existing = await db.getFromIndex("accounts", "acctNum", acctNum);
  if (existing) await db.delete("accounts", existing.id);
}

/* ══════════════════════════════════════════════
   TRANSACTIONS
══════════════════════════════════════════════ */

/**
 * Append an encrypted transaction record.
 */
export async function saveTransaction(cryptoKey, txn) {
  const db      = await getDB();
  const payload = await encryptValue(cryptoKey, txn);
  const ts      = new Date().toISOString();
  await db.add("transactions", { timestamp: ts, _enc: payload });
}

/**
 * Load and decrypt all transactions, newest first.
 */
export async function loadTransactions(cryptoKey) {
  const db      = await getDB();
  const records = await db.getAll("transactions");
  const results = [];
  for (const r of records) {
    try {
      const dec = await decryptValue(cryptoKey, r._enc);
      results.push({ ...dec, _ts: r.timestamp });
    } catch {
      // skip
    }
  }
  return results.reverse();
}

/* ══════════════════════════════════════════════
   SEED DEMO ACCOUNTS (first run only)
══════════════════════════════════════════════ */

export async function seedDemoAccounts(cryptoKey) {
  const db       = await getDB();
  const existing = await db.count("accounts");
  if (existing > 0) return; // already seeded

  const demos = [
    { acctNum: 1, name: "Joe Johnson",    balance: 12450.00,  type: 0, branchId: 1 },
    { acctNum: 2, name: "Sarah Williams", balance: 85000.00,  type: 1, branchId: 1 },
    { acctNum: 3, name: "Raj Patel",      balance: 250000.00, type: 2, branchId: 2 },
    { acctNum: 4, name: "Emily Chen",     balance: 3200.50,   type: 0, branchId: 2 },
    { acctNum: 5, name: "David Kumar",    balance: 15780.25,  type: 1, branchId: 3 },
    { acctNum: 6, name: "Priya Singh",    balance: 500000.00, type: 2, branchId: 1 },
    { acctNum: 7, name: "Michael Scott",  balance: 6700.00,   type: 0, branchId: 3 },
    { acctNum: 8, name: "Ananya Sharma",  balance: 43200.75,  type: 1, branchId: 2 },
  ];

  for (const acc of demos) await saveAccount(cryptoKey, acc);
  console.log("[FinVault DB] Demo accounts seeded and encrypted.");
}

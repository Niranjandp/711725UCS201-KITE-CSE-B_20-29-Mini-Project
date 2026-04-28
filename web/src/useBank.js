/**
 * useBank.js – React hook that wires the encrypted IndexedDB to component state.
 */
import { useState, useEffect, useCallback } from "react";
import {
  seedDemoAccounts, loadAccounts, saveAccount, deleteAccount,
  loadTransactions, saveTransaction,
} from "./db/database";
import { MOCK_TRANSACTIONS } from "./data";

export function useBank(cryptoKey) {
  const [accounts,     setAccounts]     = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);

  /* ── initial load ── */
  useEffect(() => {
    if (!cryptoKey) return;
    (async () => {
      setLoading(true);
      await seedDemoAccounts(cryptoKey);          // no-op after first run
      const accs  = await loadAccounts(cryptoKey);
      const txns  = await loadTransactions(cryptoKey);
      setAccounts(accs);
      // If DB has no txns yet, persist the mock ones for demo purposes
      if (txns.length === 0) {
        for (const t of MOCK_TRANSACTIONS) await saveTransaction(cryptoKey, t);
        setTransactions(await loadTransactions(cryptoKey));
      } else {
        setTransactions(txns);
      }
      setLoading(false);
    })();
  }, [cryptoKey]);

  /* ── account ops ── */
  const addAccount = useCallback(async (acc) => {
    await saveAccount(cryptoKey, acc);
    setAccounts(await loadAccounts(cryptoKey));
  }, [cryptoKey]);

  const removeAccount = useCallback(async (acctNum) => {
    await deleteAccount(acctNum);
    setAccounts((prev) => prev.filter((a) => a.acctNum !== acctNum));
  }, [cryptoKey]);

  const updateAccount = useCallback(async (updated) => {
    await saveAccount(cryptoKey, updated);
    setAccounts((prev) => prev.map((a) => a.acctNum === updated.acctNum ? updated : a));
  }, [cryptoKey]);

  /* ── transaction ops ── */
  const addTransaction = useCallback(async (txn) => {
    await saveTransaction(cryptoKey, txn);
    setTransactions(await loadTransactions(cryptoKey));
  }, [cryptoKey]);

  return { accounts, setAccounts, transactions, setTransactions, loading, addAccount, removeAccount, updateAccount, addTransaction };
}

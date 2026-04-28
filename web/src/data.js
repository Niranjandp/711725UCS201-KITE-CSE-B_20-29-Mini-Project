// Simulated data (mirrors what api_export.json looks like from the C program)
export const MOCK_ACCOUNTS = [
  { acctNum: 1,  name: "Joe Johnson",     balance: 12450.00, type: 0, branchId: 1 },
  { acctNum: 2,  name: "Sarah Williams",  balance: 85000.00, type: 1, branchId: 1 },
  { acctNum: 3,  name: "Raj Patel",       balance: 250000.00,type: 2, branchId: 2 },
  { acctNum: 4,  name: "Emily Chen",      balance: 3200.50,  type: 0, branchId: 2 },
  { acctNum: 5,  name: "David Kumar",     balance: 15780.25, type: 1, branchId: 3 },
  { acctNum: 6,  name: "Priya Singh",     balance: 500000.00,type: 2, branchId: 1 },
  { acctNum: 7,  name: "Michael Scott",   balance: 6700.00,  type: 0, branchId: 3 },
  { acctNum: 8,  name: "Ananya Sharma",   balance: 43200.75, type: 1, branchId: 2 },
];

export const MOCK_TRANSACTIONS = [
  { id: 1, desc: "Transfer → Acct #3",   amount: -5000,  type: "out",  time: "Today, 10:45 AM" },
  { id: 2, desc: "Deposit from Branch 2", amount: 12000,  type: "in",   time: "Today, 09:12 AM" },
  { id: 3, desc: "Loan Credit",           amount: 50000,  type: "loan", time: "Yesterday" },
  { id: 4, desc: "Bill Payment",          amount: -2300,  type: "out",  time: "Yesterday" },
  { id: 5, desc: "Interest Applied",      amount: 3450,   type: "in",   time: "Apr 26" },
  { id: 6, desc: "Transfer ← Acct #1",   amount: 5000,   type: "in",   time: "Apr 26" },
];

export const ACCOUNT_TYPES = { 0: "Savings", 1: "Checking", 2: "Fixed" };

export const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(v);

export const getTypeBadge = (type) => {
  const map = { 0: "badge-savings", 1: "badge-checking", 2: "badge-fixed" };
  return map[type] ?? "badge-savings";
};

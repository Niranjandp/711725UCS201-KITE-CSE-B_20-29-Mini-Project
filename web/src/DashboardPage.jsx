import { useState, useMemo } from "react";
import { useBank } from "./useBank";
import {
  LayoutDashboard, Users, ArrowLeftRight, TrendingUp,
  Shield, Download, LogOut, Landmark, DollarSign,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Search,
  Plus, ChevronUp, ChevronDown, X, CheckCircle,
  Wallet, RefreshCw
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import { MOCK_ACCOUNTS, MOCK_TRANSACTIONS, ACCOUNT_TYPES, formatCurrency, getTypeBadge } from "./data";

const MONTHLY = [
  { month: "Nov", deposits: 42000, withdrawals: 18000 },
  { month: "Dec", deposits: 67000, withdrawals: 31000 },
  { month: "Jan", deposits: 55000, withdrawals: 24000 },
  { month: "Feb", deposits: 91000, withdrawals: 41000 },
  { month: "Mar", deposits: 73000, withdrawals: 29000 },
  { month: "Apr", deposits: 98000, withdrawals: 52000 },
];
const TREND = [
  { day: "Apr 22", balance: 720000 },
  { day: "Apr 23", balance: 745000 },
  { day: "Apr 24", balance: 731000 },
  { day: "Apr 25", balance: 812000 },
  { day: "Apr 26", balance: 790000 },
  { day: "Apr 27", balance: 856000 },
  { day: "Apr 28", balance: 916330 },
];

const NAV = [
  { id: "overview",     label: "Overview",      icon: LayoutDashboard },
  { id: "accounts",     label: "Accounts",      icon: Users },
  { id: "transactions", label: "Transactions",  icon: ArrowLeftRight },
  { id: "analytics",    label: "Analytics",     icon: TrendingUp },
  { id: "security",     label: "Security",      icon: Shield },
];

const PAGE_META = {
  overview:     { title: "Dashboard Overview",    sub: "Welcome back — your accounts are healthy." },
  accounts:     { title: "Account Management",    sub: "Create, search, and manage customer accounts." },
  transactions: { title: "Transactions",          sub: "Fund transfers and full transaction history." },
  analytics:    { title: "Analytics",             sub: "Visual breakdown of your portfolio." },
  security:     { title: "Security Centre",       sub: "All active security features in your C backend." },
};

/* ── helpers ── */
function StatCard({ label, value, icon: Icon, change, changeUp, variant }) {
  return (
    <div className={`stat-card ${variant || ""} fade-in`}>
      <div className="stat-header">
        <div className="stat-icon"><Icon size={18} /></div>
        {change && (
          <span className={`stat-change ${changeUp ? "up" : "down"}`}>
            {changeUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />} {change}
          </span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function TxnList({ txns }) {
  return (
    <div className="txn-list">
      {txns.map((t) => (
        <div key={t.id} className="txn-item">
          <div className={`txn-icon ${t.type}`}>
            {t.type === "in" ? <ArrowUpRight size={16} /> : t.type === "loan" ? <Wallet size={16} /> : <ArrowDownRight size={16} />}
          </div>
          <div className="txn-info">
            <div className="txn-desc">{t.desc}</div>
            <div className="txn-time">{t.time}</div>
          </div>
          <div className={`txn-amount ${t.type === "out" ? "out" : "in"}`}>
            {t.type === "out" ? "" : "+"}{formatCurrency(Math.abs(t.amount))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Pages ── */
function OverviewPage({ accounts, setActive }) {
  const total   = accounts.reduce((s, a) => s + a.balance, 0);
  const savings = accounts.filter((a) => a.type === 0).reduce((s, a) => s + a.balance, 0);
  return (
    <>
      <div className="stats-grid">
        <StatCard label="Total Balance"   value={formatCurrency(total)}   icon={DollarSign}    change="8.2%" changeUp />
        <StatCard label="Active Accounts" value={accounts.length}          icon={Users}         change="2 new" changeUp variant="emerald" />
        <StatCard label="Total Savings"   value={formatCurrency(savings)}  icon={TrendingUp}    change="3%" changeUp variant="gold" />
        <StatCard label="Loans Issued"    value={formatCurrency(50000)}    icon={AlertTriangle} change="1 new" variant="red" />
      </div>

      <div className="content-grid">
        <div className="card fade-in">
          <div className="card-header">
            <div><div className="card-title">Balance Trend</div><div className="card-subtitle">Last 7 days</div></div>
          </div>
          <div className="card-body"><div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND}>
                <defs>
                  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3650" />
                <XAxis dataKey="day"     tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1a2235", border: "1px solid #2a3650", borderRadius: 8, fontSize: 13 }} formatter={(v) => [formatCurrency(v), "Balance"]} />
                <Area type="monotone" dataKey="balance" stroke="#3b82f6" fill="url(#bg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div></div>
        </div>

        <div className="card fade-in">
          <div className="card-header">
            <div><div className="card-title">Recent Transactions</div><div className="card-subtitle">Latest activity</div></div>
            <button className="card-action-btn" onClick={() => setActive("transactions")}>View all</button>
          </div>
          <div className="card-body"><TxnList txns={MOCK_TRANSACTIONS.slice(0, 5)} /></div>
        </div>
      </div>

      <div className="card fade-in">
        <div className="card-header"><div className="card-title">Monthly Activity</div><div className="card-subtitle">Deposits vs Withdrawals</div></div>
        <div className="card-body"><div className="chart-area">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3650" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1a2235", border: "1px solid #2a3650", borderRadius: 8, fontSize: 13 }} />
              <Bar dataKey="deposits"    fill="#3b82f6" radius={[4,4,0,0]} name="Deposits" />
              <Bar dataKey="withdrawals" fill="#ef4444" radius={[4,4,0,0]} name="Withdrawals" />
            </BarChart>
          </ResponsiveContainer>
        </div></div>
      </div>
    </>
  );
}

function AccountsPage({ accounts, addAccount, removeAccount }) {
  const [search,    setSearch]    = useState("");
  const [sortKey,   setSortKey]   = useState("acctNum");
  const [sortDir,   setSortDir]   = useState("asc");
  const [showModal, setShowModal] = useState(false);
  const [deleteId,  setDeleteId]  = useState(null);
  const [newForm,   setNewForm]   = useState({ name: "", balance: "", type: "0", branchId: "1" });

  const filtered = useMemo(() => {
    let arr = accounts.filter((a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) || String(a.acctNum).includes(search)
    );
    arr.sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey];
      return sortDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    return arr;
  }, [accounts, search, sortKey, sortDir]);

  const handleSort = (k) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };

  const SortIco = ({ k }) => sortKey !== k
    ? <span className="sort-icon">↕</span>
    : sortDir === "asc" ? <ChevronUp size={12} className="sort-icon active" /> : <ChevronDown size={12} className="sort-icon active" />;

  const handleAdd = async (e) => {
    e.preventDefault();
    await addAccount({
      acctNum: Math.floor(Math.random() * 900) + 100,
      name: newForm.name, balance: parseFloat(newForm.balance),
      type: parseInt(newForm.type), branchId: parseInt(newForm.branchId),
    });
    setShowModal(false);
    setNewForm({ name: "", balance: "", type: "0", branchId: "1" });
  };

  return (
    <>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add New Account</span>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                <div><div className="tf-label">Full Name</div>
                  <input className="tf-input" placeholder="Last First" required value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} />
                </div>
                <div><div className="tf-label">Initial Balance (₹)</div>
                  <input className="tf-input" type="number" placeholder="0.00" required value={newForm.balance} onChange={(e) => setNewForm({ ...newForm, balance: e.target.value })} />
                </div>
                <div><div className="tf-label">Account Type</div>
                  <select className="tf-select" value={newForm.type} onChange={(e) => setNewForm({ ...newForm, type: e.target.value })}>
                    <option value="0">Savings (3% interest)</option>
                    <option value="1">Checking</option>
                    <option value="2">Fixed Deposit (6% interest)</option>
                  </select>
                </div>
                <div><div className="tf-label">Branch</div>
                  <select className="tf-select" value={newForm.branchId} onChange={(e) => setNewForm({ ...newForm, branchId: e.target.value })}>
                    <option value="1">Branch 1 – Main</option>
                    <option value="2">Branch 2 – North</option>
                    <option value="3">Branch 3 – South</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-success">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Confirm Delete</span>
              <button className="modal-close" onClick={() => setDeleteId(null)}><X size={18} /></button>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Delete Account #{deleteId}? This cannot be undone.</p>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn-danger" onClick={async () => { await removeAccount(deleteId); setDeleteId(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="card fade-in">
        <div className="card-header">
          <div><div className="card-title">All Accounts</div><div className="card-subtitle">{accounts.length} records</div></div>
          <div style={{ display: "flex", gap: 10 }}>
            <div className="search-bar">
              <Search size={14} color="var(--text-muted)" />
              <input placeholder="Search name or account…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button className="card-action-btn primary" onClick={() => setShowModal(true)}><Plus size={14} /> New Account</button>
          </div>
        </div>
        <div className="table-wrap">
          {filtered.length === 0
            ? <div className="empty-state"><Users size={40} /><p>No accounts found.</p></div>
            : (
              <table className="data-table">
                <thead>
                  <tr>
                    {[["acctNum","Acct #"],["name","Name"],["balance","Balance"],["type","Type"],["branchId","Branch"]].map(([k,l]) => (
                      <th key={k} onClick={() => handleSort(k)}>{l} <SortIco k={k} /></th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.acctNum}>
                      <td><span className="acct-num">#{String(a.acctNum).padStart(3,"0")}</span></td>
                      <td><span className="acct-name">{a.name}</span></td>
                      <td><span className={a.balance >= 0 ? "balance-pos" : "balance-neg"}>{formatCurrency(a.balance)}</span></td>
                      <td><span className={`badge ${getTypeBadge(a.type)}`}>{ACCOUNT_TYPES[a.type]}</span></td>
                      <td style={{ color: "var(--text-secondary)" }}>Branch {a.branchId}</td>
                      <td>
                        <button className="card-action-btn" style={{ color: "var(--accent-red)", borderColor: "rgba(239,68,68,0.3)" }}
                          onClick={() => setDeleteId(a.acctNum)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>
    </>
  );
}

function TransactionsPage({ accounts, transactions, addTransaction }) {
  const [form,    setForm]    = useState({ src: "", dst: "", amount: "" });
  const [success, setSuccess] = useState("");
  const txns = transactions;

  const handleTransfer = async (e) => {
    e.preventDefault();
    const src = parseInt(form.src), dst = parseInt(form.dst), amt = parseFloat(form.amount);
    if (src === dst) return alert("Source and destination must differ.");
    await addTransaction({
      id: Date.now(),
      desc: `Transfer Acct #${src} → Acct #${dst}`,
      amount: -amt, type: "out", time: "Just now"
    });
    setSuccess(`₹${amt.toLocaleString()} transferred from Acct #${src} to Acct #${dst}`);
    setForm({ src: "", dst: "", amount: "" });
    setTimeout(() => setSuccess(""), 4000);
  };

  return (
    <div className="content-grid fade-in">
      <div className="card">
        <div className="card-header">
          <div><div className="card-title">Fund Transfer</div><div className="card-subtitle">Move money between accounts</div></div>
        </div>
        <div className="card-body">
          <form className="transfer-form" onSubmit={handleTransfer}>
            {success && <div className="transfer-success"><CheckCircle size={16} />{success}</div>}
            <div className="tf-row">
              <div>
                <div className="tf-label">From Account</div>
                <select className="tf-select" required value={form.src} onChange={(e) => setForm({ ...form, src: e.target.value })}>
                  <option value="">Select source…</option>
                  {accounts.map((a) => <option key={a.acctNum} value={a.acctNum}>#{a.acctNum} – {a.name}</option>)}
                </select>
              </div>
              <div>
                <div className="tf-label">To Account</div>
                <select className="tf-select" required value={form.dst} onChange={(e) => setForm({ ...form, dst: e.target.value })}>
                  <option value="">Select destination…</option>
                  {accounts.map((a) => <option key={a.acctNum} value={a.acctNum}>#{a.acctNum} – {a.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <div className="tf-label">Amount (₹)</div>
              <input className="tf-input" type="number" min="1" placeholder="Enter amount…" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <button type="submit" className="transfer-submit">
              <ArrowLeftRight size={15} style={{ display: "inline", marginRight: 6 }} /> Execute Transfer
            </button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div><div className="card-title">Transaction Log</div><div className="card-subtitle">{txns.length} entries</div></div>
          <button className="card-action-btn"><RefreshCw size={13} /> {txns.length} entries</button>
        </div>
        <div className="card-body"><TxnList txns={txns} /></div>
      </div>
    </div>
  );
}

function AnalyticsPage({ accounts }) {
  const breakdown = [0, 1, 2].map((t) => ({
    type: ACCOUNT_TYPES[t],
    count: accounts.filter((a) => a.type === t).length,
    balance: accounts.filter((a) => a.type === t).reduce((s, a) => s + a.balance, 0),
  }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        {breakdown.map(({ type, count, balance }) => (
          <div className="card fade-in" key={type}>
            <div className="card-body">
              <div className="stat-label" style={{ marginBottom: 6 }}>{type} Accounts — {count} records</div>
              <div className="stat-value" style={{ fontSize: 22 }}>{formatCurrency(balance)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="card fade-in">
        <div className="card-header"><div className="card-title">Balance by Account Type</div></div>
        <div className="card-body"><div className="chart-area">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={breakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3650" vertical={false} />
              <XAxis dataKey="type" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1a2235", border: "1px solid #2a3650", borderRadius: 8, fontSize: 13 }} formatter={(v) => [formatCurrency(v), "Balance"]} />
              <Bar dataKey="balance" fill="#10b981" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div></div>
      </div>
    </div>
  );
}

function SecurityPage() {
  const features = [
    { title: "XOR File Encryption",     desc: "All records in credit.dat are encrypted with a rotating XOR cipher before writing to disk.",            status: "Active" },
    { title: "File-Level Locking",      desc: "Windows _locking() prevents simultaneous writes, protecting data integrity during concurrent access.",  status: "Active" },
    { title: "Admin Audit Log",         desc: "Every login, logout, and admin action is timestamped and written to admin.log.",                         status: "Active" },
    { title: "Password Hashing",        desc: "Passwords are hashed with a DJB2-based hash before storage in users.dat.",                              status: "Active" },
    { title: "Automatic Backup",        desc: "credit.dat can be backed up to credit.bak at any time from the terminal (option 13).",                  status: "Ready"  },
    { title: "Customer Notifications",  desc: "Sensitive actions (transfers, loans, interest) are logged to notifications.log.",                        status: "Active" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {features.map(({ title, desc, status }) => (
        <div className="card fade-in" key={title}>
          <div className="card-body" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div className="stat-icon" style={{ flexShrink: 0, background: "rgba(16,185,129,0.15)", color: "var(--accent-emerald)", marginTop: 2 }}>
              <Shield size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 5 }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
                <span className={`badge ${status === "Active" ? "badge-checking" : "badge-savings"}`}>{status}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── ROOT ── */
export default function DashboardPage({ username, role, cryptoKey, onLogout }) {
  const [active, setActive] = useState("overview");
  const {
    accounts, setAccounts, transactions,
    loading, addAccount, removeAccount, addTransaction
  } = useBank(cryptoKey);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, background: "var(--bg-primary)", color: "var(--text-secondary)", fontSize: 14 }}>
      <div style={{ width: 36, height: 36, border: "3px solid var(--accent-blue)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      Decrypting database…
    </div>
  );

  const { title, sub } = PAGE_META[active] || {};
  const initials = username ? username.slice(0, 2).toUpperCase() : "AD";

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><Landmark size={18} color="white" /></div>
          <div className="sidebar-logo-text"><span>Fin</span>Vault</div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${active === id ? "active" : ""}`} onClick={() => setActive(id)}>
              <span className="nav-icon"><Icon size={16} /></span>{label}
            </button>
          ))}
          <div className="nav-section-label">Tools</div>
          <button className="nav-item" onClick={() => alert("Run Option 11 in the C terminal to generate CSV!")}>
            <span className="nav-icon"><Download size={16} /></span>Export Data
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-badge">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{username}</div>
              <div className="user-role">Administrator</div>
            </div>
            <button className="logout-btn" onClick={onLogout}><LogOut size={15} /></button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left"><h2>{title}</h2><p>{sub}</p></div>
          <div className="topbar-right">
            <div className="topbar-status"><span className="status-dot" />System Online</div>
          </div>
        </div>
        <div className="page-content">
          {active === "overview"     && <OverviewPage accounts={accounts} setActive={setActive} />}
          {active === "accounts"     && <AccountsPage accounts={accounts} addAccount={addAccount} removeAccount={removeAccount} />}
          {active === "transactions" && <TransactionsPage accounts={accounts} transactions={transactions} addTransaction={addTransaction} />}
          {active === "analytics"    && <AnalyticsPage accounts={accounts} />}
          {active === "security"     && <SecurityPage />}
        </div>
      </div>
    </div>
  );
}

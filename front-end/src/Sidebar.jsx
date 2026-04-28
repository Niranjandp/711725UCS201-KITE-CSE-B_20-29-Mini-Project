import {
  LayoutDashboard, Users, ArrowLeftRight, TrendingUp,
  Shield, Download, LogOut, Landmark
} from "lucide-react";

const NAV = [
  { id: "overview",      label: "Overview",      icon: LayoutDashboard },
  { id: "accounts",      label: "Accounts",      icon: Users,           badge: null },
  { id: "transactions",  label: "Transactions",  icon: ArrowLeftRight },
  { id: "analytics",     label: "Analytics",     icon: TrendingUp },
  { id: "security",      label: "Security",      icon: Shield },
];

export default function Sidebar({ active, setActive, username, onLogout }) {
  const initials = username ? username.slice(0, 2).toUpperCase() : "AD";

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Landmark size={18} color="white" />
        </div>
        <div className="sidebar-logo-text">
          <span>Fin</span>Vault
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {NAV.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            className={`nav-item ${active === id ? "active" : ""}`}
            onClick={() => setActive(id)}
          >
            <span className="nav-icon"><Icon size={16} /></span>
            {label}
            {badge && <span className="nav-badge">{badge}</span>}
          </button>
        ))}

        <div className="nav-section-label">Tools</div>
        <button className="nav-item" onClick={() => alert("Generating CSV export…")}>
          <span className="nav-icon"><Download size={16} /></span>
          Export Data
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="user-badge">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{username}</div>
            <div className="user-role">Administrator</div>
          </div>
          <button className="logout-btn" onClick={onLogout} title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}

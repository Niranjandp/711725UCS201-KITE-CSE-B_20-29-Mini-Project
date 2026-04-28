import { useState } from "react";
import { User, Lock, Eye, EyeOff, AlertCircle, Landmark, ShieldCheck } from "lucide-react";
import { deriveKey } from "./db/crypto";
import { seedDefaultUsers, verifyLogin } from "./db/database";

export default function LoginPage({ onLogin }) {
  const [form,    setForm]    = useState({ username: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [stage,   setStage]   = useState("idle"); // idle | seeding | deriving | done

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Ensure default users exist
      setStage("seeding");
      await seedDefaultUsers();

      // 2. Verify credentials against DB
      const { ok, role } = await verifyLogin(form.username, form.password);
      if (!ok) {
        setError("Invalid username or password.");
        setLoading(false);
        setStage("idle");
        return;
      }

      // 3. Derive AES-256-GCM key from password
      setStage("deriving");
      const { cryptoKey } = await deriveKey(form.password);

      // 4. Pass user + key up to App
      setStage("done");
      onLogin({ username: form.username, role, cryptoKey });
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
      setLoading(false);
      setStage("idle");
    }
  };

  const stageLabel = {
    idle:    "Sign In",
    seeding: "Initialising database…",
    deriving:"Deriving encryption key…",
    done:    "Unlocking dashboard…",
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <Landmark size={22} color="white" />
          </div>
          <div className="login-logo-text">
            <h1>FinVault Bank</h1>
            <p>Secure Banking Platform</p>
          </div>
        </div>

        <h2 className="login-title">Welcome back</h2>
        <p className="login-subtitle">Sign in to access your encrypted dashboard</p>

        {/* Encryption badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)",
          borderRadius: 8, padding: "8px 12px", marginBottom: 20, fontSize: 12,
          color: "var(--accent-emerald)"
        }}>
          <ShieldCheck size={14} />
          AES-256-GCM encrypted · PBKDF2 key derivation · IndexedDB storage
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="form-input-wrap">
              <span className="form-input-icon"><User size={16} /></span>
              <input
                className="form-input"
                type="text"
                placeholder="Enter username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-wrap">
              <span className="form-input-icon"><Lock size={16} /></span>
              <input
                className="form-input"
                type={showPwd ? "text" : "password"}
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
                required
              />
              <button type="button" className="form-eye-btn" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? stageLabel[stage] : "Sign In"}
          </button>
        </form>

        <p className="login-hint">
          Hint: <span>admin</span> / <span>admin</span> &nbsp;|&nbsp; <span>manager</span> / <span>pass123</span>
        </p>
      </div>
    </div>
  );
}

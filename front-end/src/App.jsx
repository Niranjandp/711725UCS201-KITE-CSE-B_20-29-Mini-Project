import { useState } from "react";
import LoginPage from "./LoginPage";
import DashboardPage from "./DashboardPage";
import "./index.css";

export default function App() {
  // user = { username, role, cryptoKey }
  const [user, setUser] = useState(null);

  if (!user) {
    return <LoginPage onLogin={(u) => setUser(u)} />;
  }

  return (
    <DashboardPage
      username={user.username}
      role={user.role}
      cryptoKey={user.cryptoKey}
      onLogout={() => setUser(null)}
    />
  );
}

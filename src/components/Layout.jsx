import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { PAGES } from "../config.js";

export default function Layout({ mode }) {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();
  const base = mode === "admin" ? "/admin" : "/app";

  // Users only see menu items they are allowed to view; admin sees all.
  const visiblePages = PAGES.filter((p) => mode === "admin" || can(p.key, "view"));

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">{mode === "admin" ? "Admin Panel" : "My Portal"}</div>
        <nav>
          <NavLink to={base} end>Dashboard</NavLink>
          {mode === "admin" && <NavLink to="/admin/users">User Management</NavLink>}
          <div className="nav-label">Pages</div>
          {visiblePages.map((p) => (
            <NavLink key={p.key} to={`${base}/${p.key}`}>{p.name}</NavLink>
          ))}
          {visiblePages.length === 0 && <div className="nav-empty">No pages assigned yet</div>}
          <div className="nav-label">Account</div>
          <NavLink to={`${base}/profile`}>My Profile</NavLink>
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <span className={`badge ${mode}`}>{mode === "admin" ? "ADMIN" : "USER"}</span>
          <span className="who">{user.name}</span>
          <button className="btn secondary" onClick={onLogout}>Logout</button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

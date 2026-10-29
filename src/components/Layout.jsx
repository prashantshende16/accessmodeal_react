import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import {
  LayoutDashboard,
  FolderGit2,
  AlertTriangle,
  Activity,
  Bell,
  LogOut,
  Plus,
  ShieldAlert
} from "lucide-react";

export default function Layout() {
  const { user, organizations, currentOrg, setCurrentOrg, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "Platform Overview";
    if (path.startsWith("/projects/new")) return "Connect New Project";
    if (path.startsWith("/projects")) return "Applications & SDKs";
    if (path.startsWith("/issues")) return "Exception & Issue Tracking";
    if (path.startsWith("/uptime")) return "Independent Uptime Monitoring";
    if (path.startsWith("/alerts")) return "Alerts & Incident Dispatch";
    return "ErrorWatch";
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <ShieldAlert size={18} />
          </div>
          <span>ErrorWatch</span>
        </div>

        {/* Organization Switcher */}
        {organizations && organizations.length > 0 && (
          <div className="sidebar-org-select">
            <label style={{ fontSize: "0.7rem", marginBottom: 4 }}>Organization</label>
            <select
              value={currentOrg?.id || ""}
              onChange={(e) => {
                const found = organizations.find((o) => o.id === parseInt(e.target.value));
                if (found) setCurrentOrg(found);
              }}
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation */}
        <nav>
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </NavLink>

          <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <FolderGit2 size={18} />
            <span>Projects & SDKs</span>
          </NavLink>

          <NavLink to="/issues" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <AlertTriangle size={18} />
            <span>Issues</span>
          </NavLink>

          <NavLink to="/uptime" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <Activity size={18} />
            <span>Uptime Checks</span>
          </NavLink>

          <NavLink to="/alerts" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <Bell size={18} />
            <span>Alerts & Logs</span>
          </NavLink>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="btn small secondary"
            title="Sign out"
            style={{ padding: "6px 8px" }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="topbar">
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
            {getPageTitle()}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <NavLink to="/projects/new" className="btn small">
              <Plus size={16} />
              <span>Connect Project</span>
            </NavLink>
          </div>
        </header>

        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

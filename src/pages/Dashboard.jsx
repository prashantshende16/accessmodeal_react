import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import {
  FolderGit2,
  AlertTriangle,
  Activity,
  CheckCircle2,
  ArrowRight,
  Plus,
  RefreshCw
} from "lucide-react";

export default function Dashboard() {
  const { currentOrg } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = async () => {
    setLoading(true);
    setError("");
    try {
      const orgParam = currentOrg ? `?organization_id=${currentOrg.id}` : "";
      const res = await api.get(`/dashboard/overview${orgParam}`);
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load dashboard overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, [currentOrg]);

  if (loading && !data) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center" }}>
        <div className="spinner" style={{ margin: "0 auto 12px" }}></div>
        <p style={{ color: "var(--text-muted)" }}>Loading monitoring metrics…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ borderLeft: "4px solid var(--danger)" }}>
        <h3 style={{ color: "#f87171" }}>Error loading overview</h3>
        <p style={{ color: "var(--text-muted)" }}>{error}</p>
        <button onClick={loadOverview} className="btn small secondary" style={{ marginTop: 10 }}>
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Top action header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700 }}>
            {currentOrg?.name || "Platform Overview"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            Real-time error diagnostics, issue grouping, and independent availability metrics.
          </p>
        </div>
        <button onClick={loadOverview} className="btn small secondary">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Active Projects</span>
          <span className="stat-value">{data?.total_projects || 0}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Unresolved Issues</span>
          <span className="stat-value" style={{ color: (data?.unresolved_issues || 0) > 0 ? "#f87171" : "#34d399" }}>
            {data?.unresolved_issues || 0}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Total Exceptions</span>
          <span className="stat-value">{data?.total_events || 0}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Uptime Monitors</span>
          <span className="stat-value">{data?.uptime_services || 0}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Ongoing Outages</span>
          <span className="stat-value" style={{ color: (data?.active_incidents || 0) > 0 ? "#f87171" : "#34d399" }}>
            {data?.active_incidents || 0}
          </span>
        </div>
      </div>

      {/* Two columns: Projects Health & Recent Issues */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 20 }}>
        {/* Projects Summary */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <FolderGit2 size={18} color="var(--primary)" />
              <span>Connected Applications</span>
            </h3>
            <Link to="/projects/new" className="btn small secondary">
              <Plus size={14} /> Add
            </Link>
          </div>

          {(!data?.projects_summary || data.projects_summary.length === 0) ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-muted)" }}>
              <p>No projects configured yet.</p>
              <Link to="/projects/new" className="btn small" style={{ marginTop: 8 }}>
                Connect First Project
              </Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Application</th>
                    <th>Platform</th>
                    <th>Status</th>
                    <th>Unresolved</th>
                  </tr>
                </thead>
                <tbody>
                  {data.projects_summary.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Link to={`/issues?project_id=${p.id}`} style={{ fontWeight: 600, color: "var(--primary)" }}>
                          {p.name}
                        </Link>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>{p.environment}</div>
                      </td>
                      <td>
                        <span style={{ textTransform: "capitalize", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          {p.platform}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${p.status}`}>{p.status.replace(/_/g, " ")}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: p.unresolved_issues > 0 ? "#f87171" : "inherit" }}>
                          {p.unresolved_issues}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Issues Feed */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={18} color="#f59e0b" />
              <span>Recent Issues</span>
            </h3>
            <Link to="/issues" className="btn small secondary">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {(!data?.recent_issues || data.recent_issues.length === 0) ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-muted)" }}>
              <CheckCircle2 size={32} color="#10b981" style={{ margin: "0 auto 8px" }} />
              <p>All clean! No recent unresolved errors detected.</p>
            </div>
          ) : (
            <div>
              {data.recent_issues.map((issue) => (
                <div
                  key={issue.id}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 6,
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    marginBottom: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ minWidth: 0, paddingRight: 10 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                      <span className={`badge ${issue.severity}`}>{issue.severity}</span>
                      {issue.project_name && (
                        <span style={{ fontSize: "0.75rem", background: "rgba(59,130,246,0.15)", color: "#60a5fa", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>
                          {issue.project_name}
                        </span>
                      )}
                      <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>{issue.environment}</span>
                    </div>
                    <Link
                      to={`/issues/${issue.id}`}
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        color: "var(--text-main)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block",
                      }}
                    >
                      {issue.title}
                    </Link>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-muted)" }}>
                      {issue.event_count}x
                    </span>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>events</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

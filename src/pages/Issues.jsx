import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw
} from "lucide-react";

export default function Issues() {
  const { currentOrg } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedProject = searchParams.get("project_id") || "all";
  const selectedEnv = searchParams.get("environment") || "all";
  const selectedStatus = searchParams.get("status") || "unresolved";
  const selectedSeverity = searchParams.get("severity") || "all";
  const [searchQuery, setSearchQuery] = useState("");

  const loadProjects = async () => {
    try {
      const orgParam = currentOrg ? `?organization_id=${currentOrg.id}` : "";
      const res = await api.get(`/projects${orgParam}`);
      setProjects(res);
    } catch {
      /* ignore */
    }
  };

  const loadIssues = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (selectedProject !== "all") params.append("project_id", selectedProject);
      if (selectedEnv !== "all") params.append("environment", selectedEnv);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (selectedSeverity !== "all") params.append("severity", selectedSeverity);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await api.get(`/issues?${params.toString()}`);
      setIssues(res);
    } catch (err) {
      setError(err.message || "Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [currentOrg]);

  useEffect(() => {
    loadIssues();
  }, [selectedProject, selectedEnv, selectedStatus, selectedSeverity]);

  const handleFilterChange = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === "all") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Issue Tracker</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            Aggregated and fingerprinted error events across your applications.
          </p>
        </div>
        <button onClick={loadIssues} className="btn small secondary">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div
        className="card"
        style={{
          padding: "14px 18px",
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 240px" }}>
          <Search size={16} color="var(--text-dim)" />
          <input
            type="text"
            placeholder="Search issues by title, message or type…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadIssues()}
          />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select
            value={selectedProject}
            onChange={(e) => handleFilterChange("project_id", e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="all">All Statuses</option>
            <option value="unresolved">Unresolved</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="ignored">Ignored</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => handleFilterChange("severity", e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
          </select>

          <select
            value={selectedEnv}
            onChange={(e) => handleFilterChange("environment", e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="all">All Environments</option>
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="development">Development</option>
          </select>
        </div>
      </div>

      {/* Issues Table */}
      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto 12px" }}></div>
          <p style={{ color: "var(--text-muted)" }}>Scanning issues…</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <CheckCircle2 size={36} color="#10b981" style={{ margin: "0 auto 12px" }} />
          <h3>No matching issues found</h3>
          <p style={{ color: "var(--text-muted)" }}>
            Try adjusting your search criteria or filter options.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Issue</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Environment</th>
                  <th>Events</th>
                  <th>Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600 }}>
                          {issue.exception_type}
                        </span>
                      </div>
                      <Link
                        to={`/issues/${issue.id}`}
                        style={{
                          fontWeight: 600,
                          fontSize: "0.92rem",
                          color: "var(--text-main)",
                          display: "block",
                          maxWidth: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {issue.title}
                      </Link>
                    </td>
                    <td>
                      <span className={`badge ${issue.severity}`}>{issue.severity}</span>
                    </td>
                    <td>
                      <span className={`badge ${issue.status}`}>{issue.status.replace(/_/g, " ")}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                        {issue.environment}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{issue.event_count}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
                        {new Date(issue.last_seen).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

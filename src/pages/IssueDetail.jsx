import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api.js";
import {
  AlertTriangle,
  CheckCircle,
  EyeOff,
  Clock,
  Code2,
  ListOrdered,
  Globe,
  Tag,
  ArrowLeft
} from "lucide-react";

export default function IssueDetail() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadIssue = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/issues/${id}`);
      setIssue(res);
    } catch (err) {
      setError(err.message || "Failed to load issue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssue();
  }, [id]);

  const updateStatus = async (status) => {
    setActionLoading(true);
    try {
      const updated = await api.put(`/issues/${id}/status`, { status });
      setIssue((prev) => ({ ...prev, status: updated.status }));
    } catch (err) {
      alert("Failed to update issue status: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center" }}>
        <div className="spinner" style={{ margin: "0 auto 12px" }}></div>
        <p style={{ color: "var(--text-muted)" }}>Loading issue diagnostics…</p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="card" style={{ borderLeft: "4px solid var(--danger)" }}>
        <h3>Error loading issue</h3>
        <p style={{ color: "var(--text-muted)" }}>{error || "Issue not found"}</p>
        <Link to="/issues" className="btn small secondary" style={{ marginTop: 10 }}>
          <ArrowLeft size={14} /> Back to Issues
        </Link>
      </div>
    );
  }

  const latest = issue.latest_event;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Link to="/issues" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "var(--text-muted)" }}>
          <ArrowLeft size={14} /> Back to Issues
        </Link>
      </div>

      {/* Header Card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <span className={`badge ${issue.severity}`}>{issue.severity}</span>
              <span className={`badge ${issue.status}`}>{issue.status.replace(/_/g, " ")}</span>
              <span style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>{issue.environment}</span>
            </div>
            <h1 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "0 0 8px" }}>
              {issue.title}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontFamily: "monospace" }}>
              {issue.message}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {issue.status !== "resolved" ? (
              <button
                onClick={() => updateStatus("resolved")}
                disabled={actionLoading}
                className="btn small"
                style={{ background: "#10b981" }}
              >
                <CheckCircle size={15} /> Resolve
              </button>
            ) : (
              <button
                onClick={() => updateStatus("unresolved")}
                disabled={actionLoading}
                className="btn small secondary"
              >
                Re-open
              </button>
            )}

            {issue.status !== "in_progress" && (
              <button
                onClick={() => updateStatus("in_progress")}
                disabled={actionLoading}
                className="btn small secondary"
              >
                In Progress
              </button>
            )}

            {issue.status !== "ignored" && (
              <button
                onClick={() => updateStatus("ignored")}
                disabled={actionLoading}
                className="btn small secondary"
              >
                <EyeOff size={15} /> Ignore
              </button>
            )}
          </div>
        </div>

        {/* Quick meta bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12,
            marginTop: 18,
            paddingTop: 16,
            borderTop: "1px solid var(--border)",
            fontSize: "0.82rem",
          }}
        >
          <div>
            <span style={{ color: "var(--text-dim)" }}>Occurrences</span>
            <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#fff" }}>{issue.event_count} events</div>
          </div>
          <div>
            <span style={{ color: "var(--text-dim)" }}>Users Impacted</span>
            <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#fff" }}>{issue.user_count}</div>
          </div>
          <div>
            <span style={{ color: "var(--text-dim)" }}>First Seen</span>
            <div style={{ fontWeight: 600, color: "var(--text-muted)" }}>{new Date(issue.first_seen).toLocaleString()}</div>
          </div>
          <div>
            <span style={{ color: "var(--text-dim)" }}>Last Seen</span>
            <div style={{ fontWeight: 600, color: "var(--text-muted)" }}>{new Date(issue.last_seen).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Main Diagnostics Section */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Left Column: Stack Trace & Breadcrumbs */}
        <div>
          {/* Stacktrace */}
          <div className="card">
            <h3 style={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Code2 size={18} color="var(--primary)" />
              <span>Stack Trace (Latest Occurrence)</span>
            </h3>

            {(!latest?.stacktrace || latest.stacktrace.length === 0) ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No stack frames recorded for this event.
              </p>
            ) : (
              <div>
                {latest.stacktrace.map((frame, idx) => (
                  <div key={idx} className="stack-frame">
                    <div className="stack-frame-header">
                      <span style={{ color: frame.in_app ? "var(--primary)" : "var(--text-dim)", fontWeight: 600 }}>
                        {frame.function || "anonymous"}
                      </span>
                      <span style={{ fontSize: "0.78rem" }}>
                        {frame.filename}:{frame.lineno}
                        {frame.colno ? `:${frame.colno}` : ""}
                      </span>
                    </div>
                    {frame.code && (
                      <div className="stack-frame-code">
                        {frame.code}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Breadcrumbs Timeline */}
          <div className="card">
            <h3 style={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <ListOrdered size={18} color="#f59e0b" />
              <span>Breadcrumb History</span>
            </h3>

            {(!latest?.breadcrumbs || latest.breadcrumbs.length === 0) ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No breadcrumbs recorded before this error.
              </p>
            ) : (
              <div>
                {latest.breadcrumbs.map((b, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "8px 12px",
                      borderLeft: "2px solid var(--border)",
                      marginLeft: 8,
                      marginBottom: 8,
                      fontSize: "0.85rem",
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: 2 }}>
                      <span style={{ textTransform: "uppercase", fontWeight: 700 }}>{b.category}</span>
                      <span>{b.level}</span>
                    </div>
                    <div style={{ color: "var(--text-main)" }}>{b.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Request Context, User, & Tags */}
        <div>
          {/* Request Context */}
          <div className="card">
            <h3 style={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Globe size={18} color="#38bdf8" />
              <span>Request Context</span>
            </h3>
            {latest?.request_context?.url ? (
              <div style={{ fontSize: "0.82rem" }}>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ color: "var(--text-dim)" }}>Method:</span>{" "}
                  <code style={{ color: "var(--primary)" }}>{latest.request_context.method || "GET"}</code>
                </div>
                <div style={{ marginBottom: 6, wordBreak: "break-all" }}>
                  <span style={{ color: "var(--text-dim)" }}>URL:</span>{" "}
                  <code>{latest.request_context.url}</code>
                </div>
                {latest.request_context.headers && (
                  <div>
                    <span style={{ color: "var(--text-dim)" }}>Headers:</span>
                    <pre className="code-block" style={{ fontSize: "0.75rem", marginTop: 4, padding: 8 }}>
                      {JSON.stringify(latest.request_context.headers, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No HTTP request metadata available.
              </p>
            )}
          </div>

          {/* User Context */}
          <div className="card">
            <h3 style={{ fontSize: "1rem", marginBottom: 10 }}>Affected User</h3>
            {latest?.user_context?.id || latest?.user_context?.email ? (
              <div style={{ fontSize: "0.85rem" }}>
                {latest.user_context.email && (
                  <div><b>Email:</b> {latest.user_context.email}</div>
                )}
                {latest.user_context.id && (
                  <div><b>User ID:</b> {latest.user_context.id}</div>
                )}
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Anonymous user / Unassigned session.
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="card">
            <h3 style={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Tag size={16} color="var(--primary)" />
              <span>Tags & Runtime</span>
            </h3>
            {latest?.tags && Object.keys(latest.tags).length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {Object.entries(latest.tags).map(([k, v]) => (
                  <span
                    key={k}
                    style={{
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    <b>{k}:</b> {String(v)}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No tags attached.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import {
  Activity,
  Plus,
  Play,
  Trash2,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  ExternalLink
} from "lucide-react";

export default function Uptime() {
  const { currentOrg } = useAuth();
  const [checks, setChecks] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [projectId, setProjectId] = useState("");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("https://httpbin.org/status/200");
  const [method, setMethod] = useState("GET");
  const [expectedStatus, setExpectedStatus] = useState(200);
  const [intervalSeconds, setIntervalSeconds] = useState(60);

  const loadData = async () => {
    setLoading(true);
    try {
      const orgParam = currentOrg ? `?organization_id=${currentOrg.id}` : "";
      const [checksRes, incRes, projRes] = await Promise.all([
        api.get(`/uptime/checks`),
        api.get(`/uptime/incidents`),
        api.get(`/projects${orgParam}`),
      ]);
      setChecks(checksRes);
      setIncidents(incRes);
      setProjects(projRes);
      if (projRes.length > 0 && !projectId) {
        setProjectId(projRes[0].id);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentOrg]);

  const handleRunNow = async (id) => {
    setRunningId(id);
    try {
      await api.post(`/uptime/checks/${id}/run`);
      await loadData();
    } catch (err) {
      alert("Check run failed: " + err.message);
    } finally {
      setRunningId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this uptime check?")) return;
    try {
      await api.del(`/uptime/checks/${id}`);
      setChecks((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleCreateCheck = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/uptime/checks?project_id=${projectId}`, {
        name,
        url,
        method,
        expected_status: parseInt(expectedStatus),
        interval_seconds: parseInt(intervalSeconds),
      });
      setShowModal(false);
      setName("");
      loadData();
    } catch (err) {
      alert("Failed to create check: " + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Independent Uptime Monitoring</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            External heartbeat health checks run independently outside the monitored application process.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={loadData} className="btn small secondary">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setShowModal(true)} className="btn small">
            <Plus size={16} /> New Uptime Check
          </button>
        </div>
      </div>

      {/* Ongoing Incidents Alert */}
      {incidents.filter((i) => i.status === "ongoing").length > 0 && (
        <div
          style={{
            padding: "16px 20px",
            borderRadius: 8,
            background: "var(--danger-bg)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#f87171",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <AlertOctagon size={24} />
          <div>
            <div style={{ fontWeight: 700 }}>Active Service Outage Detected</div>
            <div style={{ fontSize: "0.85rem" }}>
              One or more external endpoints are failing their health checks.
            </div>
          </div>
        </div>
      )}

      {/* Uptime Checks Table */}
      <div className="card" style={{ padding: 0, marginBottom: 24 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Service Check</th>
                <th>Target URL</th>
                <th>Status</th>
                <th>Response Time</th>
                <th>Availability</th>
                <th>Last Checked</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {checks.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
                    No uptime checks configured yet. Add an endpoint to begin monitoring availability.
                  </td>
                </tr>
              ) : (
                checks.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                        {c.method} • Expects {c.expected_status}
                      </div>
                    </td>
                    <td>
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        <span style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.url}
                        </span>
                        <ExternalLink size={12} />
                      </a>
                    </td>
                    <td>
                      <span className={`badge ${c.status}`}>{c.status}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "#cbd5e1" }}>
                        {c.last_latency_ms ? `${c.last_latency_ms} ms` : "—"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: c.uptime_percentage >= 99 ? "#34d399" : "#f87171" }}>
                        {c.uptime_percentage}%
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
                        {c.last_check_at ? new Date(c.last_check_at).toLocaleTimeString() : "Pending"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleRunNow(c.id)}
                          disabled={runningId === c.id}
                          className="btn small secondary"
                          title="Trigger immediate probe"
                        >
                          <Play size={12} />
                          <span>{runningId === c.id ? "Probing…" : "Probe"}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="btn small danger"
                          title="Delete check"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident History Feed */}
      <div className="card">
        <h3 style={{ fontSize: "1.05rem", marginBottom: 14 }}>Outage & Incident History</h3>
        {incidents.length === 0 ? (
          <div style={{ padding: "16px 0", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle2 size={18} color="#10b981" />
            <span>No incidents recorded. Clean uptime history!</span>
          </div>
        ) : (
          <div>
            {incidents.map((inc) => (
              <div
                key={inc.id}
                style={{
                  padding: "12px 16px",
                  borderRadius: 6,
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border)",
                  marginBottom: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <span className={`badge ${inc.status === "ongoing" ? "down" : "resolved"}`}>
                      {inc.status}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
                      Started {new Date(inc.started_at).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{inc.message}</div>
                </div>
                {inc.resolved_at && (
                  <div style={{ fontSize: "0.8rem", color: "#34d399", textAlign: "right" }}>
                    Resolved at {new Date(inc.resolved_at).toLocaleTimeString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "1.15rem", marginBottom: 16 }}>Configure External Uptime Check</h3>
            <form onSubmit={handleCreateCheck}>
              <div style={{ marginBottom: 14 }}>
                <label>Target Project</label>
                <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label>Monitor Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Production API Gateway /healthz"
                  required
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label>Endpoint URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-service.com/healthz"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div>
                  <label>HTTP Method</label>
                  <select value={method} onChange={(e) => setMethod(e.target.value)}>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="HEAD">HEAD</option>
                  </select>
                </div>
                <div>
                  <label>Expected Status Code</label>
                  <input
                    type="number"
                    value={expectedStatus}
                    onChange={(e) => setExpectedStatus(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn secondary">
                  Cancel
                </button>
                <button type="submit" className="btn">
                  Create & Run First Probe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


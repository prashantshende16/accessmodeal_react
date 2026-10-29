import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import {
  Bell,
  Plus,
  Send,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Mail,
  Webhook
} from "lucide-react";

export default function Alerts() {
  const { currentOrg } = useAuth();
  const [rules, setRules] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [projectId, setProjectId] = useState("");
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState("new_issue");
  const [channel, setChannel] = useState("in_app");
  const [destination, setDestination] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const orgParam = currentOrg ? `?organization_id=${currentOrg.id}` : "";
      const [rulesRes, delRes, projRes] = await Promise.all([
        api.get("/alerts/rules"),
        api.get("/alerts/deliveries"),
        api.get(`/projects${orgParam}`),
      ]);
      setRules(rulesRes);
      setDeliveries(delRes);
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

  const handleTestAlert = async (ruleId) => {
    setTestingId(ruleId);
    try {
      await api.post(`/alerts/rules/${ruleId}/test`);
      await loadData();
    } catch (err) {
      alert("Failed to send test alert: " + err.message);
    } finally {
      setTestingId(null);
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/alerts/rules?project_id=${projectId}`, {
        name,
        trigger_type: triggerType,
        channel,
        destination,
      });
      setShowModal(false);
      setName("");
      setDestination("");
      loadData();
    } catch (err) {
      alert("Failed to create rule: " + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Alerts & Notifications</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            Automated notifications for new exceptions, error frequency spikes, and uptime failures.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={loadData} className="btn small secondary">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setShowModal(true)} className="btn small">
            <Plus size={16} /> New Alert Rule
          </button>
        </div>
      </div>

      {/* Two columns: Alert Rules & Delivery Log */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 20 }}>
        {/* Rules Column */}
        <div className="card">
          <h3 style={{ fontSize: "1.05rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Bell size={18} color="var(--primary)" />
            <span>Configured Alert Rules</span>
          </h3>

          {rules.length === 0 ? (
            <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)" }}>
              <p>No alert rules configured.</p>
              <button onClick={() => setShowModal(true)} className="btn small" style={{ marginTop: 8 }}>
                Add Rule
              </button>
            </div>
          ) : (
            <div>
              {rules.map((r) => (
                <div
                  key={r.id}
                  style={{
                    padding: "14px",
                    borderRadius: 8,
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    marginBottom: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.92rem", marginBottom: 4 }}>{r.name}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: "0.78rem" }}>
                      <span className="badge warning">{r.trigger_type.replace(/_/g, " ")}</span>
                      <span className="badge in_progress">{r.channel.replace(/_/g, " ")}</span>
                      {r.destination && (
                        <span style={{ color: "var(--text-dim)" }}>→ {r.destination}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleTestAlert(r.id)}
                    disabled={testingId === r.id}
                    className="btn small secondary"
                    title="Send a sample notification"
                  >
                    <Send size={13} />
                    <span>{testingId === r.id ? "Sending…" : "Test"}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delivery History Log */}
        <div className="card">
          <h3 style={{ fontSize: "1.05rem", marginBottom: 16 }}>Notification Delivery Log</h3>
          {deliveries.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              No notification dispatches recorded yet.
            </p>
          ) : (
            <div style={{ maxHeight: 400, overflowY: "auto" }}>
              {deliveries.map((d) => (
                <div
                  key={d.id}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 6,
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    marginBottom: 8,
                    fontSize: "0.85rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{d.title}</span>
                    <span className="badge resolved" style={{ fontSize: "0.7rem" }}>{d.status}</span>
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", whiteSpace: "pre-line" }}>
                    {d.message}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: 4 }}>
                    {new Date(d.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Rule Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "1.15rem", marginBottom: 16 }}>Create Alert Rule</h3>
            <form onSubmit={handleCreateRule}>
              <div style={{ marginBottom: 14 }}>
                <label>Target Project</label>
                <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label>Rule Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Production Critical Error Alert"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label>Trigger Condition</label>
                  <select value={triggerType} onChange={(e) => setTriggerType(e.target.value)}>
                    <option value="new_issue">New Issue Detected</option>
                    <option value="uptime_failure">Uptime Check Outage</option>
                    <option value="error_spike">Error Rate Spike</option>
                  </select>
                </div>
                <div>
                  <label>Notification Channel</label>
                  <select value={channel} onChange={(e) => setChannel(e.target.value)}>
                    <option value="in_app">In-App Notification</option>
                    <option value="webhook">Webhook HTTP POST</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>

              {channel !== "in_app" && (
                <div style={{ marginBottom: 16 }}>
                  <label>{channel === "webhook" ? "Webhook URL" : "Destination Email"}</label>
                  <input
                    type={channel === "webhook" ? "url" : "email"}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder={channel === "webhook" ? "https://hooks.slack.com/services/..." : "oncall@company.com"}
                    required
                  />
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn secondary">
                  Cancel
                </button>
                <button type="submit" className="btn">
                  Save Alert Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

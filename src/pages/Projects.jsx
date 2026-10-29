import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import {
  FolderGit2,
  Plus,
  Copy,
  Check,
  Send,
  ExternalLink,
  RefreshCw
} from "lucide-react";

export default function Projects() {
  const { currentOrg } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [testingId, setTestingId] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const orgParam = currentOrg ? `?organization_id=${currentOrg.id}` : "";
      const res = await api.get(`/projects${orgParam}`);
      setProjects(res);
    } catch (err) {
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [currentOrg]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendTestEvent = async (projectId) => {
    setTestingId(projectId);
    setTestResult(null);
    try {
      const res = await api.post(`/projects/${projectId}/test-event`);
      setTestResult({ success: true, message: res.message, id: projectId });
      loadProjects();
    } catch (err) {
      setTestResult({ success: false, message: err.message, id: projectId });
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Monitored Applications</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            Applications instrumented with ErrorWatch SDKs and credentials.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={loadProjects} className="btn small secondary">
            <RefreshCw size={14} /> Refresh
          </button>
          <Link to="/projects/new" className="btn small">
            <Plus size={16} /> Connect Application
          </Link>
        </div>
      </div>

      {testResult && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 20,
            background: testResult.success ? "var(--success-bg)" : "var(--danger-bg)",
            color: testResult.success ? "#34d399" : "#f87171",
            border: `1px solid ${testResult.success ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{testResult.message}</span>
          <button
            onClick={() => setTestResult(null)}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto 12px" }}></div>
          <p style={{ color: "var(--text-muted)" }}>Loading applications…</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <FolderGit2 size={40} color="var(--primary)" style={{ margin: "0 auto 12px" }} />
          <h3>No applications connected</h3>
          <p style={{ color: "var(--text-muted)", maxWidth: 450, margin: "0 auto 16px" }}>
            Add an application to get a project credential and step-by-step SDK installation instructions for React, FastAPI, Node, or Python.
          </p>
          <Link to="/projects/new" className="btn">
            <Plus size={16} /> Add First Application
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Platform</th>
                  <th>Environment</th>
                  <th>Client Ingestion Key (DSN)</th>
                  <th>Status</th>
                  <th>Last Event</th>
                  <th>Verification</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const clientKey = p.credentials?.[0]?.client_key || "none";
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>ID: {p.id}</div>
                      </td>
                      <td>
                        <span style={{ textTransform: "capitalize", fontWeight: 500 }}>
                          {p.platform}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                          {p.environment}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <code style={{ fontSize: "0.78rem", background: "#090d16", padding: "3px 6px", borderRadius: 4, color: "#cbd5e1" }}>
                            {clientKey.slice(0, 16)}…
                          </code>
                          <button
                            onClick={() => copyToClipboard(clientKey, p.id)}
                            className="btn small secondary"
                            style={{ padding: "4px 6px" }}
                            title="Copy Client Ingestion Key"
                          >
                            {copiedId === p.id ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${p.status}`}>
                          {p.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>
                          {p.last_event_at ? new Date(p.last_event_at).toLocaleString() : "None yet"}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => sendTestEvent(p.id)}
                          disabled={testingId === p.id}
                          className="btn small secondary"
                          title="Transmit a verified sample exception to test ingestion"
                        >
                          <Send size={13} />
                          <span>{testingId === p.id ? "Sending…" : "Test Event"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

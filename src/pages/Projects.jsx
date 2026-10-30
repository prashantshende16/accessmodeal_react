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
  RefreshCw,
  Code2,
  Bug,
  Trash2,
  AlertTriangle
} from "lucide-react";

export default function Projects() {
  const { currentOrg } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [testingId, setTestingId] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // Setup Modal state
  const [selectedProjectForSnippet, setSelectedProjectForSnippet] = useState(null);
  const [snippetCopied, setSnippetCopied] = useState(false);

  // Custom Test Modal state
  const [customTestProject, setCustomTestProject] = useState(null);
  const [customErrorType, setCustomErrorType] = useState("TypeError");
  const [customMessage, setCustomMessage] = useState("");
  const [customFilename, setCustomFilename] = useState("");

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

  const sendQuickTestEvent = async (projectId) => {
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

  const sendCustomTestEvent = async (e) => {
    e.preventDefault();
    if (!customTestProject) return;
    setTestingId(customTestProject.id);
    setTestResult(null);
    try {
      const res = await api.post(`/projects/${customTestProject.id}/test-event`, {
        error_type: customErrorType,
        message: customMessage || `Custom test exception in ${customTestProject.name}`,
        filename: customFilename || `src/${customTestProject.name}.jsx`,
      });
      setTestResult({ success: true, message: res.message, id: customTestProject.id });
      setCustomTestProject(null);
      loadProjects();
    } catch (err) {
      alert("Failed to send custom test event: " + err.message);
    } finally {
      setTestingId(null);
    }
  };

  const deleteProject = async (p) => {
    if (!window.confirm(`Delete project "${p.name}" and all its issues?`)) return;
    try {
      await api.del(`/projects/${p.id}`);
      setProjects((prev) => prev.filter((item) => item.id !== p.id));
    } catch (err) {
      alert("Failed to delete project: " + err.message);
    }
  };

  const getSdkSnippet = (p) => {
    const key = p.credentials?.[0]?.client_key || "YOUR_CLIENT_KEY";
    if (p.platform === "react") {
      return `// 1. In your React App (${p.name}):
// Install or embed this listener in src/main.jsx or src/index.js:

window.addEventListener("error", (event) => {
  fetch("http://127.0.0.1:8000/api/v1/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-ErrorWatch-Key": "${key}"
    },
    body: JSON.stringify({
      exception: {
        type: event.error?.name || "Error",
        message: event.message || "Unhandled error in ${p.name}",
        stacktrace: [
          { filename: event.filename, lineno: event.lineno, colno: event.colno, function: "window.onerror", in_app: true }
        ]
      },
      environment: "${p.environment}",
      release: "1.0.0"
    })
  }).catch(() => {});
});`;
    }

    if (p.platform === "fastapi" || p.platform === "python") {
      return `# 1. In your Python / FastAPI App (${p.name}):
from fastapi import FastAPI, Request
import httpx, traceback

app = FastAPI()

ERRORWATCH_KEY = "${key}"
ERRORWATCH_INGEST_URL = "http://127.0.0.1:8000/api/v1/events"

@app.middleware("http")
async def errorwatch_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as exc:
        frames = [
            {"filename": f.filename, "function": f.name, "lineno": f.lineno, "in_app": True}
            for f in traceback.extract_tb(exc.__traceback__)
        ]
        try:
            with httpx.Client(timeout=2.0) as client:
                client.post(
                    ERRORWATCH_INGEST_URL,
                    headers={"X-ErrorWatch-Key": ERRORWATCH_KEY},
                    json={
                        "exception": {"type": type(exc).__name__, "message": str(exc), "stacktrace": frames},
                        "environment": "${p.environment}",
                        "request": {"method": request.method, "url": str(request.url)}
                    }
                )
        except Exception:
            pass
        raise exc`;
    }

    return `// Generic HTTP Ingestion for ${p.name}:
curl -X POST http://127.0.0.1:8000/api/v1/events \\
  -H "Content-Type: application/json" \\
  -H "X-ErrorWatch-Key: ${key}" \\
  -d '{
    "exception": {
      "type": "RuntimeError",
      "message": "Error occurred in ${p.name}",
      "stacktrace": []
    },
    "environment": "${p.environment}"
  }'`;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Monitored Applications</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            Applications instrumented with ErrorWatch SDKs and client ingestion credentials.
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
            Add an application to get a project credential and step-by-step SDK installation instructions.
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
                  <th>Client Ingestion Key (DSN)</th>
                  <th>Status</th>
                  <th>Last Event</th>
                  <th>Actions & Testing</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const clientKey = p.credentials?.[0]?.client_key || "none";
                  return (
                    <tr key={p.id}>
                      <td>
                        <Link to={`/issues?project_id=${p.id}`} style={{ fontWeight: 600, color: "var(--primary)" }}>
                          {p.name}
                        </Link>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
                          Env: {p.environment} • ID: {p.id}
                        </div>
                      </td>
                      <td>
                        <span style={{ textTransform: "capitalize", fontWeight: 500 }}>
                          {p.platform}
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
                          {p.last_event_at ? new Date(p.last_event_at).toLocaleTimeString() : "None yet"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                          <button
                            onClick={() => {
                              setSelectedProjectForSnippet(p);
                              setSnippetCopied(false);
                            }}
                            className="btn small secondary"
                            title="View SDK code snippet"
                          >
                            <Code2 size={13} />
                            <span>Setup</span>
                          </button>

                          <button
                            onClick={() => sendQuickTestEvent(p.id)}
                            disabled={testingId === p.id}
                            className="btn small"
                            title="Emit dynamic test exception for this application"
                          >
                            <Send size={13} />
                            <span>{testingId === p.id ? "Sending…" : "Test Event"}</span>
                          </button>

                          <button
                            onClick={() => {
                              setCustomTestProject(p);
                              setCustomMessage(`Unhandled exception in ${p.name}`);
                              setCustomFilename(`src/pages/${p.name.replace(/\s+/g, "")}.jsx`);
                            }}
                            className="btn small secondary"
                            title="Send custom test error"
                          >
                            <Bug size={13} />
                          </button>

                          <button
                            onClick={() => deleteProject(p)}
                            className="btn small danger"
                            style={{ padding: "4px 8px" }}
                            title="Delete this project"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SDK Setup Modal */}
      {selectedProjectForSnippet && (
        <div className="modal-backdrop" onClick={() => setSelectedProjectForSnippet(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: 8 }}>
                <Code2 size={20} color="var(--primary)" />
                <span>SDK Integration: {selectedProjectForSnippet.name}</span>
              </h3>
              <button
                onClick={() => setSelectedProjectForSnippet(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 12 }}>
              Paste this into your real application code. Any unhandled exception will automatically be captured, grouped, and displayed in ErrorWatch.
            </p>

            <pre className="code-block" style={{ margin: 0, marginBottom: 16 }}>
              {getSdkSnippet(selectedProjectForSnippet)}
            </pre>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getSdkSnippet(selectedProjectForSnippet));
                  setSnippetCopied(true);
                  setTimeout(() => setSnippetCopied(false), 2000);
                }}
                className="btn"
              >
                {snippetCopied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                <span>{snippetCopied ? "Copied to Clipboard!" : "Copy Snippet"}</span>
              </button>
              <button onClick={() => setSelectedProjectForSnippet(null)} className="btn secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Test Error Modal */}
      {customTestProject && (
        <div className="modal-backdrop" onClick={() => setCustomTestProject(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <h3 style={{ fontSize: "1.15rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Bug size={20} color="#f59e0b" />
              <span>Simulate Custom Error for {customTestProject.name}</span>
            </h3>

            <form onSubmit={sendCustomTestEvent}>
              <div style={{ marginBottom: 14 }}>
                <label>Exception Type</label>
                <select value={customErrorType} onChange={(e) => setCustomErrorType(e.target.value)}>
                  <option value="TypeError">TypeError</option>
                  <option value="AxiosError">AxiosError (Network Failure)</option>
                  <option value="ReferenceError">ReferenceError</option>
                  <option value="SyntaxError">SyntaxError</option>
                  <option value="ChunkLoadError">ChunkLoadError</option>
                  <option value="OperationalError">OperationalError (Database)</option>
                  <option value="CustomError">Custom Application Error</option>
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label>Error Message</label>
                <input
                  type="text"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="e.g. Failed to load user profile data"
                  required
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label>Component / File Name</label>
                <input
                  type="text"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  placeholder="e.g. src/pages/Profile.jsx"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setCustomTestProject(null)} className="btn secondary">
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={testingId === customTestProject.id}>
                  <Send size={15} />
                  <span>{testingId === customTestProject.id ? "Transmitting…" : "Emit Custom Error"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

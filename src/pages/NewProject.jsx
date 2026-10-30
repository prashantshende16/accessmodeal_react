import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import {
  FolderGit2,
  Copy,
  Check,
  Send,
  CheckCircle2,
  ArrowRight,
  Code2
} from "lucide-react";

export default function NewProject() {
  const { currentOrg } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Form, 2: SDK Snippet & Verification
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("react");
  const [environment, setEnvironment] = useState("production");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdProject, setCreatedProject] = useState(null);
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!currentOrg) {
      setError("Please select or create an organization first.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await api.post(`/projects?organization_id=${currentOrg.id}`, {
        name,
        platform,
        environment,
        description,
      });
      setCreatedProject(res);
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const clientKey = createdProject?.credentials?.[0]?.client_key || "YOUR_CLIENT_KEY";

  const getSdkSnippet = () => {
    if (platform === "react") {
      return `// 1. Install or import ErrorWatch client in your React application:
// npm install or embed this lightweight listener:

window.addEventListener("error", (event) => {
  fetch("http://127.0.0.1:8000/api/v1/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-ErrorWatch-Key": "${clientKey}"
    },
    body: JSON.stringify({
      exception: {
        type: event.error?.name || "Error",
        message: event.message || "Unhandled error",
        stacktrace: [
          { filename: event.filename, lineno: event.lineno, colno: event.colno, function: "window.onerror", in_app: true }
        ]
      },
      environment: "${environment}",
      release: "1.0.0"
    })
  });
});`;
    }

    if (platform === "fastapi" || platform === "python") {
      return `# 1. Add ErrorWatch exception middleware in your FastAPI app:
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import httpx, traceback

app = FastAPI()

ERRORWATCH_KEY = "${clientKey}"
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
                        "environment": "${environment}",
                        "request": {"method": request.method, "url": str(request.url)}
                    }
                )
        except Exception:
            pass
        raise exc`;
    }

    return `// Generic HTTP Ingestion:
curl -X POST http://127.0.0.1:8000/api/v1/events \\
  -H "Content-Type: application/json" \\
  -H "X-ErrorWatch-Key: ${clientKey}" \\
  -d '{
    "exception": {
      "type": "RuntimeError",
      "message": "Service process failed unexpectedly",
      "stacktrace": []
    },
    "environment": "${environment}"
  }'`;
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(getSdkSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendVerificationTest = async () => {
    if (!createdProject) return;
    setLoading(true);
    try {
      const res = await api.post(`/projects/${createdProject.id}/test-event`);
      setTestStatus({ success: true, message: res.message });
      setCreatedProject({ ...createdProject, status: "connected" });
    } catch (err) {
      setTestStatus({ success: false, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <Link to="/projects" style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "inline-block", marginBottom: 8 }}>
          ← Back to Projects
        </Link>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Connect New Application</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
          Step-by-step onboarding wizard to register and instrument your service.
        </p>
      </div>

      {step === 1 && (
        <form onSubmit={handleCreate} className="card">
          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 6, background: "var(--danger-bg)", color: "#f87171", marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label>Project / Service Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Payments Microservice, Customer Dashboard"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label>Platform / Framework</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                <option value="react">React / Vite</option>
                <option value="fastapi">Python / FastAPI</option>
                <option value="node">Node.js / Express</option>
                <option value="python">Generic Python</option>
                <option value="flutter">Flutter</option>
                <option value="generic">Generic HTTP Ingestion</option>
              </select>
            </div>

            <div>
              <label>Environment</label>
              <select value={environment} onChange={(e) => setEnvironment(e.target.value)}>
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label>Description (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this service and its role"
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Link to="/projects" className="btn secondary">
              Cancel
            </Link>
            <button type="submit" className="btn" disabled={loading}>
              <span>{loading ? "Generating Credential…" : "Generate Ingestion Key & Instructions"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}

      {step === 2 && createdProject && (
        <div>
          {/* Success banner */}
          <div
            style={{
              padding: "16px 20px",
              borderRadius: 8,
              background: "var(--success-bg)",
              border: "1px solid rgba(16,185,129,0.2)",
              color: "#34d399",
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <CheckCircle2 size={24} />
            <div>
              <div style={{ fontWeight: 700 }}>Project Created: {createdProject.name}</div>
              <div style={{ fontSize: "0.85rem" }}>
                Credential generated and assigned. Install the SDK snippet below and send a test event.
              </div>
            </div>
          </div>

          {/* DSN Credentials Card */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: "1rem", marginBottom: 12 }}>Ingestion DSN & Public Key</h3>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="text"
                readOnly
                value={clientKey}
                style={{ background: "#090d16", fontFamily: "monospace", color: "#38bdf8" }}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(clientKey);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="btn secondary"
                style={{ flexShrink: 0 }}
              >
                {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                <span>{copied ? "Copied" : "Copy Key"}</span>
              </button>
            </div>
          </div>

          {/* Code Snippet Card */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
                <Code2 size={18} color="var(--primary)" />
                <span>Integration Snippet ({platform.toUpperCase()})</span>
              </h3>
              <button onClick={copySnippet} className="btn small secondary">
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>Copy Snippet</span>
              </button>
            </div>
            <pre className="code-block" style={{ margin: 0 }}>
              {getSdkSnippet()}
            </pre>
          </div>

          {/* Test Verification Action */}
          <div className="card" style={{ textAlign: "center", padding: 24 }}>
            <h3 style={{ fontSize: "1.1rem" }}>Verify Integration</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", maxWidth: 460, margin: "0 auto 16px" }}>
              Trigger a verified test exception through the ErrorWatch ingestion pipeline to confirm end-to-end receipt.
            </p>

            {testStatus && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 6,
                  marginBottom: 16,
                  background: testStatus.success ? "var(--success-bg)" : "var(--danger-bg)",
                  color: testStatus.success ? "#34d399" : "#f87171",
                  fontSize: "0.88rem",
                }}
              >
                {testStatus.message}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <button onClick={sendVerificationTest} className="btn" disabled={loading}>
                <Send size={16} />
                <span>{loading ? "Transmitting…" : "Transmit Verified Test Event"}</span>
              </button>
              <button onClick={() => navigate("/issues")} className="btn secondary">
                <span>Go to Issues Dashboard</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


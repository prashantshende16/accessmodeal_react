import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { ShieldAlert, LogIn, UserPlus } from "lucide-react";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-screen">
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            marginBottom: 12,
          }}
        >
          <ShieldAlert size={28} />
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800 }}>ErrorWatch</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Universal Application Error Monitoring Platform
        </p>
      </div>

      <div className="login-card">
        {/* Tab switch */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(""); }}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "none",
              border: "none",
              borderBottom: !isRegister ? "2px solid var(--primary)" : "none",
              color: !isRegister ? "var(--primary)" : "var(--text-muted)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(""); }}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "none",
              border: "none",
              borderBottom: isRegister ? "2px solid var(--primary)" : "none",
              color: isRegister ? "var(--primary)" : "var(--text-muted)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Register Account
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 6,
              background: "var(--danger-bg)",
              color: "#f87171",
              border: "1px solid rgba(239,68,68,0.2)",
              marginBottom: 16,
              fontSize: "0.85rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div style={{ marginBottom: 14 }}>
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
              />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {isRegister ? <UserPlus size={16} /> : <LogIn size={16} />}
            <span>{loading ? "Processing…" : isRegister ? "Create ErrorWatch Account" : "Sign In to Console"}</span>
          </button>
        </form>

        {!isRegister && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)", textAlign: "center" }}>
            <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginBottom: 8 }}>
              Default Developer Demo Credentials
            </p>
            <button
              type="button"
              className="btn small secondary"
              onClick={() => {
                setEmail("admin@example.com");
                setPassword("admin123");
              }}
            >
              Fill Demo: admin@example.com
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

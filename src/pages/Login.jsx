import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Login() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to={user.role === "admin" ? "/admin" : "/app"} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const u = await login(email, password);
      navigate(u.role === "admin" ? "/admin" : "/app", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="center-screen">
      <form className="card login-card" onSubmit={submit}>
        <h1>Sign in</h1>
        <p className="muted">Admins go to the admin panel, users go to the user site.</p>
        <label>Email or Username</label>
        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <div className="alert error">{error}</div>}
        <button className="btn" disabled={busy}>{busy ? "Signing in…" : "Login"}</button>
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            className="btn small secondary"
            onClick={() => {
              setEmail("admin@example.com");
              setPassword("admin123");
            }}
          >
            Auto-fill Admin
          </button>
          <button
            type="button"
            className="btn small secondary"
            onClick={() => {
              setEmail("user@example.com");
              setPassword("user123");
            }}
          >
            Auto-fill User
          </button>
        </div>
        <p className="hint">
          Demo: admin@example.com / admin123 &nbsp;|&nbsp; user@example.com / user123
        </p>
      </form>
    </div>
  );
}

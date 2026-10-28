import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const base = user.role === "admin" ? "/admin" : "/app";

  useEffect(() => {
    api.get("/dashboard").then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert error">{error}</div>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <div className="grid">
        {user.role === "admin" && (
          <>
            <Link to="/admin/users" className="stat">
              <span className="stat-num">{data.total_users}</span>
              <span>Total users</span>
            </Link>
            <div className="stat">
              <span className="stat-num">{data.active_users}</span>
              <span>Active users</span>
            </div>
          </>
        )}
        {data.cards.map((c) => (
          <Link key={c.key} to={`${base}/${c.key}`} className="stat">
            <span className="stat-num">{c.count}</span>
            <span>{c.name}</span>
          </Link>
        ))}
      </div>
      {user.role !== "admin" && data.cards.length === 0 && (
        <div className="card">You have no pages assigned yet. Please ask your admin for access.</div>
      )}
    </div>
  );
}

import { Link } from "react-router-dom";

export function Forbidden() {
  return (
    <div className="center-screen">
      <div className="card" style={{ textAlign: "center" }}>
        <h1>403</h1>
        <p>You do not have permission to open this page.</p>
        <Link className="btn" to="/">Go home</Link>
      </div>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="center-screen">
      <div className="card" style={{ textAlign: "center" }}>
        <h1>404</h1>
        <p>Page not found.</p>
        <Link className="btn" to="/">Go home</Link>
      </div>
    </div>
  );
}

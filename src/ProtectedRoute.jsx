import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner"></div>
        <p className="muted" style={{ marginTop: 12 }}>Loading ErrorWatch…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

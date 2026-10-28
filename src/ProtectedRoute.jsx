import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

/**
 * <Protected role="admin">          -> must be logged in with that role
 * <Protected role="user" page="orders" action="view"> -> also needs page permission
 */
export default function Protected({ role, page, action = "view", children }) {
  const { user, loading, can } = useAuth();
  const location = useLocation();

  if (loading) return <div className="center-screen">Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  if (role && user.role !== role) {
    // Wrong area: send to their own home
    return <Navigate to={user.role === "admin" ? "/admin" : "/app"} replace />;
  }
  if (page && !can(page, action)) {
    return <Navigate to="/forbidden" replace />;
  }
  return children;
}

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import Protected from "./ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Users from "./pages/admin/Users.jsx";
import Permissions from "./pages/admin/Permissions.jsx";
import RecordsPage from "./pages/RecordsPage.jsx";
import Profile from "./pages/Profile.jsx";
import { Forbidden, NotFound } from "./pages/Errors.jsx";
import { PAGES } from "./config.js";

function Home() {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-screen">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "admin" ? "/admin" : "/app"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* ================= ADMIN PANEL  (/admin/...) ================= */}
      <Route
        path="/admin"
        element={
          <Protected role="admin">
            <Layout mode="admin" />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:id/permissions" element={<Permissions />} />
        {PAGES.map((p) => (
          <Route key={p.key} path={p.key} element={<RecordsPage pageKey={p.key} title={p.name} />} />
        ))}
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* ================= USER SITE  (/app/...) ================= */}
      <Route
        path="/app"
        element={
          <Protected role="user">
            <Layout mode="user" />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        {PAGES.map((p) => (
          <Route
            key={p.key}
            path={p.key}
            element={
              <Protected page={p.key} action="view">
                <RecordsPage pageKey={p.key} title={p.name} />
              </Protected>
            }
          />
        ))}
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/forbidden" element={<Forbidden />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

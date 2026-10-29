import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Projects from "./pages/Projects.jsx";
import NewProject from "./pages/NewProject.jsx";
import Issues from "./pages/Issues.jsx";
import IssueDetail from "./pages/IssueDetail.jsx";
import Uptime from "./pages/Uptime.jsx";
import Alerts from "./pages/Alerts.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Authenticated Platform Console */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/new" element={<NewProject />} />
        <Route path="issues" element={<Issues />} />
        <Route path="issues/:id" element={<IssueDetail />} />
        <Route path="uptime" element={<Uptime />} />
        <Route path="alerts" element={<Alerts />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

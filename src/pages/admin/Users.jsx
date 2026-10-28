import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api.js";
import { useAuth } from "../../AuthContext.jsx";

const EMPTY = { name: "", email: "", password: "", role: "user", is_active: true };

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");

  const load = () => api.get("/users").then(setUsers).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (form.id) {
        const body = { name: form.name, email: form.email, role: form.role, is_active: form.is_active };
        if (form.password) body.password = form.password;
        await api.put(`/users/${form.id}`, body);
      } else {
        await api.post("/users", form);
      }
      setForm(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleActive = async (u) => {
    try {
      await api.put(`/users/${u.id}`, { is_active: !u.is_active });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete user ${u.email}?`)) return;
    try {
      await api.del(`/users/${u.id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-head">
        <h2>User Management</h2>
        <button className="btn" onClick={() => setForm({ ...EMPTY })}>+ Add user</button>
      </div>
      {error && <div className="alert error">{error}</div>}

      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.role}`}>{u.role}</span></td>
                <td><span className={`pill ${u.is_active ? "active" : "inactive"}`}>{u.is_active ? "active" : "disabled"}</span></td>
                <td className="actions">
                  {u.role === "user" && (
                    <Link className="btn small" to={`/admin/users/${u.id}/permissions`}>Permissions</Link>
                  )}
                  <button className="btn small secondary" onClick={() => setForm({ ...u, password: "" })}>Edit</button>
                  {u.id !== me.id && (
                    <>
                      <button className="btn small secondary" onClick={() => toggleActive(u)}>
                        {u.is_active ? "Disable" : "Enable"}
                      </button>
                      <button className="btn small danger" onClick={() => remove(u)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="modal-bg" onClick={() => setForm(null)}>
          <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <h3>{form.id ? "Edit user" : "Add user"}</h3>
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <label>{form.id ? "New password (leave blank to keep)" : "Password"}</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!form.id}
              minLength={form.id && !form.password ? undefined : 6}
            />
            <label>Role</label>
            <select
              value={form.role}
              disabled={form.id === me.id}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <div className="row end">
              <button type="button" className="btn secondary" onClick={() => setForm(null)}>Cancel</button>
              <button className="btn">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

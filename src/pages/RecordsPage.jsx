import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

const EMPTY = { title: "", description: "", status: "active" };

/**
 * Generic sample list page. Buttons (Add / Edit / Delete) appear only
 * if the user has that permission on this page. The backend enforces it too.
 */
export default function RecordsPage({ pageKey, title }) {
  const { can } = useAuth();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(null); // null = closed; object = open (id present when editing)
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get(`/records/${pageKey}`)
      .then(setRows)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    setError("");
    setSearch("");
    load();
    // eslint-disable-next-line
  }, [pageKey]);

  const save = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const body = { title: form.title, description: form.description, status: form.status };
      if (form.id) await api.put(`/records/${pageKey}/${form.id}`, body);
      else await api.post(`/records/${pageKey}`, body);
      setForm(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete "${r.title}"?`)) return;
    try {
      await api.del(`/records/${pageKey}/${r.id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = rows.filter((r) =>
    `${r.title} ${r.description} ${r.status}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-head">
        <h2>{title}</h2>
        <div className="row">
          <input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
          {can(pageKey, "add") && (
            <button className="btn" onClick={() => setForm({ ...EMPTY })}>+ Add</button>
          )}
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Title</th><th>Description</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="5">Loading…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan="5">No records found.</td></tr>}
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.title}</td>
                <td>{r.description}</td>
                <td><span className={`pill ${r.status}`}>{r.status}</span></td>
                <td className="actions">
                  {can(pageKey, "edit") && (
                    <button className="btn small secondary" onClick={() => setForm({ ...r })}>Edit</button>
                  )}
                  {can(pageKey, "delete") && (
                    <button className="btn small danger" onClick={() => remove(r)}>Delete</button>
                  )}
                  {!can(pageKey, "edit") && !can(pageKey, "delete") && <span className="muted">view only</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="modal-bg" onClick={() => setForm(null)}>
          <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <h3>{form.id ? "Edit" : "Add"} {title}</h3>
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <label>Description</label>
            <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">active</option>
              <option value="pending">pending</option>
              <option value="inactive">inactive</option>
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

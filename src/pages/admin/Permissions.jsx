import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api.js";
import { ACTIONS } from "../../config.js";

/** Page-wise permission matrix for one user: rows = pages, columns = view/add/edit/delete */
export default function Permissions() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [perms, setPerms] = useState({});
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get(`/users/${id}/permissions`)
      .then((d) => {
        setData(d);
        setPerms(d.permissions);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  const toggle = (page, action) => {
    setSaved(false);
    setPerms((prev) => {
      const row = { ...prev[page], [action]: !prev[page][action] };
      // add/edit/delete need view; unchecking view clears everything
      if (action !== "view" && row[action]) row.view = true;
      if (action === "view" && !row.view) ACTIONS.forEach((a) => (row[a] = false));
      return { ...prev, [page]: row };
    });
  };

  const setAll = (page, value) => {
    setSaved(false);
    setPerms((prev) => ({ ...prev, [page]: Object.fromEntries(ACTIONS.map((a) => [a, value])) }));
  };

  const save = async () => {
    setError("");
    try {
      const payload = data.pages.map((p) => ({
        page_key: p.key,
        can_view: perms[p.key].view,
        can_add: perms[p.key].add,
        can_edit: perms[p.key].edit,
        can_delete: perms[p.key].delete,
      }));
      await api.put(`/users/${id}/permissions`, { permissions: payload });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    }
  };

  if (error && !data) return <div className="alert error">{error}</div>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className="page-head">
        <h2>Permissions: {data.user.name} <span className="muted">({data.user.email})</span></h2>
        <Link className="btn secondary" to="/admin/users">← Back to users</Link>
      </div>

      {data.user.role === "admin" && (
        <div className="alert">This user is an admin and always has full access. Permissions below are ignored.</div>
      )}
      {error && <div className="alert error">{error}</div>}
      {saved && <div className="alert ok">Permissions saved.</div>}

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Page</th>
              {ACTIONS.map((a) => <th key={a} style={{ textTransform: "capitalize" }}>{a}</th>)}
              <th>Quick</th>
            </tr>
          </thead>
          <tbody>
            {data.pages.map((p) => (
              <tr key={p.key}>
                <td>{p.name}</td>
                {ACTIONS.map((a) => (
                  <td key={a}>
                    <input type="checkbox" checked={!!perms[p.key]?.[a]} onChange={() => toggle(p.key, a)} />
                  </td>
                ))}
                <td className="actions">
                  <button className="btn small secondary" onClick={() => setAll(p.key, true)}>All</button>
                  <button className="btn small secondary" onClick={() => setAll(p.key, false)}>None</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="btn" onClick={save}>Save permissions</button>
    </div>
  );
}

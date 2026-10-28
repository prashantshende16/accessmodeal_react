import { useAuth } from "../AuthContext.jsx";
import { PAGES, ACTIONS } from "../config.js";

export default function Profile() {
  const { user, permissions } = useAuth();
  return (
    <div>
      <h2>My Profile</h2>
      <div className="card">
        <p><b>Name:</b> {user.name}</p>
        <p><b>Email:</b> {user.email}</p>
        <p><b>Role:</b> {user.role}</p>
      </div>
      <h3>My access</h3>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Page</th>{ACTIONS.map((a) => <th key={a}>{a}</th>)}</tr>
          </thead>
          <tbody>
            {PAGES.map((p) => (
              <tr key={p.key}>
                <td>{p.name}</td>
                {ACTIONS.map((a) => (
                  <td key={a}>{permissions?.[p.key]?.[a] ? "✔" : "—"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";

export default function AdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [sessionName, setSessionName] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fetchSessions = async () => {
    const res = await fetch("/api/adminapi/sessions");
    const data = await res.json();
    if (data.success) setSessions(data.sessions);
  };

  const handleSubmit = async () => {
    if (!sessionName) return alert("Enter a session name");

    const method = editingId ? "PUT" : "POST";
    const body = editingId ? { id: editingId, sessionName } : { sessionName };

    const res = await fetch("/api/adminapi/sessions", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    alert(data.message);
    if (data.success) {
      setSessionName("");
      setEditingId(null);
      fetchSessions();
    }
  };

  const handleEdit = (session) => {
    setSessionName(session.sessionName);
    setEditingId(session._id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    const res = await fetch("/api/adminapi/sessions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    alert(data.message);
    if (data.success) fetchSessions();
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="container py-4">
      <h4 className="mb-3">📘 Manage Sessions</h4>
      <div className="d-flex mb-3">
        <input
          type="text"
          className="form-control login-input me-2"
          placeholder="Enter session e.g. 2024/2025"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
        />
        <button
          className={`btn ${editingId ? "btn-warning" : "btn-primary"}`}
          onClick={handleSubmit}
        >
          {editingId ? "Update" : "Add"}
        </button>
      </div>

      <ul className="list-group form-card">
        {sessions.length === 0 && (
          <li className="list-group-item text-center">No sessions yet</li>
        )}
        {sessions.map((s) => (
          <li
            key={s._id}
            className="list-group-item d-flex justify-content-between align-items-center form-card my-1"
          >
            <span>{s.sessionName}</span>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleEdit(s)}
              >
                ✏️ Edit
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDelete(s._id)}
              >
                🗑️ Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

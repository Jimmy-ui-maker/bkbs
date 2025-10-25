"use client";
import { useState, useEffect } from "react";

export default function AdminTermDates() {
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [formData, setFormData] = useState({
    term: "First Term",
    session: "",
    termOpens: "",
    termEnds: "",
    nextTermBegins: "",
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch all sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch("/api/adminapi/sessions");
        const data = await res.json();
        if (data.success) setSessions(data.sessions);
        else setSessions([{ sessionName: "2024/2025" }]);
      } catch (err) {
        setSessions([{ sessionName: "2024/2025" }]);
      }
    };
    fetchSessions();
  }, []);

  // Fetch term dates
  const fetchTerms = async () => {
    const res = await fetch("/api/adminapi/term-dates");
    const data = await res.json();
    if (data.success) setTerms(data.terms);
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editingId ? "PUT" : "POST";
    const body = editingId ? { id: editingId, ...formData } : formData;

    const res = await fetch("/api/adminapi/term-dates", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    alert(data.message);

    if (data.success) {
      fetchTerms();
      setFormData({
        term: "First Term",
        session: "",
        termOpens: "",
        termEnds: "",
        nextTermBegins: "",
      });
      setEditingId(null);
    }
  };

  const handleEdit = (term) => {
    setFormData({
      term: term.term,
      session: term.session,
      termOpens: term.termOpens,
      termEnds: term.termEnds,
      nextTermBegins: term.nextTermBegins,
    });
    setEditingId(term._id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this term?")) return;
    const res = await fetch("/api/adminapi/term-dates", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    alert(data.message);
    if (data.success) fetchTerms();
  };

  return (
    <div className="container py-3">
      <h4 className="fw-bold text-success text-center mb-3">
        📅 Manage Term Dates
      </h4>

      <form
        onSubmit={handleSubmit}
        className="border p-3 rounded  shadow-sm card login-card  shadow-sm"
      >
        <div className="mb-2">
          <label className="fw-semibold">Session</label>
          <select
            className="form-select login-input"
            value={formData.session}
            onChange={(e) =>
              setFormData({ ...formData, session: e.target.value })
            }
          >
            <option value="">Select Session</option>
            {sessions.map((s) => (
              <option key={s._id} value={s.sessionName}>
                {s.sessionName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-2">
          <label className="fw-semibold">Term</label>
          <select
            className="form-select login-input"
            value={formData.term}
            onChange={(e) => setFormData({ ...formData, term: e.target.value })}
          >
            <option>First Term</option>
            <option>Second Term</option>
            <option>Third Term</option>
          </select>
        </div>

        <div className="mb-2">
          <label className="fw-semibold">Term Opens</label>
          <input
            type="date"
            className="form-control login-input"
            value={formData.termOpens}
            onChange={(e) =>
              setFormData({ ...formData, termOpens: e.target.value })
            }
          />
        </div>

        <div className="mb-2">
          <label className="fw-semibold">Term Ends</label>
          <input
            type="date"
            className="form-control login-input"
            value={formData.termEnds}
            onChange={(e) =>
              setFormData({ ...formData, termEnds: e.target.value })
            }
          />
        </div>

        <div className="mb-2">
          <label className="fw-semibold">Next Term Begins</label>
          <input
            type="date"
            className="form-control login-input"
            value={formData.nextTermBegins}
            onChange={(e) =>
              setFormData({ ...formData, nextTermBegins: e.target.value })
            }
          />
        </div>

        <button
          type="submit"
          className={`btn btn-dark w-100 ${
            editingId ? "btn-warning" : "btn-success"
          }`}
        >
          {editingId ? "Update Term" : "Add Term"}
        </button>
      </form>

      <div className="mt-4">
        <h6 className="fw-semibold text-center">Existing Term Dates</h6>
        {terms.length === 0 && (
          <p className="text-muted text-center mt-2">No terms yet.</p>
        )}
        <div className="d-flex flex-column gap-2">
          {terms.map((t) => (
            <div
              key={t._id}
              className="border rounded p-2 login-card shadow-sm d-flex justify-content-between align-items-center"
            >
              <div>
                <p className="mb-1">
                  <strong>{t.term}</strong> — {t.session}
                </p>
                <small>
                  Opens: {t.termOpens} | Ends: {t.termEnds} | Next:{" "}
                  {t.nextTermBegins}
                </small>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleEdit(t)}
                >
                  ✏️
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(t._id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

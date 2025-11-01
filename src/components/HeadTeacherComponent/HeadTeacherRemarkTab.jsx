"use client";
import { useState, useEffect } from "react";

export default function HeadTeacherRemarkTab({ username }) {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [learners, setLearners] = useState([]);
  const [filteredLearners, setFilteredLearners] = useState([]);
  const [selectedLearner, setSelectedLearner] = useState("");
  const [session, setSession] = useState("");
  const [term, setTerm] = useState("First Term");
  const [remark, setRemark] = useState("");
  const [remarksList, setRemarksList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};

  const remarkOptions = [
    "Excellent performance!",
    "Good effort, keep it up.",
    "Fair performance, can do better.",
    "Needs serious improvement.",
  ];

  /* 🔹 Sessions */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/adminapi/sessions");
        const data = await res.json();
        if (data.success && Array.isArray(data.sessions)) {
          setSessions(data.sessions);
          const active =
            data.sessions.find((s) => s.isActive) ||
            data.sessions[data.sessions.length - 1];
          if (active) setSession(active.sessionName || active);
        }
      } catch (err) {
        console.error("Session fetch error:", err);
      }
    })();
  }, []);

  /* 🔹 Learners */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/headteacher/learners");
        const data = await res.json();
        if (data.success) {
          setLearners(data.learners);
          const uniqueClasses = [
            ...new Set(data.learners.map((l) => l.classLevel)),
          ];
          setClasses(uniqueClasses);
        }
      } catch (err) {
        console.error("Learner fetch error:", err);
      }
    })();
  }, []);

  /* 🔹 Filter by class */
  useEffect(() => {
    if (selectedClass)
      setFilteredLearners(
        learners.filter((l) => l.classLevel === selectedClass)
      );
    else setFilteredLearners([]);
  }, [selectedClass, learners]);

  /* 🔹 Fetch remarks per session+term */
  const fetchRemarks = async () => {
    try {
      const res = await fetch(
        `/api/headteacher/remarks?session=${session}&term=${term}`
      );
      const data = await res.json();
      if (data.success) setRemarksList(data.remarks);
    } catch (err) {
      console.error("Fetch remarks error:", err);
    }
  };

  useEffect(() => {
    if (session && term) fetchRemarks();
  }, [session, term]);

  /* 🔹 Save / Update */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLearner || !session || !term || !selectedClass)
      return setAlert(
        "warning",
        "Please select class, learner, session, term."
      );

    setLoading(true);
    try {
      const res = await fetch("/api/headteacher/remarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId || undefined,
          learnerId: selectedLearner,
          className: selectedClass,
          session,
          term,
          remark,
          headTeacherId: user.id,
          headTeacherEmail: user.email,
          headTeacherName: user.name || username,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAlert(
          "success",
          editingId ? "✅ Remark updated!" : "✅ Remark saved!"
        );
        setRemark("");
        setSelectedLearner("");
        setEditingId(null);
        fetchRemarks();
      } else setAlert("danger", data.error || "Save failed");
    } catch (err) {
      console.error("Save error:", err);
      setAlert("danger", "Server error saving remark");
    } finally {
      setLoading(false);
    }
  };

  /* 🔹 Edit */
  const handleEdit = (remark) => {
    setSelectedClass(remark.className);
    setSelectedLearner(remark.learnerId?._id || "");
    setSession(remark.session);
    setTerm(remark.term);
    setRemark(remark.remark);
    setEditingId(remark._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* 🔹 Delete */
  const handleDelete = async (id) => {
    if (!confirm("Delete this remark?")) return;
    try {
      const res = await fetch(`/api/headteacher/remarks?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setAlert("success", "Remark deleted!");
        fetchRemarks();
      } else setAlert("danger", "Delete failed");
    } catch (err) {
      console.error("Delete error:", err);
      setAlert("danger", "Delete error");
    }
  };

  /* 🔹 Alerts */
  const setAlert = (type, text) => {
    setMessageType(type);
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  return (
    <div className="card shadow-sm p-3 mt-3">
      {message && (
        <div className={`alert alert-${messageType} py-1 mb-3 text-center`}>
          {message}
        </div>
      )}

      <h5 className="fw-bold mb-3">
        🏫 Head Teacher Remarks{" "}
        {editingId && <span className="text-warning">(Editing)</span>}
      </h5>

      <form onSubmit={handleSubmit}>
        <div className="row g-2">
          <div className="col-md-3">
            <label className="form-label small">Select Class</label>
            <select
              className="form-select form-select-sm"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">-- Select Class --</option>
              {classes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label small">Select Learner</label>
            <select
              className="form-select form-select-sm"
              value={selectedLearner}
              onChange={(e) => setSelectedLearner(e.target.value)}
              disabled={!selectedClass}
            >
              <option value="">-- Choose Learner --</option>
              {filteredLearners.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label small">Session</label>
            <select
              className="form-select form-select-sm"
              value={session}
              onChange={(e) => setSession(e.target.value)}
            >
              {sessions.map((s) => (
                <option key={s._id} value={s.sessionName || s}>
                  {s.sessionName || s}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label small">Term</label>
            <select
              className="form-select form-select-sm"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            >
              <option value="First Term">First Term</option>
              <option value="Second Term">Second Term</option>
              <option value="Third Term">Third Term</option>
            </select>
          </div>
        </div>

        <div className="mt-3">
          <label className="form-label small">Head Teacher Remark</label>
          <input
            list="remarks"
            className="form-control form-control-sm"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Type or select remark..."
          />
          <datalist id="remarks">
            {remarkOptions.map((r, i) => (
              <option key={i} value={r} />
            ))}
          </datalist>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="small text-muted">
            Head Teacher:{" "}
            <strong>{user?.email || user?.name || username || "N/A"}</strong>
          </div>
          <div>
            {editingId && (
              <button
                type="button"
                className="btn btn-sm btn-warning me-2"
                onClick={() => {
                  setEditingId(null);
                  setRemark("");
                }}
              >
                Cancel Edit
              </button>
            )}
            <button
              type="button"
              className="btn btn-sm btn-secondary me-2"
              onClick={() => setRemark("")}
            >
              Clear
            </button>
            <button
              type="submit"
              className={`btn btn-sm ${
                editingId ? "btn-primary" : "btn-success"
              }`}
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingId
                ? "Update Remark"
                : "Save Remark"}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-4">
        <h6 className="fw-bold">
          📋 All Remarks ({remarksList.length}) for {term}, {session}
        </h6>
        <div className="table-responsive">
          <table className="table table-sm table-bordered align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Learner</th>
                <th>Class</th>
                <th>Session</th>
                <th>Term</th>
                <th>Remark</th>
                <th>Head Teacher</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {remarksList.length ? (
                remarksList.map((r, i) => (
                  <tr key={r._id}>
                    <td>{i + 1}</td>
                    <td>{r.learnerId?.fullName || "—"}</td>
                    <td>{r.className}</td>
                    <td>{r.session}</td>
                    <td>{r.term}</td>
                    <td>{r.remark}</td>
                    <td>{r.headTeacherName}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => handleEdit(r)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(r._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center small text-muted">
                    No remarks yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

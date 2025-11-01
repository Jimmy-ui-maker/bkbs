"use client";
import { useEffect, useState } from "react";

export default function TeacherRemarkForm({
  assignedClass,
  teacherId,
  learners = [],
}) {
  const [sessions, setSessions] = useState([]);
  const [selectedLearner, setSelectedLearner] = useState("");
  const [session, setSession] = useState("");
  const [term, setTerm] = useState("First Term");
  const [conduct, setConduct] = useState("");
  const [remark, setRemark] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [remarksList, setRemarksList] = useState([]);

  const conductOptions = [
    "Punctual and attentive",
    "Respectful and obedient",
    "Hardworking and disciplined",
    "Needs to improve concentration",
  ];

  const remarkOptions = [
    "Excellent performance!",
    "Good effort, keep it up.",
    "Fair performance, can do better.",
    "Needs serious improvement.",
  ];

  // 🔹 Fetch sessions
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/adminapi/sessions");
        const data = await res.json();
        if (data?.success && Array.isArray(data.sessions)) {
          setSessions(data.sessions);
          const active =
            data.sessions.find((s) => s.isActive) ||
            data.sessions[data.sessions.length - 1];
          if (active) setSession(active.sessionName || active);
        }
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      }
    })();
  }, []);

  // 🔹 Auto resolve teacher name
  useEffect(() => {
    const stored = localStorage.getItem("teacherData");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.fullName) setTeacherName(parsed.fullName);
    }
  }, []);

  // 🔹 Fetch existing remark for learner
  useEffect(() => {
    if (!selectedLearner || !session || !term) return;
    (async () => {
      try {
        const res = await fetch(
          `/api/teachers/remarks?learnerId=${selectedLearner}&session=${session}&term=${term}`
        );
        const data = await res.json();
        if (data?.success && data.remarks?.length) {
          const r = data.remarks[0];
          setConduct(r.conduct || "");
          setRemark(r.remark || "");
        } else {
          setConduct("");
          setRemark("");
        }
      } catch (err) {
        console.error("Failed to fetch existing remark:", err);
      }
    })();
  }, [selectedLearner, session, term]);

  // 🔹 Fetch all remarks
  const fetchRemarksList = async () => {
    try {
      const res = await fetch(
        `/api/teachers/remarks?class=${assignedClass}&session=${session}&term=${term}`
      );
      const data = await res.json();
      if (data?.success && Array.isArray(data.remarks))
        setRemarksList(data.remarks);
    } catch (err) {
      console.error("Failed to fetch remark list:", err);
    }
  };

  useEffect(() => {
    if (assignedClass && session && term) fetchRemarksList();
  }, [assignedClass, session, term]);

  // 🔹 Save
  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedLearner)
      return setAlert("warning", "Please select a learner.");
    if (!session || !term)
      return setAlert("warning", "Please select session and term.");

    setLoading(true);
    try {
      const res = await fetch("/api/teachers/remarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learnerId: selectedLearner,
          className: assignedClass,
          session,
          term,
          conduct,
          remark,
          teacherId: teacherId || localStorage.getItem("teacherId"),
          teacherName:
            teacherName ||
            JSON.parse(localStorage.getItem("teacherData"))?.fullName ||
            "",
        }),
      });

      const json = await res.json();
      if (!json?.success) throw new Error(json?.error || "Save failed");

      setAlert("success", "✅ Remark saved successfully.");
      fetchRemarksList();

      // Clear form
      setSelectedLearner("");
      setConduct("");
      setRemark("");
    } catch (err) {
      console.error(err);
      setAlert("danger", "❌ Failed to save remark.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete
  const handleDelete = async (id) => {
    if (!confirm("Delete this remark?")) return;
    try {
      const res = await fetch(`/api/teachers/remarks?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json?.success) {
        setAlert("success", "Remark deleted.");
        fetchRemarksList();
      } else {
        setAlert("danger", "Delete failed.");
      }
    } catch (err) {
      console.error(err);
      setAlert("danger", "Delete error.");
    }
  };

  const setAlert = (type, text) => {
    setMessageType(type);
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  return (
    <div className="card shadow-sm p-3">
      {message && (
        <div className={`alert alert-${messageType} py-1 mb-3 text-center`}>
          {message}
        </div>
      )}

      <h5 className="fw-bold mb-3">
        ✍️ Add/Edit Learner Conduct & Teacher Remark
      </h5>

      <form onSubmit={handleSave}>
        <div className="row g-2">
          <div className="col-md-4">
            <label className="form-label small">Learner</label>
            <select
              className="form-select login-input form-select-sm"
              value={selectedLearner}
              onChange={(e) => setSelectedLearner(e.target.value)}
            >
              <option value="">Select Learner</option>
              {learners.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label small">Session</label>
            <select
              className="form-select login-input form-select-sm"
              value={session}
              onChange={(e) => setSession(e.target.value)}
            >
              <option value="">Select Session</option>
              {sessions.map((s) => (
                <option key={s._id || s.sessionName} value={s.sessionName || s}>
                  {s.sessionName || s}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label small">Term</label>
            <select
              className="form-select  login-input form-select-sm"
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
          <label className="form-label small">Learner Conduct</label>
          <input
            list="conducts"
            className="form-control login-input form-control-sm"
            value={conduct}
            onChange={(e) => setConduct(e.target.value)}
            placeholder="Type or select conduct..."
          />
          <datalist id="conducts">
            {conductOptions.map((c, i) => (
              <option key={i} value={c} />
            ))}
          </datalist>
        </div>

        <div className="mt-3">
          <label className="form-label small">Teacher Remark</label>
          <input
            list="remarks"
            className="form-control  login-input form-control-sm"
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
            Teacher: <strong>{teacherName || "—"}</strong>
          </div>
          <div>
            <button
              type="button"
              className="btn btn-sm btn-secondary me-2"
              onClick={() => {
                setConduct("");
                setRemark("");
              }}
            >
              Clear
            </button>
            <button
              type="submit"
              className="btn btn-sm btn-success"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Remark"}
            </button>
          </div>
        </div>
      </form>

      {/* Table */}
      <div className="mt-4">
        <h6 className="fw-bold">📋 All Remarks ({remarksList.length})</h6>
        <div className="table-responsive">
          <table className="table table-sm table-bordered align-middle">
            <thead className="table-dark">
              <tr>
                <th>Learner</th>
                <th>Conduct</th>
                <th>Remark</th>
                <th>Session</th>
                <th>Term</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {remarksList.length ? (
                remarksList.map((r) => (
                  <tr key={r._id}>
                    <td>{r.learnerId?.fullName || "—"}</td>
                    <td>{r.conduct}</td>
                    <td>{r.remark}</td>
                    <td>{r.session}</td>
                    <td>{r.term}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => {
                          setSelectedLearner(r.learnerId?._id || "");
                          setConduct(r.conduct || "");
                          setRemark(r.remark || "");
                        }}
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
                  <td colSpan="6" className="text-center small text-muted">
                    No remarks recorded yet.
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

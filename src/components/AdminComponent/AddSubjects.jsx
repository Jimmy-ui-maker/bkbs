"use client";
import { useEffect, useState } from "react";

export default function AdminSubjectsPage() {
  const [classLevel, setClassLevel] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [existingSubjects, setExistingSubjects] = useState([]);
  const [editing, setEditing] = useState(null); // track subject being edited
  const [loading, setLoading] = useState(false);

  const classLevels = [
    "Reception 1",
    "Reception 2",
    "Nursery 1",
    "Nursery 2",
    "Basic 1",
    "Basic 2",
    "Basic 3",
    "Basic 4",
    "Basic 5",
    "Basic 6",
    "JSS 1",
    "JSS 2",
    "JSS 3",
    "SSS 1",
    "SSS 2",
    "SSS 3",
  ];

  // ✅ Fetch subjects
  useEffect(() => {
    if (!classLevel) return;
    (async () => {
      const res = await fetch(
        `/api/adminapi/subjects?classLevel=${classLevel}`
      );
      const data = await res.json();
      if (data.success && data.subjects.length) {
        setExistingSubjects(data.subjects[0].subjects || []);
      } else setExistingSubjects([]);
    })();
  }, [classLevel]);

  // ✅ Add new subject
  const addSubject = () => {
    if (!subjectName.trim()) return alert("Enter a subject name.");
    const name = subjectName.trim();
    const code = subjectCode.trim();

    const duplicate =
      existingSubjects.some(
        (s) => s.name.toLowerCase() === name.toLowerCase()
      ) || subjects.some((s) => s.name.toLowerCase() === name.toLowerCase());

    if (duplicate) return alert(`"${name}" already exists.`);

    setSubjects([...subjects, { name, code }]);
    setSubjectName("");
    setSubjectCode("");
  };

  // ✅ Save all
  const handleSave = async () => {
    if (!classLevel || subjects.length === 0)
      return alert("Select class and add at least one subject.");

    setLoading(true);
    try {
      const res = await fetch("/api/adminapi/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classLevel, subjects }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setSubjects([]);
        const refresh = await fetch(
          `/api/adminapi/subjects?classLevel=${classLevel}`
        );
        const refData = await refresh.json();
        if (refData.success)
          setExistingSubjects(refData.subjects[0]?.subjects || []);
      } else alert(data.error || "Save failed.");
    } catch {
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete
  const handleDelete = async (name) => {
    if (!confirm(`Delete ${name}?`)) return;
    const res = await fetch("/api/adminapi/subjects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classLevel, subjectName: name }),
    });
    const data = await res.json();
    if (data.success) {
      alert("Deleted successfully!");
      setExistingSubjects(existingSubjects.filter((s) => s.name !== name));
    } else alert(data.error || "Delete failed.");
  };

  // ✅ Cancel edit
  const cancelEdit = () => setEditing(null);

  // ✅ Edit start
  const startEdit = (sub) => {
    setEditing(sub); // store what’s being edited
    setSubjectName(sub.name); // prefill existing input fields
    setSubjectCode(sub.code || "");
  };

  // ✅ Save edit
  const saveEdit = async () => {
    if (!editing) return alert("No subject selected for editing.");
    if (!subjectName.trim()) return alert("Enter valid subject name.");

    try {
      const res = await fetch("/api/adminapi/subjects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classLevel,
          oldName: editing.name,
          newName: subjectName.trim(),
          newCode: subjectCode.trim(),
        }),
      });
      const data = await res.json();

      if (data.success) {
        alert("Updated successfully!");

        // Clear inputs + refresh subjects
        setEditing(null);
        setSubjectName("");
        setSubjectCode("");

        const refresh = await fetch(
          `/api/adminapi/subjects?classLevel=${classLevel}`
        );
        const refData = await refresh.json();
        if (refData.success)
          setExistingSubjects(refData.subjects[0]?.subjects || []);
      } else {
        alert(data.error || "Update failed.");
      }
    } catch {
      alert("Network error.");
    }
  };

  return (
    <section className="container py-5">
      <div className="p-4 shadow rounded-4 login-card border border-warning-subtle">
        <h3 className="fw-bold text-center text-primary mb-4">
          Admin – Manage Class Subjects
        </h3>

        <div className="mb-4 text-center">
          <label className="form-label fw-semibold me-2">Select Class:</label>
          <select
            className="form-select d-inline-block login-input shadow-none"
            style={{ width: "250px" }}
            value={classLevel}
            onChange={(e) => setClassLevel(e.target.value)}
          >
            <option value="">-- Choose Class --</option>
            {classLevels.map((cls) => (
              <option key={cls}>{cls}</option>
            ))}
          </select>
        </div>

        {classLevel && (
          <>
            <div className="mb-3 d-flex gap-2 flex-wrap justify-content-center">
              <input
                type="text"
                placeholder="Subject Name"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="login-input"
                style={{ maxWidth: "250px" }}
              />
              <input
                type="text"
                placeholder="Code (optional)"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                className="login-input"
                style={{ maxWidth: "150px" }}
              />
              {editing ? (
                <>
                  <button className="btn btn-success" onClick={saveEdit}>
                    Update
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditing(null);
                      setSubjectName("");
                      setSubjectCode("");
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button className="btn btn-outline-primary" onClick={addSubject}>
                  Add
                </button>
              )}
            </div>

            {subjects.length > 0 && (
              <div className="mb-4">
                <h6 className="fw-semibold text-success">Pending to Save:</h6>
                <ul className="list-group">
                  {subjects.map((sub, i) => (
                    <li
                      key={i}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span>
                        {sub.name} {sub.code && <small>({sub.code})</small>}
                      </span>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          setSubjects(subjects.filter((_, idx) => idx !== i))
                        }
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {existingSubjects.length > 0 && (
              <div className="mb-4">
                <h6 className="fw-semibold text-secondary">
                  Existing Subjects for {classLevel}:
                </h6>
                <ul className="list-group">
                  {existingSubjects.map((sub, i) => (
                    <li
                      key={i}
                      className="list-group-item login-card my-2 py-2 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center"
                    >
                      <span className="mb-2 mb-sm-0 ">
                        {sub.name} {sub.code && <small>({sub.code})</small>}
                      </span>

                      <div className="d-flex w-100 w-sm-auto justify-content-around justify-content-sm-end gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => startEdit(sub)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(sub.name)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-center">
              <button
                className="btn btn-warning fw-semibold"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save All"}
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 576px) {
          .login-card {
            padding: 1.5rem !important;
          }
          button {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </section>
  );
}

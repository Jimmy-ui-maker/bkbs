"use client";

import { useEffect, useState } from "react";

export default function AdminSubjectsPage() {
  const [classLevel, setClassLevel] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [existingSubjects, setExistingSubjects] = useState([]);
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

  // ✅ Fetch existing subjects
  useEffect(() => {
    if (!classLevel) return;

    const fetchSubjects = async () => {
      try {
        const res = await fetch(
          `/api/adminapi/subjects?classLevel=${classLevel}`
        );
        const data = await res.json();

        if (data.success && data.subjects) {
          const subjectList = Array.isArray(data.subjects)
            ? data.subjects[0]?.subjects || []
            : data.subjects?.subjects || [];
          setExistingSubjects(subjectList);
        } else {
          setExistingSubjects([]);
        }
      } catch (error) {
        console.error("❌ Fetch error:", error);
        alert("Failed to fetch subjects. Please check your network.");
      }
    };

    fetchSubjects();
  }, [classLevel]);

  // ✅ Add a new subject
  const addSubject = () => {
    if (!subjectName.trim()) return alert("Enter a subject name.");
    const newSubject = { name: subjectName.trim(), code: subjectCode.trim() };
    setSubjects([...subjects, newSubject]);
    setSubjectName("");
    setSubjectCode("");
  };

  // ✅ Save all subjects
  const handleSave = async () => {
    if (!classLevel || subjects.length === 0)
      return alert("Select a class and add at least one subject.");

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
        const refreshed = await fetch(
          `/api/adminapi/subjects?classLevel=${classLevel}`
        );
        const refreshData = await refreshed.json();
        if (refreshData.success) {
          const subjectList = Array.isArray(refreshData.subjects)
            ? refreshData.subjects[0]?.subjects || []
            : refreshData.subjects?.subjects || [];
          setExistingSubjects(subjectList);
        }
      } else {
        alert(data.error || "Error saving subjects.");
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      alert("Network error. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container py-5">
      <div className="p-4 shadow rounded-4 login-card border border-warning-subtle ">
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
              <button className="btn btn-primary" onClick={addSubject}>
                Add
              </button>
            </div>

            {subjects.length > 0 && (
              <div className="mb-4">
                <h6 className="fw-semibold text-success">
                  Pending Subjects to Save:
                </h6>
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
                          setSubjects(
                            subjects.filter((_, index) => index !== i)
                          )
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
                    <li key={i} className="list-group-item">
                      {sub.name} {sub.code && <small>({sub.code})</small>}
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

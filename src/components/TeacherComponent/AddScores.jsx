"use client";
import { useState, useEffect } from "react";

export default function AddScores({
  learners,
  selectedLearner,
  setSelectedLearner,
}) {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [session, setSession] = useState("");
  const [term, setTerm] = useState("First Term");
  const [sessions, setSessions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [scores, setScores] = useState({
    CA1: "",
    CA2: "",
    HF: "",
    Project: "",
    Exams: "",
  });
  const [termObj, setTermObj] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loadingScores, setLoadingScores] = useState(false);

  // ✅ Get Teacher info
  useEffect(() => {
    const stored = localStorage.getItem("teacherData");
    if (stored) setTeacher(JSON.parse(stored));
  }, []);

  // ✅ Fetch sessions
  useEffect(() => {
    fetch("/api/adminapi/sessions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.sessions?.length) {
          setSessions(data.sessions);
          const latest =
            data.sessions.find((s) => s.isActive) ||
            data.sessions[data.sessions.length - 1];
          setSession(latest?.sessionName || "");
        }
      })
      .catch((err) => console.error("❌ Error fetching sessions:", err));
  }, []);

  // ✅ Fetch teacher’s assigned class
  useEffect(() => {
    async function fetchAssignedClass() {
      if (!teacher?._id) return;
      try {
        const res = await fetch(`/api/teachers/class/${teacher._id}`);
        const data = await res.json();
        if (data.success && data.classLevel) {
          setSelectedClass(data.classLevel);
        } else {
          console.warn("No class assigned to this teacher");
        }
      } catch (err) {
        console.error("❌ Error fetching assigned class:", err);
      }
    }
    fetchAssignedClass();
  }, [teacher]);

  // ✅ Fetch subjects for the teacher’s class
  useEffect(() => {
    async function fetchSubjects() {
      if (!selectedClass) {
        setSubjects([]);
        return;
      }
      try {
        const res = await fetch(
          `/api/adminapi/subjects?classLevel=${encodeURIComponent(
            selectedClass
          )}`
        );
        const data = await res.json();
        if (
          data.success &&
          Array.isArray(data.subjects) &&
          data.subjects.length
        ) {
          setSubjects(data.subjects[0].subjects || []);
        } else {
          setSubjects([]);
        }
      } catch (err) {
        console.error("❌ Error fetching subjects:", err);
        setSubjects([]);
      }
    }
    fetchSubjects();
  }, [selectedClass]);

  // ✅ Fetch learner’s saved results
  useEffect(() => {
    if (!selectedLearner || !term || !session) return;
    async function fetchScores() {
      setLoadingScores(true);
      try {
        const res = await fetch(
          `/api/results/${selectedLearner}?term=${encodeURIComponent(
            term
          )}&session=${encodeURIComponent(session)}`
        );
        const data = await res.json();
        if (data.success && data.result) {
          setTermObj(data.result);
        } else {
          setTermObj(null);
        }
      } catch (err) {
        console.error("❌ Error fetching scores:", err);
      } finally {
        setLoadingScores(false);
      }
    }
    fetchScores();
  }, [selectedLearner, term, session]);

  const handleChange = (field, value) => {
    setScores({ ...scores, [field]: value });
  };

  const handleSave = async () => {
    if (!selectedLearner || !selectedSubject) {
      return setMessage("⚠️ Please select learner and subject first!");
    }

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`/api/results/${selectedLearner}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learnerId: selectedLearner,
          subject: selectedSubject,
          scores,
          term,
          session,
          teacherId: teacher?._id,
          classLevel: selectedClass,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ Record saved successfully!");
        setScores({ CA1: "", CA2: "", HF: "", Project: "", Exams: "" });
      } else {
        setMessage("❌ Failed to save record!");
      }
    } catch (err) {
      console.error("❌ Error saving record:", err);
      setMessage("❌ Server error while saving.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Map subjects with scores
  const mappedSubjectsWithScores = () => {
    const subs = subjects || [];
    return subs.map((s) => {
      const entry = (termObj?.subjects || []).find((r) => r.subject === s.name);
      return {
        name: s.name,
        code: s.code,
        CA1: entry?.CA1 ?? "-",
        CA2: entry?.CA2 ?? "-",
        HF: entry?.HF ?? "-",
        Project: entry?.Project ?? "-",
        Exams: entry?.Exams ?? "-",
        Total: entry?.Total ?? "-",
        Grade: entry?.Grade ?? "-",
        Remark: entry?.Remark ?? "-",
      };
    });
  };

  return (
    <div>
      <h5 className="fw-semibold mb-3">Add Learner Results</h5>

      {/* Learner Selection */}
      <div className="mb-3">
        <label className="form-label fw-bold">Select Learner</label>
        <select
          className="login-input"
          value={selectedLearner}
          onChange={(e) => setSelectedLearner(e.target.value)}
        >
          <option value="">-- Choose Learner --</option>
          {learners?.length ? (
            learners.map((l) => (
              <option key={l._id} value={l._id}>
                {l.fullName}
              </option>
            ))
          ) : (
            <option disabled>No learners assigned</option>
          )}
        </select>
      </div>

      {/* Subject Selection */}
      <div className="mb-3">
        <label className="form-label fw-bold">Select Subject</label>
        <select
          className="login-input"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">-- Choose Subject --</option>
          {subjects?.length ? (
            subjects.map((subj, i) => (
              <option key={i} value={subj.name}>
                {subj.name}
              </option>
            ))
          ) : (
            <option disabled>No subjects found</option>
          )}
        </select>
      </div>

      {/* Session & Term */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Session</label>
          <select
            className="login-input"
            value={session}
            onChange={(e) => setSession(e.target.value)}
          >
            <option value="">-- Select Session --</option>
            {sessions.map((s) => (
              <option key={s._id} value={s.sessionName}>
                {s.sessionName}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Term</label>
          <select
            className="login-input"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          >
            <option>First Term</option>
            <option>Second Term</option>
            <option>Third Term</option>
          </select>
        </div>
      </div>

      {/* Score Inputs */}
      <form className="card p-3 shadow-sm">
        <div className="row g-3">
          {[
            { label: "CA1 (15)", key: "CA1" },
            { label: "CA2 (15)", key: "CA2" },
            { label: "Home Fun (5)", key: "HF" },
            { label: "Project (5)", key: "Project" },
            { label: "Exams (60)", key: "Exams" },
          ].map(({ label, key }) => (
            <div key={key} className="col-md-4 col-6">
              <label className="form-label">{label}</label>
              <input
                type="number"
                className="login-input"
                value={scores[key]}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="btn-get mt-3 w-100 w-md-auto"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Saving...
            </>
          ) : (
            "Save Record"
          )}
        </button>

        {message && (
          <p
            className={`mt-3 fw-semibold ${
              message.startsWith("✅")
                ? "text-success"
                : message.startsWith("⚠️")
                ? "text-warning"
                : "text-danger"
            }`}
          >
            {message}
          </p>
        )}
      </form>

      {/* 🧾 Mapped Subjects Table */}
      {loadingScores ? (
        <div className="text-center mt-4">
          <div className="spinner-border text-warning"></div>
          <p className="small mt-2 text-muted">Loading scores...</p>
        </div>
      ) : (
        <div className="table-responsive mt-4">
          <h6 className="fw-semibold">
            All Subjects ({term}) –{" "}
            <span className="text-success">{session}</span>
          </h6>

          <table className="table table-sm table-bordered text-center">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Subject</th>
                <th>CA1</th>
                <th>CA2</th>
                <th>HF</th>
                <th>Project</th>
                <th>Exams</th>
                <th>Total</th>
                <th>Grade</th>
                <th>Remark</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {mappedSubjectsWithScores().map((s, i) => (
                <tr key={s.name}>
                  <td>{i + 1}</td>
                  <td>
                    {s.name}
                    {s.code && <div className="small">({s.code})</div>}
                  </td>
                  <td>{s.CA1}</td>
                  <td>{s.CA2}</td>
                  <td>{s.HF}</td>
                  <td>{s.Project}</td>
                  <td>{s.Exams}</td>
                  <td>{s.Total}</td>
                  <td>{s.Grade}</td>
                  <td>{s.Remark}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setSelectedSubject(s.name)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

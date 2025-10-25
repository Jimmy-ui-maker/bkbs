"use client";
import { useState, useEffect, useCallback } from "react";

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
  const [termObj, setTermObj] = useState(null); // currently viewed term object
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loadingScores, setLoadingScores] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  // Get teacher info from localStorage (supports both teacherData object or just id)
  useEffect(() => {
    const stored = localStorage.getItem("teacherData");
    if (stored) {
      try {
        setTeacher(JSON.parse(stored));
        return;
      } catch (e) {
        // fallthrough
      }
    }
    const teacherId = localStorage.getItem("teacherId");
    if (teacherId) {
      setTeacher({ _id: teacherId });
    }
  }, []);

  // Fetch sessions
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

  // Fetch teacher's assigned class
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

  // Fetch subjects for the teacher's class
  useEffect(() => {
    async function fetchSubjects() {
      if (!selectedClass) {
        setSubjects([]);
        return;
      }
      setSubjectsLoading(true);
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
          // your admin api returns something like [{ subjects: [{ name, code }, ...] }]
          // we normalize to an array of { name, code }.
          const subs = data.subjects[0].subjects || [];
          // convert if subject entries are plain strings
          const normalized = subs.map((s) =>
            typeof s === "string" ? { name: s } : s
          );
          setSubjects(normalized);
        } else {
          setSubjects([]);
        }
      } catch (err) {
        console.error("❌ Error fetching subjects:", err);
        setSubjects([]);
      } finally {
        setSubjectsLoading(false);
      }
    }
    fetchSubjects();
  }, [selectedClass]);

  // fetchScores: GET /api/results/:learnerId then find session and term locally (like exam officer)
  const fetchScores = useCallback(
    async (
      learnerId = selectedLearner,
      currentTerm = term,
      currentSession = session
    ) => {
      if (!learnerId || !currentTerm || !currentSession) {
        setTermObj(null);
        return;
      }
      setLoadingScores(true);
      try {
        const res = await fetch(
          `/api/results/${learnerId}?session=${encodeURIComponent(
            currentSession
          )}&term=${encodeURIComponent(currentTerm)}`
        );

        const data = await res.json();
        if (data.success && Array.isArray(data.results)) {
          // find session doc
          const sessDoc = data.results.find(
            (r) => r.session === currentSession
          );
          if (sessDoc && Array.isArray(sessDoc.results)) {
            const t = sessDoc.results.find((x) => x.term === currentTerm);
            if (t) {
              setTermObj(t);
              return;
            }
          }
          // no data found: clear termObj
          setTermObj(null);
        } else {
          setTermObj(null);
        }
      } catch (err) {
        console.error("❌ Error fetching scores:", err);
        setTermObj(null);
      } finally {
        setLoadingScores(false);
      }
    },
    [selectedLearner, term, session]
  );

  // Fetch learner’s saved results whenever selectedLearner, term or session changes
  useEffect(() => {
    fetchScores();
  }, [selectedLearner, term, session, fetchScores]);

  const handleChange = (field, value) => {
    // Basic numeric sanitation - allow empty or numeric
    if (value === "" || /^\d*$/.test(String(value))) {
      setScores({ ...scores, [field]: value });
    }
  };

  // client-side validation rules (max values same as exam officer)
  const FIELD_MAX = { CA1: 15, CA2: 15, HF: 5, Project: 5, Exams: 60 };

  const handleSave = async () => {
    if (!selectedLearner || !selectedSubject) {
      return setMessage("⚠️ Please select learner and subject first!");
    }
    if (!session || !term) {
      return setMessage("⚠️ Please select session and term first!");
    }

    // Validate numeric values
    for (const key of Object.keys(scores)) {
      const raw = scores[key];
      if (raw !== "" && raw !== null) {
        const n = Number(raw);
        if (isNaN(n) || n < 0 || n > FIELD_MAX[key]) {
          return setMessage(
            `⚠️ ${key} must be between 0 and ${FIELD_MAX[key]}`
          );
        }
      }
    }

    setSaving(true);
    setMessage("");

    try {
      const payload = {
        learnerId: selectedLearner,
        subject: selectedSubject,
        term,
        session,
        teacherId: teacher?._id,
        classLevel: selectedClass,
        // follow your backend expected shape: include only numeric fields that are present
        ...Object.fromEntries(
          Object.entries(scores).filter(([_, v]) => v !== "" && v !== null)
        ),
      };

      const res = await fetch(`/api/results/${selectedLearner}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        console.error("Save response:", data);
        setMessage(data.error || "❌ Failed to save record!");
      } else {
        setMessage("✅ Record saved successfully!");
        setScores({ CA1: "", CA2: "", HF: "", Project: "", Exams: "" });
        // Immediately refresh term data so the table updates (server returns sessionResult in exam officer flow)
        await fetchScores(selectedLearner, term, session);
      }
    } catch (err) {
      console.error("❌ Error saving record:", err);
      setMessage("❌ Server error while saving.");
    } finally {
      setSaving(false);
    }
  };

  // Map subjects array to display values using the current termObj
  const mappedSubjectsWithScores = () => {
    const subs = subjects || [];
    return subs.map((s) => {
      const subjName = typeof s === "string" ? s : s.name;
      const entry = (termObj?.subjects || []).find(
        (r) => r.subject === subjName
      );
      return {
        name: subjName,
        code: s.code,
        CA1: entry?.CA1 ?? "-",
        CA2: entry?.CA2 ?? "-",
        HF: entry?.HF ?? "-",
        Project: entry?.Project ?? "-",
        Exams: entry?.Exams ?? "-",
        Total: entry?.Total ?? "-",
        Grade: entry?.Grade ?? "-",
        Remark: entry?.Remark ?? "-",
        Highest: entry?.Highest ?? "-", // 👈 added
        Lowest: entry?.Lowest ?? "-", // 👈 added
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
          value={selectedLearner || ""}
          onChange={(e) => {
            setSelectedLearner(e.target.value);
            setSelectedSubject("");
            setTermObj(null);
            setMessage("");
          }}
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
          value={selectedSubject || ""}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">-- Choose Subject --</option>
          {subjectsLoading ? (
            <option disabled>Loading subjects...</option>
          ) : subjects?.length ? (
            subjects.map((subj, i) => (
              <option
                key={i}
                value={typeof subj === "string" ? subj : subj.name}
              >
                {typeof subj === "string" ? subj : subj.name}
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
            value={session || ""}
            onChange={(e) => setSession(e.target.value)}
          >
            <option value="">-- Select Session --</option>
            {sessions.map((s) => (
              <option
                key={s._id || s.sessionName}
                value={s.sessionName || s.name}
              >
                {s.sessionName || s.name} {s.isActive ? "(Active)" : ""}
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
      <form className="card p-3 shadow-sm" onSubmit={(e) => e.preventDefault()}>
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
                min="0"
                max={FIELD_MAX[key]}
              />
            </div>
          ))}
        </div>

        <div className="d-flex gap-2 mt-3 flex-wrap">
          <button
            type="button"
            className="btn-get w-100 w-md-auto"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                {selectedSubject && scores.CA1 ? "Updating..." : "Saving..."}
              </>
            ) : selectedSubject && scores.CA1 ? (
              "Update Record"
            ) : (
              "Save Record"
            )}
          </button>

          {selectedSubject && scores.CA1 && (
            <button
              type="button"
              className="btn btn-outline-secondary w-100 w-md-auto"
              onClick={() => {
                setScores({ CA1: "", CA2: "", HF: "", Project: "", Exams: "" });
                setSelectedSubject("");
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>

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

      {/* Mapped Subjects Table */}
      {loadingScores ? (
        <div className="text-center mt-4">
          <div className="spinner-border text-warning" />
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
                <th>Highest</th> {/* 👈 added */}
                <th>Lowest</th> {/* 👈 added */}
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
                  <td>{s.Highest}</td> {/* 👈 added */}
                  <td>{s.Lowest}</td> {/* 👈 added */}
                  <td>{s.Grade}</td>
                  <td>{s.Remark}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        setSelectedSubject(s.name);
                        setScores({
                          CA1: s.CA1 !== "-" ? s.CA1 : "",
                          CA2: s.CA2 !== "-" ? s.CA2 : "",
                          HF: s.HF !== "-" ? s.HF : "",
                          Project: s.Project !== "-" ? s.Project : "",
                          Exams: s.Exams !== "-" ? s.Exams : "",
                        });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {mappedSubjectsWithScores().length === 0 && (
                <tr>
                  <td colSpan="13">No subjects found for this class/term</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

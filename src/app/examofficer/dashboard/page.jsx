"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ExamOfficerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [learners, setLearners] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("First Term");

  const [scores, setScores] = useState({
    CA1: "",
    CA2: "",
    HF: "",
    Project: "",
    Exams: "",
  });

  const [resultDoc, setResultDoc] = useState(null);
  const [selectedSubjectEntry, setSelectedSubjectEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [results, setResults] = useState([]);

  // ✅ FIELDS meta
  const FIELDS = [
    { key: "CA1", label: "CA1", max: 15 },
    { key: "CA2", label: "CA2", max: 15 },
    { key: "HF", label: "Home Fun", max: 5 },
    { key: "Project", label: "Project", max: 5 },
    { key: "Exams", label: "Exams", max: 60 },
  ];

  // ✅ Auth check
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) router.push("/officerslogin");
    else setUser(JSON.parse(storedUser));
    setCheckingAuth(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/officerslogin");
  };

  // ✅ Fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch("/api/adminapi/sessions");
        const data = await res.json();
        if (data.success && data.sessions.length > 0) {
          setSessions(data.sessions);
          const active =
            data.sessions.find((s) => s.isActive) || data.sessions[0];
          setCurrentSession(active.sessionName);
          setSelectedSession(active.sessionName);
        }
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
        setSessions([{ sessionName: "2024/2025", isActive: true }]);
        setCurrentSession("2024/2025");
        setSelectedSession("2024/2025");
      }
    };
    fetchSessions();
  }, []);

  // ✅ Fetch learners
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/learners");
        const data = await res.json();
        if (data.success) setLearners(data.learners);
      } catch (err) {
        console.error("Error loading learners", err);
      }
    })();
  }, []);

  // ✅ Fetch subjects for class
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
          setSubjects(data.subjects[0].subjects || []);
        } else setSubjects([]);
      } catch (err) {
        console.error("Error fetching subjects", err);
        setSubjects([]);
      } finally {
        setSubjectsLoading(false);
      }
    }
    fetchSubjects();
  }, [selectedClass]);

  // ✅ Fetch learner results
  useEffect(() => {
    async function fetchResults() {
      setResults([]);
      setResultDoc(null);
      setSelectedSubjectEntry(null);
      setSelectedSubject("");
      if (!selectedLearner?._id) return;

      try {
        const res = await fetch(`/api/results/${selectedLearner._id}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.results)) {
          setResults(data.results);
        } else setResults([]);
      } catch (err) {
        console.error("Error fetching results", err);
        setResults([]);
      }
    }
    fetchResults();
  }, [selectedLearner]);

  // ✅ Update current resultDoc when term/session changes
  useEffect(() => {
    if (!selectedLearner || !selectedSession || !selectedTerm) return;

    const existing = results.find(
      (r) =>
        r.session?.trim() === selectedSession.trim() &&
        r.term?.trim().toLowerCase() === selectedTerm.trim().toLowerCase()
    );

    if (existing) {
      setResultDoc(existing);
    } else {
      // Fresh record for new session/term
      setResultDoc({
        learnerId: selectedLearner._id,
        session: selectedSession,
        term: selectedTerm,
        subjects: [],
      });
    }
  }, [results, selectedSession, selectedTerm, selectedLearner]);

  // ✅ Update selected subject
  useEffect(() => {
    setSelectedSubjectEntry(null);
    setScores({ CA1: "", CA2: "", HF: "", Project: "", Exams: "" });
    if (!selectedSubject || !resultDoc) return;

    const s = (resultDoc.subjects || []).find(
      (x) => x.subject === selectedSubject
    );
    if (s) {
      setSelectedSubjectEntry(s);
      setScores({
        CA1: s.CA1 ?? "",
        CA2: s.CA2 ?? "",
        HF: s.HF ?? "",
        Project: s.Project ?? "",
        Exams: s.Exams ?? "",
      });
    }
  }, [selectedSubject, resultDoc]);

  // ✅ Save scores
  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedLearner?._id) return alert("Select a learner first.");
    if (!selectedSubject) return alert("Select a subject.");

    const payload = {
      subject: selectedSubject,
      term: selectedTerm,
      session: selectedSession,
    };

    let hasAny = false;
    for (const f of FIELDS) {
      const raw = scores[f.key];
      if (raw !== undefined && raw !== null && String(raw).trim() !== "") {
        const num = Number(raw);
        if (isNaN(num) || num < 0 || num > f.max) {
          return alert(`${f.label} must be between 0 and ${f.max}`);
        }
        payload[f.key] = num;
        hasAny = true;
      }
    }
    if (!hasAny) return alert("Enter at least one score to save.");

    setLoading(true);
    try {
      const res = await fetch(`/api/results/${selectedLearner._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.success) return alert(data.error || "Failed to save scores.");

      if (data.result) {
        setResultDoc(data.result);
        setResults((prev) => {
          const updated = [...prev];
          const idx = updated.findIndex(
            (r) =>
              r.session === data.result.session && r.term === data.result.term
          );
          if (idx >= 0) updated[idx] = data.result;
          else updated.push(data.result);
          return updated;
        });
      }

      alert("✅ Scores saved successfully!");
      setScores({ CA1: "", CA2: "", HF: "", Project: "", Exams: "" });
    } catch (err) {
      console.error("Error saving scores", err);
      alert("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const mappedSubjectsWithScores = () => {
    const subs = subjects || [];
    return subs.map((s) => {
      const entry = (resultDoc?.subjects || []).find(
        (r) => r.subject === s.name
      );
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
      };
    });
  };

  const classes = [...new Set(learners.map((l) => l.classLevel))];

  if (checkingAuth) {
    return (
      <div className="d-flex vh-100 justify-content-center align-items-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <section className="container py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2">
        <div>
          <h4 className="fw-bold text-primary mb-0">Exam Officer Page</h4>
          <small>
            {user?.name} ({user?.email}) — {user?.role}
          </small>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger btn-sm"
        >
          Logout
        </button>
      </div>

      <hr className="line" />

      <div className="login-card p-4 shadow rounded-4 border">
        {/* Class select */}
        <div className="mb-4 text-center">
          <label className="form-label fw-semibold me-2">Select Class:</label>
          <select
            className="form-select d-inline-block login-input"
            style={{ width: "220px" }}
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedLearner(null);
              setSelectedSubject("");
              setResultDoc(null);
              setSubjects([]);
            }}
          >
            <option value="">-- Choose Class --</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        {/* Learners table */}
        {selectedClass && !subjectsLoading && (
          <div className="table-responsive mb-5">
            <table className="table table-bordered align-middle text-center">
              <thead className="table-warning">
                <tr>
                  <th>#</th>
                  <th>Admission No</th>
                  <th>Full Name</th>
                  <th>Gender</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {learners
                  .filter((l) => l.classLevel === selectedClass)
                  .map((learner, i) => (
                    <tr key={learner._id}>
                      <td>{i + 1}</td>
                      <td>{learner.admissionNo}</td>
                      <td>{learner.fullName}</td>
                      <td>{learner.gender}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            setSelectedLearner(learner);
                            setSelectedSubject("");
                            setResultDoc(null);
                            setSelectedSubjectEntry(null);
                            setScores({
                              CA1: "",
                              CA2: "",
                              HF: "",
                              Project: "",
                              Exams: "",
                            });
                          }}
                        >
                          Add / View Scores
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Score entry form */}
        {selectedLearner && (
          <div className="score-form p-4 rounded-4 login-card shadow-sm">
            <h5 className="fw-bold mb-3 text-center text-success">
              Scores for {selectedLearner.fullName}
            </h5>

            {/* TERM / SESSION SELECT */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Select Term</label>
                <select
                  className="form-select login-input"
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                >
                  <option value="">-- Choose Term --</option>
                  <option value="First Term">First Term</option>
                  <option value="Second Term">Second Term</option>
                  <option value="Third Term">Third Term</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Select Session</label>
                <select
                  className="form-select login-input"
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                >
                  <option value="">-- Choose Session --</option>
                  {sessions.map((s) => (
                    <option key={s.sessionName} value={s.sessionName}>
                      {s.sessionName} {s.isActive ? "(Active)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subject select */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Select Subject</label>
              <select
                className="form-select login-input"
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedSubjectEntry(null);
                  setScores({
                    CA1: "",
                    CA2: "",
                    HF: "",
                    Project: "",
                    Exams: "",
                  });
                }}
              >
                <option value="">
                  {subjectsLoading
                    ? "Loading subjects..."
                    : "-- Choose Subject --"}
                </option>
                {!subjectsLoading &&
                  subjects.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Inputs */}
            <form onSubmit={handleSave}>
              <div className="row">
                {FIELDS.map(({ key, label, max }) => (
                  <div className="col-md-4 mb-3" key={key}>
                    <label className="form-label fw-semibold">
                      {label} ({max})
                    </label>
                    <input
                      type="number"
                      className="form-control login-input"
                      max={max}
                      min="0"
                      placeholder={`Enter ${label}`}
                      value={scores[key]}
                      onChange={(e) =>
                        setScores((p) => ({ ...p, [key]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="text-center mt-3">
                <button
                  type="submit"
                  className="btn btn-warning fw-semibold"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Scores"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={() => setSelectedLearner(null)}
                >
                  Close
                </button>
              </div>
            </form>

            {/* ✅ mapped subjects table */}
            <div className="table-responsive mt-4">
              <h6 className="fw-semibold">
                All Subjects ({selectedTerm || "Term not selected"}) –{" "}
                <span className="text-success">
                  {selectedSession || "Session not selected"}
                </span>
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
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mappedSubjectsWithScores().map((s, i) => (
                    <tr key={s.name}>
                      <td>{i + 1}</td>
                      <td>
                        {s.name}
                        {s.code && (
                          <div className="small text-muted">({s.code})</div>
                        )}
                      </td>
                      <td>{s.CA1}</td>
                      <td>{s.CA2}</td>
                      <td>{s.HF}</td>
                      <td>{s.Project}</td>
                      <td>{s.Exams}</td>
                      <td>{s.Total}</td>
                      <td>{s.Grade}</td>
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
          </div>
        )}
      </div>
    </section>
  );
}

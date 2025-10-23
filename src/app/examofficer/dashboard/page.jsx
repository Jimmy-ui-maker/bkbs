// src/app/examofficer/dashboard/page.jsx (or wherever your component is)
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

  // current term object (structure: { term, subjects: [...] })
  const [termObj, setTermObj] = useState(null);
  const [selectedSubjectEntry, setSelectedSubjectEntry] = useState(null);

  const [loading, setLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [results, setResults] = useState([]); // session-docs for learner

  // FIELDS meta
  const FIELDS = [
    { key: "CA1", label: "CA1", max: 15 },
    { key: "CA2", label: "CA2", max: 15 },
    { key: "HF", label: "Home Fun", max: 5 },
    { key: "Project", label: "Project", max: 5 },
    { key: "Exams", label: "Exams", max: 60 },
  ];

  // auth check
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/officerslogin");
    } else {
      setUser(JSON.parse(storedUser));
    }
    setCheckingAuth(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/officerslogin");
  };

  // fetch sessions
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
        } else {
          setSessions([]);
        }
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
        setSessions([]);
        setCurrentSession("2024/2025");
        setSelectedSession("2024/2025");
      }
    };
    fetchSessions();
  }, []);

  // fetch learners
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

  // fetch subjects for class
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

  // fetch results (session docs) for selected learner
  useEffect(() => {
    async function fetchResults() {
      setResults([]);
      setTermObj(null);
      setSelectedSubject("");
      if (!selectedLearner?._id) return;

      try {
        const res = await fetch(`/api/results/${selectedLearner._id}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.results)) {
          // results are session-docs (each with .session and .results array)
          setResults(data.results);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Error fetching results", err);
        setResults([]);
      }
    }
    fetchResults();
  }, [selectedLearner]);

  // when session or term or results or selectedLearner changes — compute current termObj
  useEffect(() => {
    if (!selectedLearner || !selectedSession || !selectedTerm) {
      setTermObj(null);
      return;
    }

    // find session doc
    const sessDoc = results.find((r) => r.session === selectedSession);

    if (sessDoc && Array.isArray(sessDoc.results)) {
      const t = sessDoc.results.find((x) => x.term === selectedTerm);
      if (t) {
        setTermObj(t);
        return;
      }
    }

    // no existing term -> fresh empty term
    setTermObj({
      term: selectedTerm,
      subjects: [],
    });
  }, [results, selectedSession, selectedTerm, selectedLearner]);

  // when selected subject changes, fill scores from termObj
  useEffect(() => {
    setSelectedSubjectEntry(null);
    setScores({ CA1: "", CA2: "", HF: "", Project: "", Exams: "" });
    if (!selectedSubject || !termObj) return;

    const subj = (termObj.subjects || []).find(
      (s) => s.subject === selectedSubject
    );
    if (subj) {
      setSelectedSubjectEntry(subj);
      setScores({
        CA1: subj.CA1 ?? "",
        CA2: subj.CA2 ?? "",
        HF: subj.HF ?? "",
        Project: subj.Project ?? "",
        Exams: subj.Exams ?? "",
      });
    }
  }, [selectedSubject, termObj]);

  // compute percent
  const computePercent = () => {
    if (!selectedSubject) return 0;
    const entry = selectedSubjectEntry;
    const totalFields = FIELDS.length;
    const filled = FIELDS.reduce((acc, f) => {
      const v = entry ? entry[f.key] : undefined;
      return acc + (v !== undefined && v !== null ? 1 : 0);
    }, 0);
    return Math.round((filled / totalFields) * 100);
  };

  // Save scores -> POST to API. API returns updated session-doc in sessionResult
  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedLearner?._id) return alert("Select a learner first.");
    if (!selectedSubject) return alert("Select a subject.");
    if (!selectedSession) return alert("Select a session.");

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
      if (!data.success) {
        alert(data.error || "Failed to save scores.");
        return;
      }

      // server returns sessionResult (the full session doc)
      if (data.sessionResult) {
        // merge / replace into local results[]
        setResults((prev) => {
          const copy = [...prev];
          const idx = copy.findIndex(
            (r) =>
              r._id === data.sessionResult._id ||
              r.session === data.sessionResult.session
          );
          if (idx >= 0) copy[idx] = data.sessionResult;
          else copy.push(data.sessionResult);
          return copy;
        });

        // set current termObj to the returned term if present
        if (data.term) {
          setTermObj(data.term);
        }
      }

      alert("✅ Scores saved successfully!");
      setScores({ CA1: "", CA2: "", HF: "", Project: "", Exams: "" });
      setSelectedSubject(""); // optional: reset selection to force reload if needed
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
              setTermObj(null);
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
                            setTermObj(null);
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

            {/* mapped subjects table */}
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
          </div>
        )}
      </div>
    </section>
  );
}

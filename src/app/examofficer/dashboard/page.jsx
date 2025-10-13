"use client";

import { useEffect, useState } from "react";

export default function ExamOfficerDashboard() {
  const [learners, setLearners] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  // NOTE: use "HF" — keep backend & frontend keys consistent
  const [scores, setScores] = useState({
    CA1: "",
    CA2: "",
    HF: "",
    Project: "",
    Exams: "",
  });
  const [existingResult, setExistingResult] = useState(null); // this will be the single subject object returned by server
  const [loading, setLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  // fields order (server keys) and display info
  const FIELDS = [
    { key: "CA1", label: "CA1", max: 15 },
    { key: "CA2", label: "CA2", max: 15 },
    { key: "HF", label: "Home Fun", max: 5 },
    { key: "Project", label: "Project", max: 5 },
    { key: "Exams", label: "Exams", max: 60 },
  ];

  // Fetch learners
  useEffect(() => {
    async function fetchLearners() {
      try {
        const res = await fetch("/api/learners");
        const data = await res.json();
        if (data.success) setLearners(data.learners);
      } catch (error) {
        console.error("Error fetching learners:", error);
      }
    }
    fetchLearners();
  }, []);

  // Fetch subjects for selected class
  useEffect(() => {
    async function fetchSubjects() {
      if (!selectedClass) return;
      setSubjectsLoading(true);
      try {
        // your API path (you told me route lives at src/app/api/adminapi/subjects)
        const res = await fetch(
          `/api/adminapi/subjects?classLevel=${encodeURIComponent(
            selectedClass
          )}`
        );
        const data = await res.json();
        console.log("Fetched subjects:", data);
        if (
          data.success &&
          Array.isArray(data.subjects) &&
          data.subjects.length > 0
        ) {
          setSubjects(data.subjects[0].subjects || []);
        } else {
          setSubjects([]);
        }
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setSubjects([]);
      } finally {
        setSubjectsLoading(false);
      }
    }
    fetchSubjects();
  }, [selectedClass]);

  // Fetch existing result for selected learner + selected subject
  useEffect(() => {
    async function fetchResultForSubject() {
      if (!selectedLearner?._id || !selectedSubject) {
        setExistingResult(null);
        return;
      }

      try {
        // GET returns all results for the learner (array of result docs)
        const res = await fetch(`/api/results/${selectedLearner._id}`);
        const data = await res.json();
        if (!data.success) {
          setExistingResult(null);
          return;
        }

        // find the result doc that matches the term/session if you have them,
        // otherwise pick the most recent one (first)
        const resultDocs = Array.isArray(data.results) ? data.results : [];
        if (resultDocs.length === 0) {
          setExistingResult(null);
          return;
        }

        // If you track term/session, refine selection here. For now take the most relevant:
        const resultDoc = resultDocs[0];

        // Now find the subject entry inside resultDoc.subjects
        const subjectEntry = (resultDoc.subjects || []).find(
          (s) => s.subject === selectedSubject
        );

        if (subjectEntry) {
          setExistingResult(subjectEntry);
        } else {
          setExistingResult(null);
        }
      } catch (err) {
        console.error("Error fetching result:", err);
        setExistingResult(null);
      }
    }

    fetchResultForSubject();
  }, [selectedLearner, selectedSubject]);

  // Handle score submission (step-by-step)
  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLearner?._id) return alert("Select a learner first.");
    if (!selectedSubject) return alert("Select a subject.");

    // find next field that is not yet set in existingResult
    const nextFieldObj = FIELDS.find((f) => {
      const val = existingResult ? existingResult[f.key] : undefined;
      return val === undefined || val === null;
    });

    if (!nextFieldObj)
      return alert("All scores already entered for this subject.");

    const nextKey = nextFieldObj.key;
    const rawValue = scores[nextKey];

    if (String(rawValue).trim() === "")
      return alert(`Enter score for ${nextFieldObj.label}.`);

    const numeric = Number(rawValue);
    if (isNaN(numeric) || numeric < 0 || numeric > nextFieldObj.max) {
      return alert(
        `Invalid ${nextFieldObj.label} score. Must be between 0 and ${nextFieldObj.max}.`
      );
    }

    setLoading(true);
    try {
      // send only the field being updated (partial update)
      const payload = {
        subject: selectedSubject,
        [nextKey]: numeric,
        // optionally add term/session if you want to specify
      };

      const res = await fetch(`/api/results/${selectedLearner._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.error || "Failed to save score.");
        return;
      }

      // server returns resultSubject (single subject) and result (full doc)
      // prefer resultSubject if present
      const updatedSubject =
        data.resultSubject ??
        (data.result?.subjects || []).find(
          (s) => s.subject === selectedSubject
        );

      if (updatedSubject) {
        setExistingResult(updatedSubject);
      } else {
        // fallback: re-fetch results
        // (keeps UI consistent if server response format differs)
        const refetch = await fetch(`/api/results/${selectedLearner._id}`);
        const refData = await refetch.json();
        if (refData.success) {
          const rd = refData.results[0];
          const sub = (rd.subjects || []).find(
            (s) => s.subject === selectedSubject
          );
          setExistingResult(sub || null);
        }
      }

      // clear the input for the field just submitted
      setScores((prev) => ({ ...prev, [nextKey]: "" }));
    } catch (err) {
      console.error("Error saving score:", err);
      alert("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const classes = [...new Set(learners.map((l) => l.classLevel))];

  return (
    <section className="container py-5">
      <div className="login-card p-4 shadow rounded-4 border">
        <h3 className="fw-bold mb-4 text-center text-primary">
          Exam Officer Dashboard
        </h3>

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
              setExistingResult(null);
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

        {/* loading subjects indicator */}
        {subjectsLoading && (
          <p className="text-center text-muted mb-3">Loading subjects...</p>
        )}

        {/* learners table */}
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
                            setExistingResult(null);
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

        {/* score form */}
        {selectedLearner && (
          <div className="score-form p-4 rounded-4 login-card shadow-sm">
            <h5 className="fw-bold mb-3 text-center text-success">
              Scores for {selectedLearner.fullName}
            </h5>

            {/* subject select */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Select Subject</label>
              <select
                className="form-select login-input"
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setExistingResult(null);
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

            {/* existing result table */}
            {existingResult && (
              <div className="table-responsive mb-4">
                <h6 className="fw-bold text-secondary">Current Scores:</h6>
                <table className="table table-sm table-bordered text-center">
                  <thead className="table-light">
                    <tr>
                      {[
                        "CA1",
                        "CA2",
                        "HF",
                        "Project",
                        "Exams",
                        "Total",
                        "Grade",
                      ].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {[
                        "CA1",
                        "CA2",
                        "HF",
                        "Project",
                        "Exams",
                        "Total",
                        "Grade",
                      ].map((f) => (
                        <td key={f}>
                          {existingResult[f] !== undefined &&
                          existingResult[f] !== null
                            ? existingResult[f]
                            : "-"}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* step-by-step inputs */}
            <form onSubmit={handleScoreSubmit}>
              <div className="row">
                {FIELDS.map(({ key, label, max }) => {
                  const isLocked =
                    existingResult &&
                    existingResult[key] !== undefined &&
                    existingResult[key] !== null;
                  return (
                    <div className="col-md-4 mb-3" key={key}>
                      <label className="form-label fw-semibold">
                        {label} ({max})
                      </label>
                      <input
                        type="number"
                        className="form-control login-input"
                        max={max}
                        min="0"
                        disabled={isLocked}
                        placeholder={isLocked ? "Locked" : `Enter ${label}`}
                        value={scores[key]}
                        onChange={(e) =>
                          setScores((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  );
                })}
              </div>

              <div className="text-center mt-3">
                <button
                  type="submit"
                  className="btn btn-warning fw-semibold"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Next Score"}
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
          </div>
        )}
      </div>
    </section>
  );
}

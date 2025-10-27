"use client";

import { useState, useEffect } from "react";
import { addDays, isBefore, format } from "date-fns";
import TermDurationSummary from "./TermDurationSummary";

/**
 * TeacherAttendance
 * Props:
 *  - assignedClass (string)  e.g. "Nursery 2"  <-- important
 *  - teacherId (optional)
 */
export default function TeacherAttendance({ assignedClass, teacherId }) {
  const [learners, setLearners] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [termRange, setTermRange] = useState(null);
  const [weeks, setWeeks] = useState([]); // array of week arrays (each week is array of Date objects, Mon-Fri except first/last may be partial)
  const [attendance, setAttendance] = useState({}); // { learnerId: { "Tue Sep 15 2025": true, ... }, ... }
  const [message, setMessage] = useState("");
  const [collapsedWeeks, setCollapsedWeeks] = useState({});

  // --- sessions & term-dates fetch (once) ---
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/adminapi/sessions");
        const data = await res.json();
        if (data?.success && Array.isArray(data.sessions))
          setSessions(data.sessions);
        else setSessions([]);
      } catch (err) {
        console.error("Failed to fetch sessions", err);
        setSessions([]);
      }
    })();

    (async () => {
      try {
        const res = await fetch("/api/adminapi/term-dates");
        const data = await res.json();
        if (data?.success && Array.isArray(data.terms)) setTerms(data.terms);
        else setTerms([]);
      } catch (err) {
        console.error("Failed to fetch term dates", err);
        setTerms([]);
      }
    })();
  }, []);

  // --- learners for class (triggered when assignedClass is present) ---
  useEffect(() => {
    if (!assignedClass) {
      setLearners([]);
      return;
    }
    (async () => {
      try {
        console.log("🚀 fetching learners for class:", assignedClass);
        const res = await fetch(
          `/api/learners?classLevel=${encodeURIComponent(assignedClass)}`
        );
        const data = await res.json();
        console.log("📥 /api/learners response:", data);
        if (data?.success && Array.isArray(data.learners))
          setLearners(data.learners);
        else setLearners([]);
      } catch (err) {
        console.error("Failed fetching learners:", err);
        setLearners([]);
      }
    })();
  }, [assignedClass]);

  // --- get termRange when session + term selected ---
  useEffect(() => {
    if (!selectedSession || !selectedTerm) {
      setTermRange(null);
      setWeeks([]);
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/adminapi/term-dates");
        const data = await res.json();
        if (!data?.success || !Array.isArray(data.terms)) {
          setTermRange(null);
          return;
        }
        const match = data.terms.find(
          (t) =>
            String(t.session).trim().toLowerCase() ===
              String(selectedSession).trim().toLowerCase() &&
            String(t.term).trim().toLowerCase() ===
              String(selectedTerm).trim().toLowerCase()
        );
        if (match) {
          setTermRange({
            termOpens: match.termOpens,
            termEnds: match.termEnds,
          });
        } else {
          setTermRange(null);
        }
      } catch (err) {
        console.error("Failed to fetch term range:", err);
        setTermRange(null);
      }
    })();
  }, [selectedSession, selectedTerm]);

  // --- generate weeks starting at termOpens (first week may be partial) ---
  useEffect(() => {
    if (!termRange) {
      setWeeks([]);
      setCollapsedWeeks({});
      return;
    }

    try {
      const start = new Date(termRange.termOpens);
      const end = new Date(termRange.termEnds);

      const generated = [];
      let currentStart = start;

      // keep creating weeks until we've passed `end`
      while (currentStart <= end) {
        // weekDays: currentStart .. currentStart + 4 (Mon-Fri concept), but if currentStart mid-week we still take next 5 days.
        const weekDays = [];
        for (let i = 0; i < 5; i++) {
          const d = addDays(currentStart, i);
          if (d > end) break;
          weekDays.push(d);
        }
        generated.push(weekDays);

        // advance currentStart: next week should start 5 days after currentStart,
        // which will move us to the start of the 'next' block (if first week started midweek this lands to the next Monday or appropriate day).
        currentStart = addDays(currentStart, 5);
      }

      setWeeks(generated);

      // init collapse state
      const collapseState = {};
      generated.forEach((_, i) => (collapseState[i] = false));
      setCollapsedWeeks(collapseState);
    } catch (err) {
      console.error("Failed to generate weeks:", err);
      setWeeks([]);
      setCollapsedWeeks({});
    }
  }, [termRange]);

  // --- load existing attendance for the active term range & class, then populate `attendance` state ---
  useEffect(() => {
    if (!assignedClass || !selectedSession || !selectedTerm || !termRange)
      return;

    (async () => {
      try {
        const startIso = new Date(termRange.termOpens).toISOString();
        const endIso = new Date(termRange.termEnds).toISOString();
        const url = `/api/attendance/range?classLevel=${encodeURIComponent(
          assignedClass
        )}&session=${encodeURIComponent(
          selectedSession
        )}&term=${encodeURIComponent(selectedTerm)}&start=${encodeURIComponent(
          startIso
        )}&end=${encodeURIComponent(endIso)}`;

        const res = await fetch(url);
        const data = await res.json();
        if (!data?.success || !data.records) {
          // nothing to map
          return;
        }

        // data.records expected: { "2025-09-15": [{ learnerId, status }, ...], ... }
        const newAttendance = {};
        for (const [dateKey, recs] of Object.entries(data.records)) {
          // dateKey is ISO string or date string; normalize to Date.toDateString for client keys
          const d = new Date(dateKey);
          const key = d.toDateString();
          for (const r of recs) {
            const lid = String(r.learnerId);
            if (!newAttendance[lid]) newAttendance[lid] = {};
            newAttendance[lid][key] = r.status === "Present";
          }
        }

        setAttendance(newAttendance);
      } catch (err) {
        console.error("Failed to load existing attendance:", err);
      }
    })();
  }, [assignedClass, selectedSession, selectedTerm, termRange]);

  // --- toggle checkbox & auto-save single-day record ---
  const toggleAttendance = async (learnerId, date) => {
    if (!assignedClass || !selectedSession || !selectedTerm) {
      setMessage("⚠️ Select session & term first");
      setTimeout(() => setMessage(""), 1800);
      return;
    }

    const key = date.toDateString();
    const newStatus = !attendance[learnerId]?.[key];

    // optimistic UI
    setAttendance((prev) => ({
      ...prev,
      [learnerId]: { ...(prev[learnerId] || {}), [key]: newStatus },
    }));

    try {
      const res = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classLevel: assignedClass,
          session: selectedSession,
          term: selectedTerm,
          date,
          records: [{ learnerId, status: newStatus ? "Present" : "Absent" }],
        }),
      });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.error || "save failed");
      setMessage(`✅ ${format(date, "EEE, MMM d")} saved`);
      setTimeout(() => setMessage(""), 1500);
    } catch (err) {
      console.error("Failed to save attendance:", err);
      setMessage("❌ Failed to save. Try again.");
      setTimeout(() => setMessage(""), 2000);
      // revert optimistic change on failure
      setAttendance((prev) => ({
        ...prev,
        [learnerId]: { ...(prev[learnerId] || {}), [key]: !newStatus },
      }));
    }
  };

  const toggleWeekCollapse = (idx) =>
    setCollapsedWeeks((p) => ({ ...p, [idx]: !p[idx] }));

  return (
    <div className="card shadow-sm p-3">
      <h5 className="fw-bold mb-3">📋 Class Attendance Register</h5>

      {termRange && <TermDurationSummary termRange={termRange} />}

      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <label className="form-label small">Session</label>
          <select
            className="form-select form-select-sm login-input"
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
          >
            <option value="">Select Session</option>
            {sessions.map((s) => (
              <option key={s._id || s.sessionName} value={s.sessionName}>
                {s.sessionName}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label small">Term</label>
          <select
            className="form-select form-select-sm login-input"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
          >
            <option value="">Select Term</option>
            <option value="First Term">First Term</option>
            <option value="Second Term">Second Term</option>
            <option value="Third Term">Third Term</option>
          </select>
        </div>

        <div className="col-md-4 align-self-end">
          <div className="small text-muted">Class: {assignedClass || "—"}</div>
        </div>
      </div>

      {weeks.length === 0 && (
        <div className="text-muted small mb-3">
          Select session & term to load weeks.
        </div>
      )}

      {weeks.map((week, wi) => (
        <div key={wi} className="mb-3 border rounded">
          <div
            className="bg-dark text-white px-3 py-2 d-flex justify-content-between align-items-center"
            style={{ cursor: "pointer" }}
            onClick={() => toggleWeekCollapse(wi)}
          >
            <span>
              🗓️ Week {wi + 1} — {format(week[0], "MMM d")} -{" "}
              {format(week[week.length - 1], "MMM d")}
            </span>
            <span>{collapsedWeeks[wi] ? "▶️ Expand" : "🔽 Collapse"}</span>
          </div>

          {!collapsedWeeks[wi] && (
            <div className="table-responsive">
              <table className="table table-sm table-bordered text-center align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Learner</th>
                    {week.map((day, di) => (
                      <th key={di}>{format(day, "EEE dd")}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {learners.length > 0 ? (
                    learners.map((l) => (
                      <tr key={l._id}>
                        <td className="text-start fw-semibold">{l.fullName}</td>
                        {week.map((day, di) => {
                          const key = day.toDateString();
                          return (
                            <td key={di}>
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={!!attendance[l._id]?.[key]}
                                onChange={() => toggleAttendance(l._id, day)}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={week.length + 1} className="text-muted">
                        No learners assigned to this class.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {message && (
        <div className="alert alert-info mt-3 small text-center">{message}</div>
      )}
    </div>
  );
}

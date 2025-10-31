"use client";

import { useState, useEffect, useRef } from "react";
import { addDays, format, isWeekend } from "date-fns";
import TermDurationSummary from "./TermDurationSummary";

/**
 * TeacherAttendance (client)
 * For per-learner marking, with auto summary based on TermDurationSummary
 */
export default function TeacherAttendance({
  assignedClass,
  teacherId,
  learners = [],
}) {
  const [sessions, setSessions] = useState([]);
  const [selectedLearner, setSelectedLearner] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [termRange, setTermRange] = useState(null);
  const [weeks, setWeeks] = useState([]); // array of arrays (Mon-Fri)
  const [attendance, setAttendance] = useState({});
  const [collapsedWeeks, setCollapsedWeeks] = useState({});
  const [message, setMessage] = useState("");
  const saveTimeout = useRef(null);
  const [effectiveDays, setEffectiveDays] = useState(0);

  // 🔹 Fetch sessions once
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/adminapi/sessions");
        const data = await res.json();
        if (data?.success && Array.isArray(data.sessions))
          setSessions(data.sessions);
      } catch (err) {
        console.error("Failed to fetch sessions", err);
      }
    })();
  }, []);

  // 🔹 When session + term chosen → build week intervals (Mon–Fri)
  useEffect(() => {
    if (!selectedSession || !selectedTerm) {
      setTermRange(null);
      setWeeks([]);
      setCollapsedWeeks({});
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/adminapi/term-dates");
        const data = await res.json();
        if (!data?.success || !Array.isArray(data.terms)) return;

        const match = data.terms.find(
          (t) =>
            t.session.trim().toLowerCase() ===
              selectedSession.trim().toLowerCase() &&
            t.term.trim().toLowerCase() ===
              selectedTerm.trim().toLowerCase()
        );
        if (!match) {
          setTermRange(null);
          setWeeks([]);
          return;
        }

        const start = new Date(match.termOpens);
        const end = new Date(match.termEnds);
        const generated = [];
        let cur = new Date(start);

        while (cur <= end) {
          const week = [];
          for (let i = 0; i < 7 && cur <= end; i++) {
            if (!isWeekend(cur)) week.push(new Date(cur));
            cur = addDays(cur, 1);
          }
          if (week.length) generated.push(week);
        }

        setTermRange({ termOpens: match.termOpens, termEnds: match.termEnds });
        setWeeks(generated);

        // Collapse all by default
        const collapsed = {};
        generated.forEach((_, i) => (collapsed[i] = true));
        setCollapsedWeeks(collapsed);
      } catch (err) {
        console.error("Failed to load term-dates/weeks:", err);
      }
    })();
  }, [selectedSession, selectedTerm]);

  // 🔹 Load existing attendance for selected learner
  useEffect(() => {
    if (!selectedLearner || !termRange || !selectedSession || !selectedTerm) {
      setAttendance({});
      return;
    }

    (async () => {
      try {
        const startIso = new Date(termRange.termOpens).toISOString();
        const endIso = new Date(termRange.termEnds).toISOString();
        const url = `/api/attendance/range?learnerId=${encodeURIComponent(
          selectedLearner
        )}&classLevel=${encodeURIComponent(
          assignedClass
        )}&session=${encodeURIComponent(
          selectedSession
        )}&term=${encodeURIComponent(selectedTerm)}&start=${encodeURIComponent(
          startIso
        )}&end=${encodeURIComponent(endIso)}`;

        const res = await fetch(url);
        const data = await res.json();
        if (!data?.success || !data.records) return setAttendance({});

        const normalized = {};
        for (const [dateKey, recs] of Object.entries(data.records)) {
          const d = new Date(dateKey);
          const key = d.toDateString();
          const rec = (recs || []).find(
            (r) => String(r.learnerId) === String(selectedLearner)
          );
          if (rec) normalized[key] = rec.status === "Present";
        }
        setAttendance(normalized);
      } catch (err) {
        console.error("Failed to fetch attendance:", err);
      }
    })();
  }, [
    selectedLearner,
    termRange,
    selectedSession,
    selectedTerm,
    assignedClass,
  ]);

  // 🔹 Compute summary relative to effectiveDays
  const computeSummary = () => {
    const present = Object.values(attendance).filter(Boolean).length;
    const absent = Math.max(effectiveDays - present, 0);
    const percentage =
      effectiveDays > 0 ? ((present / effectiveDays) * 100).toFixed(1) : 0;
    return { present, absent, percentage };
  };

  // 🔹 Toggle collapse
  const toggleWeekCollapse = (i) =>
    setCollapsedWeeks((p) => ({ ...p, [i]: !p[i] }));

  // 🔹 Toggle attendance checkbox + save
  const toggleAttendance = (day) => {
    if (!selectedLearner || !selectedSession || !selectedTerm) {
      setMessage("⚠️ Select learner, session & term first");
      setTimeout(() => setMessage(""), 1500);
      return;
    }

    const key = day.toDateString();
    const newStatus = !attendance[key];
    setAttendance((p) => ({ ...p, [key]: newStatus }));

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/attendance/mark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classLevel: assignedClass,
            session: selectedSession,
            term: selectedTerm,
            date: day,
            records: [
              {
                learnerId: selectedLearner,
                status: newStatus ? "Present" : "Absent",
              },
            ],
          }),
        });
        const j = await res.json();
        if (!j?.success) throw new Error(j?.error || "Save failed");
        setMessage(`✅ ${format(day, "EEE, MMM d")} saved`);
        setTimeout(() => setMessage(""), 1000);
      } catch (err) {
        console.error("Save failed:", err);
        setMessage("❌ Failed to save");
        setTimeout(() => setMessage(""), 1000);
        setAttendance((p) => ({ ...p, [key]: !newStatus }));
      }
    }, 250);
  };

  const summary = computeSummary();

  return (
    <div className="card login-card shadow-sm p-3">
      <h5 className="fw-bold mb-3">📋 Attendance (per learner)</h5>

      {/* Term Duration Summary with auto callback */}
      {termRange && (
        <TermDurationSummary
          termRange={termRange}
          onEffectiveDaysChange={setEffectiveDays}
        />
      )}

      {/* Controls */}
      <div className="row g-2 mb-3">
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
            className="form-select login-input form-select-sm"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
          >
            <option value="">Select Term</option>
            <option value="First Term">First Term</option>
            <option value="Second Term">Second Term</option>
            <option value="Third Term">Third Term</option>
          </select>
        </div>
      </div>

      {/* Summary Alerts */}
      {selectedLearner && (
        <div className="row text-center mb-3">
          <div className="col-6 col-md-3">
            <div className="alert alert-success py-2 mb-0">
              ✅ Present: <strong>{summary.present}</strong>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="alert alert-danger py-2 mb-0">
              ❌ Absent: <strong>{summary.absent}</strong>
            </div>
          </div>
          <div className="col-6 col-md-3 mt-2 mt-md-0">
            <div className="alert alert-info py-2 mb-0">
              📅 Effective Days: <strong>{effectiveDays}</strong>
            </div>
          </div>
          <div className="col-6 col-md-3 mt-2 mt-md-0">
            <div className="alert alert-warning py-2 mb-0">
              🧮 Attendance: <strong>{summary.percentage}%</strong>
            </div>
          </div>
        </div>
      )}

      {/* Weeks Collapsible Table */}
      {weeks.length === 0 ? (
        <div className="text-muted small">
          Select session & term to load attendance weeks.
        </div>
      ) : (
        weeks.map((week, wi) => {
          if (!Array.isArray(week) || week.length === 0) return null;
          const weekStart = format(week[0], "MMM d");
          const weekEnd = format(week[week.length - 1], "MMM d");
          return (
            <div key={wi} className="mb-3 border rounded">
              <div
                className="bg-dark text-white px-3 py-2 d-flex justify-content-between align-items-center"
                role="button"
                onClick={() => toggleWeekCollapse(wi)}
              >
                <span>
                  🗓️ Week {wi + 1} — {weekStart} - {weekEnd}
                </span>
                <span>{collapsedWeeks[wi] ? "▶️ Expand" : "🔽 Collapse"}</span>
              </div>

              {!collapsedWeeks[wi] && message && (
                <div className="alert alert-success text-center py-1 small m-0">
                  {message}
                </div>
              )}

              {!collapsedWeeks[wi] && (
                <div className="table-responsive">
                  <table className="table table-sm table-bordered text-center mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="text-start">Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {week.map((d, idx) => {
                        const key = d.toDateString();
                        return (
                          <tr key={idx}>
                            <td className="text-start">
                              {format(d, "EEE, MMM d yyyy")}
                            </td>
                            <td>
                              <input
                                type="checkbox"
                                className="form-check-input shadow-none"
                                checked={!!attendance[key]}
                                onChange={() => toggleAttendance(d)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

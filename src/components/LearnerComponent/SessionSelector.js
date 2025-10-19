"use client";
import { useEffect, useState } from "react";

export default function SessionSelector({
  selectedSession,
  setSelectedSession,
}) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch("/api/adminapi/sessions");
        const data = await res.json();
        if (data.success) setSessions(data.sessions);
        else setSessions([{ sessionName: "2024/2025" }]); // fallback as object
      } catch (err) {
        setSessions([{ sessionName: "2024/2025" }]);
      }
    };
    fetchSessions();
  }, []);

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">Select Session</label>
      <select
        className="form-select login-input"
        value={selectedSession}
        onChange={(e) => setSelectedSession(e.target.value)}
      >
        {sessions.map((s, i) => (
          <option key={s._id || i} value={s.sessionName}>
            {s.sessionName}
          </option>
        ))}
      </select>
    </div>
  );
}

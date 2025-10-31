"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AddScores from "@/components/TeacherComponent/AddScores";
import TeacherAttendance from "@/components/TeacherComponent/TeacherAttendance";
import TeacherRemarkForm from "@/components/TeacherComponent/TeacherRemarkForm";

export default function TeachersDashboard() {
  const [activeTab, setActiveTab] = useState("records");
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [learners, setLearners] = useState([]);
  const [selectedLearner, setSelectedLearner] = useState("");
  const [assignedClass, setAssignedClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Route protection
  useEffect(() => {
    const role = localStorage.getItem("role");
    const storedUsername = localStorage.getItem("username");

    if (role === "teacher") {
      setLoggedIn(true);
      if (storedUsername) setUsername(storedUsername);
    } else {
      router.push("/teacher/teacherlogin");
    }
  }, [router]);

  const fetchLearners = async () => {
    const email = localStorage.getItem("username");
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/learners/teacher?email=${email}`);
      const data = await res.json();
      console.log("📦 [Client] Learners API Response:", data);

      if (data.success) {
        setLearners(data.learners || []);
        setAssignedClass(data.classLevel || "Not Assigned");
      } else {
        console.warn("⚠️ [Client] No learners found for this teacher");
      }
    } catch (err) {
      console.error("❌ [Client] Error fetching learners:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLearners();
  }, []);

  if (!loggedIn) return null;

  return (
    <div className="enrolment-dashboard">
      {/* Navbar */}
      <nav className="navbar sticky-top d-flex justify-content-between align-items-center px-2 bg-dark">
        <div className="d-flex align-items-center">
          <img
            src="/imgs/school logo.png"
            alt="BKBS Logo"
            width={40}
            height={40}
            className="mx-1 d-none d-md-inline"
          />
          <button
            className="btn btn-lg text-light d-lg-none"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#sidebarOffcanvas"
            aria-controls="sidebarOffcanvas"
          >
            <i className="bi bi-list"></i>
          </button>
          <p className="mb-0 fw-bold text-light ms-2">
            Teacher Page{" "}
            {assignedClass && (
              <span className="badge bg-warning text-dark ms-2">
                {assignedClass}
              </span>
            )}
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="fw-semibold text-light d-none d-md-block">
            {username}
          </span>
          <button
            className="btn-get logout-btn"
            onClick={() => {
              localStorage.clear();
              router.push("/teacher/teacherlogin");
            }}
          >
            <span className="d-none d-md-inline">Logout</span>
            <i className="bi bi-box-arrow-left d-inline d-md-none"></i>
          </button>
        </div>
      </nav>

      {loading ? (
        // Spinner while loading
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column flex-lg-row">
          {/* Sidebar */}
          <aside className="sidebar d-none d-lg-flex flex-column p-3">
            {["records", "learners", "attendance", 'remark', "skills"].map((tab) => (
              <button
                key={tab}
                className={`sidebar-btn mb-2 ${
                  activeTab === tab ? "active" : ""
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "records"
                  ? "Records"
                  : tab === "learners"
                  ? "Learners"
                  : tab === "attendance"
                  ? "Attendance"
                  : tab === "remark"
                  ? "Remark & Conduct"
                  : "Skills & Traits"}
              </button>
            ))}
          </aside>
          {/* Sidebar Offcanvas for small screens */}
          <div
            className="offcanvas offcanvas-start"
            tabIndex="-1"
            id="sidebarOffcanvas"
            aria-labelledby="sidebarOffcanvasLabel"
          >
            <div className="offcanvas-header border-bottom">
              <h5 id="sidebarOffcanvasLabel" className="fw-bold mb-0">
                Menu
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>

            <div className="offcanvas-body d-flex flex-column">
              {["records", "learners", "attendance",'remark', "skills"].map((tab) => (
                <button
                  key={tab}
                  className={`sidebar-btn text-start mb-2 ${
                    activeTab === tab ? "active" : ""
                  }`}
                  data-bs-dismiss="offcanvas"
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "records"
                    ? "Records"
                    : tab === "learners"
                    ? "Learners"
                    : tab === "attendance"
                    ? "Attendance"
                    : tab === "remark"
                    ? "Remark & Conduct"
                    : "Skills & Traits"}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <main className="content p-3 flex-grow-1">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-semibold text-warning">Teacher Page</h5>
              <button
                className="btn btn-outline-warning btn-sm"
                onClick={() => {
                  setRefreshing(true);
                  fetchLearners();
                }}
                disabled={refreshing}
              >
                {refreshing ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                    ></span>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-clockwise"></i> Refresh
                  </>
                )}
              </button>
            </div>
            {activeTab === "records" && (
              <RecordsTab
                learners={learners}
                selectedLearner={selectedLearner}
                setSelectedLearner={setSelectedLearner}
              />
            )}
            /* inside your main render / tabs area */
            {activeTab === "attendance" && (
              // pass assignedClass which is present in your dashboard state (assignedClass)
              <TeacherAttendance
                assignedClass={assignedClass}
                teacherId={localStorage.getItem("teacherId")}
                learners={learners}        // <-- add this
              />
            )}
            {activeTab === "remark" && (
              // pass assignedClass which is present in your dashboard state (assignedClass)
              <TeacherRemarkForm
                assignedClass={assignedClass}
                teacherId={localStorage.getItem("teacherId")}
                learners={learners}        
              />
            )}
            {activeTab === "learners" && (
              <LearnersTab learners={learners} assignedClass={assignedClass} />
            )}
            {activeTab === "skills" && (
              <SkillsTab
                learners={learners}
                selectedLearner={selectedLearner}
                setSelectedLearner={setSelectedLearner}
              />
            )}
          </main>
        </div>
      )}
    </div>
  );
}

/* ============================ SUB COMPONENTS ============================ */

function RecordsTab({ learners, selectedLearner, setSelectedLearner }) {
  return (
    <AddScores
      learners={learners}
      selectedLearner={selectedLearner}
      setSelectedLearner={setSelectedLearner}
    />
  );
}

function LearnersTab({ learners, assignedClass }) {
  const classCount = learners?.length || 0;

  return (
    <div>
      <h5 className="fw-semibold mb-3 d-flex align-items-center justify-content-between">
        <div>
          Learners in{" "}
          <span className="text-warning">
            {assignedClass || "Unassigned Class"}
          </span>
        </div>

        {/* ✅ Class Count Badge */}
        <span className="badge bg-success fs-6 px-3 py-2">
          {String(classCount).padStart(3, "0")}
        </span>
      </h5>

      <ul className="list-group form-card">
        {classCount > 0 ? (
          learners.map((l) => (
            <li
              key={l._id}
              className="list-group-item form-card  d-flex justify-content-between align-items-center my-1"
            >
              <span>
                {l.fullName} – <small>{l.admissionNo}</small>
              </span>
            </li>
          ))
        ) : (
          <li className="list-group-item text-muted text-center">
            No learners assigned yet.
          </li>
        )}
      </ul>
    </div>
  );
}

function SkillsTab({ learners, selectedLearner, setSelectedLearner }) {
  const [psychomotor, setPsychomotor] = useState({
    Writing: "",
    Reading: "",
    Fluency: "",
    Sports: "",
    LanguageSkill: "",
    "": "",
  });
  const [affective, setAffective] = useState({
    Punctuality: "",
    Neatness: "",
    Politeness: "",
    Cooperation: "",
    SelfControl: "",
    Attentiveness: "",
  });

  const [term, setTerm] = useState("First Term");
  const [session, setSession] = useState(""); // 🆕 Add current session
  const [sessions, setSessions] = useState([]); // 🆕 Store all sessions

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loadingSkills, setLoadingSkills] = useState(false);

  // 🆕 Fetch sessions before anything else
  useEffect(() => {
    fetch("/api/adminapi/sessions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.sessions?.length) {
          setSessions(data.sessions);
          // Select latest or current session automatically

          const latest =
            data.sessions.find((s) => s.isActive) ||
            data.sessions[data.sessions.length - 1];
          setSession(latest?.sessionName || "");
        } else if (data.currentSession) {
          setSession(data.currentSession.name);
          setSessions([data.currentSession]);
        }
      })
      .catch((err) => console.error("❌ Error fetching sessions:", err));
  }, []);

  // Fetch learner’s saved skills when selected
  useEffect(() => {
    if (!selectedLearner) return;
    setLoadingSkills(true);
    fetch(`/api/teachers/skills/${selectedLearner}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.skill) {
          setPsychomotor(data.skill.psychomotor || {});
          setAffective(data.skill.affective || {});
          setTerm(data.skill.term || "First Term");
          setSession(data.skill.session || session); // 🆕 use stored session if available
        } else {
          setPsychomotor({
            Writing: "",
            Reading: "",
            Fluency: "",
            Sports: "",
            LanguageSkill: "",
          });
          setAffective({
            Punctuality: "",
            Neatness: "",
            Politeness: "",
            Cooperation: "",
            SelfControl: "",
            Attentiveness: "",
          });
        }
      })
      .catch((err) => console.error("❌ Error fetching skills:", err))
      .finally(() => setLoadingSkills(false));
  }, [selectedLearner]);

  // Update skill selection dynamically
  const handleSkillChange = (category, skillName, grade) => {
    if (category === "psychomotor") {
      setPsychomotor({ ...psychomotor, [skillName]: grade });
    } else {
      setAffective({ ...affective, [skillName]: grade });
    }
  };

  // Save Skills to Database (now includes session)
  const handleSave = async () => {
    if (!selectedLearner) {
      setMessage("⚠️ Please select a learner first!");
      return;
    }
    if (!session) {
      setMessage("⚠️ Please select a session!");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`/api/teachers/skills/${selectedLearner}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learnerId: selectedLearner,
          psychomotor,
          affective,
          term,
          session, // 🆕 include session in payload
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Skills saved successfully!");
      } else {
        setMessage("❌ Failed to save skills. Try again.");
      }
    } catch (err) {
      console.error("Error saving skills:", err);
      setMessage("❌ Server error while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h5 className="fw-semibold mb-3">Psychomotor & Affective Skills</h5>

      {/* Learner Selection */}
      <div className="mb-3">
        <label className="form-label fw-bold">Select Learner</label>
        <select
          className="login-input"
          value={selectedLearner}
          onChange={(e) => setSelectedLearner(e.target.value)}
        >
          <option value="">-- Choose Learner --</option>
          {learners.map((l) => (
            <option key={l._id} value={l._id}>
              {l.fullName}
            </option>
          ))}
        </select>
      </div>

      {/*🆕 Session Selection */}
      <div className="mb-3">
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

      {/* Term Selection */}
      <div className="mb-3">
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
      {loadingSkills ? (
        <div className="text-center my-4">
          <div className="spinner-border text-warning" role="status"></div>
          <p className="text-muted small mt-2">Loading skills data...</p>
        </div>
      ) : (
        <>
          <div className="row small mb-3">
            <SkillTable
              title="Psychomotor Skills"
              items={Object.keys(psychomotor)}
              category="psychomotor"
              values={psychomotor}
              onChange={handleSkillChange}
            />
            <SkillTable
              title="Affective Ability"
              items={Object.keys(affective)}
              category="affective"
              values={affective}
              onChange={handleSkillChange}
            />
          </div>

          <button
            className="btn-get mt-3 w-100 w-md-auto"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Saving...
              </>
            ) : (
              "Save Skills & Traits"
            )}
          </button>
        </>
      )}
    </div>
  );
}

function SkillTable({ title, items, category, values, onChange }) {
  return (
    <div className="col-md-6 mb-3">
      <table className="table table-bordered text-center">
        <thead className="table-warning">
          <tr>
            <th>{title}</th>
            {["A", "B", "C", "D", "E"].map((g) => (
              <th key={g}>{g}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((skill) => (
            <tr key={skill}>
              <td>{skill}</td>
              {["A", "B", "C", "D", "E"].map((grade) => (
                <td key={grade}>
                  <input
                    type="radio"
                    name={`${category}-${skill}`}
                    value={grade}
                    checked={values[skill] === grade}
                    onChange={() => onChange(category, skill, grade)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

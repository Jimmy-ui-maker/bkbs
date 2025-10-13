"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HeadteacherDashboard() {
  const [activeTab, setActiveTab] = useState("teachers");
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Protect route: only headteacher role
  useEffect(() => {
    const role = localStorage.getItem("role");
    const storedUsername = localStorage.getItem("username");

    if (role === "headteacher") {
      setLoggedIn(true);
      if (storedUsername) setUsername(storedUsername);
    } else {
      router.push("/");
    }
  }, [router]);

  // Fetch teachers
  useEffect(() => {
    if (activeTab === "teachers") {
      fetch("/api/headteacher/teachers")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setTeachers(data.teachers);
        })
        .catch((err) => console.error("Error fetching teachers:", err));
    }
  }, [activeTab]);

  // Fetch learners
  useEffect(() => {
    if (activeTab === "learners") {
      fetch("/api/headteacher/learners")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setLearners(data.learners);
        })
        .catch((err) => console.error("Error fetching learners:", err));
    }
  }, [activeTab]);

  // Promote learner
  const promoteLearner = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/headteacher/learners/${id}/promote`, {
        method: "PUT",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        alert(`Learner promoted to ${data.learner.classLevel}`);
        // refresh learners
        setLearners((prev) =>
          prev.map((l) => (l._id === id ? data.learner : l))
        );
      } else {
        alert(data.error || "Promotion failed");
      }
    } catch (error) {
      console.error("Promote error:", error);
    }
    setLoading(false);
  };

  if (!loggedIn) return null;

  return (
    <div className="headteacher-dashboard">
      {/* Navbar */}
      <nav className="navbar sticky-top d-flex justify-content-between align-items-center px-1 bg-dark">
        <div className="d-flex align-items-center">
          <img
            src="/imgs/school logo.png"
            alt="BKBS Logo"
            width={40}
            height={40}
            className="mx-1"
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
          <p className="mb-0 fw-bold text-light ms-1">Headteacher Dashboard</p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="fw-semibold text-light d-none d-md-block">
            {username || "Guest"}
          </span>
          <button
            className="btn-get logout-btn"
            onClick={() => {
              localStorage.removeItem("role");
              localStorage.removeItem("username");
              router.push("/");
            }}
          >
            <span className="d-none d-md-inline">Logout</span>
            <i className="bi bi-box-arrow-right d-inline d-md-none"></i>
          </button>
        </div>
      </nav>

      <div className="d-flex flex-column flex-lg-row">
        {/* Sidebar */}
        <aside className="sidebar d-none d-lg-flex flex-column p-3">
          <button
            className={`sidebar-btn mb-2 ${
              activeTab === "teachers" ? "active" : ""
            }`}
            onClick={() => setActiveTab("teachers")}
          >
            Teachers
          </button>
          <button
            className={`sidebar-btn mb-2 ${
              activeTab === "learners" ? "active" : ""
            }`}
            onClick={() => setActiveTab("learners")}
          >
            Learners
          </button>
          <button
            className={`sidebar-btn mb-2 ${
              activeTab === "reports" ? "active" : ""
            }`}
            onClick={() => setActiveTab("reports")}
          >
            Reports
          </button>
        </aside>

        {/* Content */}
        <main className="content p-3 flex-grow-1">
          {activeTab === "teachers" && (
            <div>
              <h5 className="fw-semibold mb-3">All Teachers</h5>
              <div className="table-responsive">
                <table className="table table-bordered text-center">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Subject</th>
                      <th>Class</th>
                      <th>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((t, i) => (
                      <tr key={t._id}>
                        <td>{i + 1}</td>
                        <td>{t.fullName}</td>
                        <td>{t.email}</td>
                        <td>{t.subject}</td>
                        <td>{t.classLevel}</td>
                        <td>{t.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "learners" && (
            <div>
              <h5 className="fw-semibold mb-3">All Learners</h5>
              <div className="table-responsive">
                <table className="table table-bordered text-center">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Admission No</th>
                      <th>Class</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {learners.map((l, i) => (
                      <tr key={l._id}>
                        <td>{i + 1}</td>
                        <td>{l.fullName}</td>
                        <td>{l.admissionNo}</td>
                        <td>{l.classLevel}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            disabled={loading}
                            onClick={() => promoteLearner(l._id)}
                          >
                            Promote
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div>
              <h5 className="fw-semibold mb-3">Reports</h5>
              <p>
                Headteacher can view and generate teachers’ performance reports
                here.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

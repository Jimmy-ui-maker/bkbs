"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EnrolmentDashboard() {
  const [activeTab, setActiveTab] = useState("students");
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState(""); // 👈 store username
  const router = useRouter();

  // Protect route: only "enrolment" role allowed
  useEffect(() => {
    const role = localStorage.getItem("role");
    const storedUsername = localStorage.getItem("username"); // 👈 fetch saved username

    if (role === "enrolment") {
      setLoggedIn(true);
      if (storedUsername) {
        setUsername(storedUsername); // 👈 set username for navbar
      }
    } else {
      router.push("/"); // redirect to login
    }
  }, [router]);

  if (!loggedIn) {
    return null; // prevent flicker before redirect
  }

  return (
    <div className="enrolment-dashboard">
      {/* Navbar */}
      <nav className="navbar d-flex justify-content-between align-items-center px-3">
        <div className="d-flex align-items-center gap-3">
          {/* Sidebar toggler (for small screens) */}
          <button
            className="btn btn-sm btn-light d-lg-none"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#sidebarOffcanvas"
            aria-controls="sidebarOffcanvas"
          >
            <i className="bi bi-list fs-4"></i>
          </button>
          <h4 className="fw-bold m-0">Enrolment Dashboard</h4>
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* Logged in Username */}
          <span className="fw-semibold text-light d-none d-md-block">
            {username ? username : "Guest"}
          </span>

          {/* Logout Button */}
          <button
            className="btn-get"
            onClick={() => {
              localStorage.removeItem("role");
              localStorage.removeItem("username"); // 👈 clear username too
              router.push("/");
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="d-flex">
        {/* Sidebar for lg+ screens */}
        <aside className="sidebar d-none d-lg-block">
          <button
            className={`sidebar-btn ${
              activeTab === "students" ? "active" : ""
            }`}
            onClick={() => setActiveTab("students")}
          >
            Enroll Students
          </button>
          <button
            className={`sidebar-btn ${
              activeTab === "teachers" ? "active" : ""
            }`}
            onClick={() => setActiveTab("teachers")}
          >
            Enroll Teachers
          </button>
        </aside>

        {/* Offcanvas sidebar for small screens */}
        <div
          className="offcanvas offcanvas-start"
          tabIndex="-1"
          id="sidebarOffcanvas"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title">Menu</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <button
              className={`sidebar-btn ${
                activeTab === "students" ? "active" : ""
              }`}
              data-bs-dismiss="offcanvas"
              onClick={() => setActiveTab("students")}
            >
              Enroll Students
            </button>
            <button
              className={`sidebar-btn ${
                activeTab === "teachers" ? "active" : ""
              }`}
              data-bs-dismiss="offcanvas"
              onClick={() => setActiveTab("teachers")}
            >
              Enroll Teachers
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <main className="content p-4 flex-grow-1">
          {activeTab === "students" && (
            <div>
              <h5 className="fw-semibold mb-3">Enroll New Student</h5>
              <form className="form-card">
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control login-input" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Age</label>
                  <input type="number" className="form-control login-input" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Class</label>
                  <input type="text" className="form-control login-input" />
                </div>
                <button type="submit" className="btn-get">
                  Save Student
                </button>
              </form>
            </div>
          )}

          {activeTab === "teachers" && (
            <div>
              <h5 className="fw-semibold mb-3">Enroll New Teacher</h5>
              <form className="form-card">
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control login-input" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Subject</label>
                  <input type="text" className="form-control login-input" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control login-input" />
                </div>
                <button type="submit" className="btn-get">
                  Save Teacher
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

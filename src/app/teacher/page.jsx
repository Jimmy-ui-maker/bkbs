"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TeachersDashboard() {
  const [activeTab, setActiveTab] = useState("records");
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();

  // Protect route: only teacher role
  useEffect(() => {
    const role = localStorage.getItem("role");
    const storedUsername = localStorage.getItem("username");

    if (role === "teacher") {
      setLoggedIn(true);
      if (storedUsername) setUsername(storedUsername);
    } else {
      router.push("/");
    }
  }, [router]);

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
            className="mx-1"
          />
          {/* Sidebar toggle (mobile only) */}
          <button
            className="btn btn-lg text-light d-lg-none"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#sidebarOffcanvas"
            aria-controls="sidebarOffcanvas"
          >
            <i className="bi bi-list"></i>
          </button>
          <p className="mb-0 fw-bold text-light ms-2">Teacher Dashboard</p>
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
        {/* Sidebar (desktop only) */}
        <aside className="sidebar d-none d-lg-flex flex-column p-3 ">
          <button
            className={`sidebar-btn mb-2 ${
              activeTab === "records" ? "active" : ""
            }`}
            onClick={() => setActiveTab("records")}
          >
            Records
          </button>
          <button
            className={`sidebar-btn mb-2 ${
              activeTab === "learners" ? "active" : ""
            }`}
            onClick={() => setActiveTab("learners")}
          >
            Learners
          </button>
        </aside>

        {/* Mobile Sidebar */}
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
              className={`sidebar-btn w-100 mb-2 ${
                activeTab === "records" ? "active" : ""
              }`}
              data-bs-dismiss="offcanvas"
              onClick={() => setActiveTab("records")}
            >
              Records
            </button>
            <button
              className={`sidebar-btn w-100 mb-2 ${
                activeTab === "learners" ? "active" : ""
              }`}
              data-bs-dismiss="offcanvas"
              onClick={() => setActiveTab("learners")}
            >
              Learners
            </button>
          </div>
        </div>

        {/* Content */}
        <main className="content p-3 flex-grow-1">
          {activeTab === "records" && (
            <div>
              <h5 className="fw-semibold mb-3">Add Learner Records</h5>

              {/* Learner Dropdown */}
              <div className="mb-3">
                <label className="form-label fw-bold">Select Learner</label>
                <select className="login-input">
                  <option value="">-- Choose Learner --</option>
                  <option value="john">John Doe</option>
                  <option value="jane">Jane Smith</option>
                </select>
              </div>

              {/* Record Form */}
              <form className="card p-3 shadow-sm">
                <div className="row g-3">
                  <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">CA1 (30)</label>
                    <input type="number" className="login-input" />
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">CA2 (30)</label>
                    <input type="number" className="login-input" />
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Project (10)</label>
                    <input type="number" className="login-input" />
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Exam (60)</label>
                    <input type="number" className="login-input" />
                  </div>
                </div>
                <button type="button" className="btn-get mt-3 w-100 w-md-auto">
                  Save Record
                </button>
              </form>

              {/* Record Table */}
              <div className="mt-4 table-responsive">
                <h6 className="fw-bold">Sample Records</h6>
                <table className="table table-bordered text-center">
                  <thead className="table-light">
                    <tr>
                      <th>Learner</th>
                      <th>CA1</th>
                      <th>CA2</th>
                      <th>Project</th>
                      <th>Exam</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>John Doe</td>
                      <td>25</td>
                      <td>28</td>
                      <td>9</td>
                      <td>52</td>
                      <td>114</td>
                    </tr>
                    <tr>
                      <td>Jane Smith</td>
                      <td>20</td>
                      <td>27</td>
                      <td>10</td>
                      <td>55</td>
                      <td>112</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === "learners" && (
            <div>
              <h5 className="fw-semibold mb-3">Learners in Class</h5>
              <ul className="list-group">
                <li className="list-group-item">John Doe – BKBS001</li>
                <li className="list-group-item">Jane Smith – BKBS002</li>
              </ul>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

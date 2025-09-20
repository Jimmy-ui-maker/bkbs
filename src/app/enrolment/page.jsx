"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EnrolLearners from "@/components/EnrollmentComponent/EnrolmentTabs";
import ViewTable from "@/components/EnrollmentComponent/ViewTable";

export default function EnrolmentDashboard() {
  const [activeTab, setActiveTab] = useState("forms");
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
      <nav className="navbar sticky-top d-flex justify-content-between align-items-center px-3">
        <div className="d-flex align-items-center">
          <img
            src="/imgs/school logo.png"
            alt="BKBS Logo"
            width={40}
            height={40}
            className=" mx-1"
          />
          {/* Sidebar toggler (for small screens) */}
          <button
            className="btn btn-sm text-light d-lg-none me-2"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#sidebarOffcanvas"
            aria-controls="sidebarOffcanvas"
          >
            <i className="bi bi-list"></i>
          </button>
          <p className="mb-0 fw-bold text-light">Enrolment Dashboard</p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Logged in Username (hidden on xs, visible on md+) */}
          <span className="fw-semibold text-light d-none d-md-block">
            {username ? username : "Guest"}
          </span>

          {/* Logout Button with icon on mobile */}
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

      <div className="d-flex">
        {/* Sidebar for lg+ screens */}
        <aside className="sidebar d-none d-lg-block">
          <button
            className={`sidebar-btn ${activeTab === "forms" ? "active" : ""}`}
            onClick={() => setActiveTab("forms")}
          >
            Enrollment
          </button>
          <button
            className={`sidebar-btn ${activeTab === "veiws" ? "active" : ""}`}
            onClick={() => setActiveTab("veiws")}
          >
            Management
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
              className={`sidebar-btn ${activeTab === "forms" ? "active" : ""}`}
              data-bs-dismiss="offcanvas"
              onClick={() => setActiveTab("forms")}
            >
              Enroll forms
            </button>
            <button
              className={`sidebar-btn ${activeTab === "veiws" ? "active" : ""}`}
              data-bs-dismiss="offcanvas"
              onClick={() => setActiveTab("veiws")}
            >
              Management
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <main className="content p-4 flex-grow-1">
          {activeTab === "forms" && (
            <div>
              <h5 className="fw-semibold mb-3">Enrollment Form</h5>
              <EnrolLearners />
            </div>
          )}
          {activeTab === "veiws" && (
            <div>
              <h5 className="fw-semibold mb-3">Table View </h5>
              <ViewTable />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

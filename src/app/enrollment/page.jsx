"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EnrolLearners from "@/components/EnrollmentComponent/EnrolmentTabs";
import ViewTable from "@/components/EnrollmentComponent/ViewTable";

export default function EnrolmentDashboard() {
  const [activeTab, setActiveTab] = useState("forms");
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ Protect route using officer login data
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (user.role === "Enrollment Officer") {
      setLoggedIn(true);
      setUsername(user.name);
    } else {
      router.push("/");
    }

    setTimeout(() => setLoading(false), 500); // small delay for smooth spinner
  }, [router]);

  // ✅ Show spinner while verifying login
  if (loading) {
    return (
      <div className="d-flex vh-100 justify-content-center align-items-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!loggedIn) return null;

  return (
    <div className="enrolment-dashboard">
      {/* Navbar */}
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
          {/* Sidebar toggler (for small screens) */}
          <button
            className="btn btn-lg text-light d-lg-none"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#sidebarOffcanvas"
            aria-controls="sidebarOffcanvas"
          >
            <i className="bi bi-list"></i>
          </button>
          <p className="mb-0 fw-bold text-light ms-1">Enrollment Dashboard</p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Username */}
          <span className="fw-semibold text-light d-none d-md-block">
            {username || "Guest"}
          </span>

          {/* Logout Button */}
          <button
            className="btn-get logout-btn"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              router.push("/officerslogin");
            }}
          >
            <span className="d-none d-md-inline">Logout</span>
            <i className="bi bi-box-arrow-right d-inline d-md-none"></i>
          </button>
        </div>
      </nav>

      <div className="d-flex flex-column flex-lg-row">
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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminForm from "@/components/AdminComponent/AdminForm";
import ViewTable from "@/components/EnrollmentComponent/ViewTable";
import AdminSessions from "@/components/AdminComponent/SessionForm";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("officers");
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role");
    const storedUsername = localStorage.getItem("username");

    if (role === "admin") {
      setLoggedIn(true);
      if (storedUsername) setUsername(storedUsername);
    } else {
      router.push("/"); // redirect to login if not admin
    }
  }, [router]);

  if (!loggedIn) return null;

  return (
    <div className="admin-dashboard">
      {/* Navbar */}
      <nav className="navbar sticky-top d-flex justify-content-between align-items-center px-2">
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
          <p className="mb-0 fw-bold text-light">Admin Dashboard</p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="fw-semibold text-light d-none d-md-block">
            {username ? username : "Guest"}
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
        {/* Sidebar for lg+ screens */}
        <aside className="sidebar d-none d-lg-block">
          {/* Officers Dropdown */}
          <div className="dropdown w-100">
            <button
              className="sidebar-btn w-100 d-flex justify-content-between align-items-center"
              data-bs-toggle="collapse"
              data-bs-target="#officersMenu"
              aria-expanded="false"
              aria-controls="officersMenu"
            >
              Officers
              <i className="bi bi-chevron-down"></i>
            </button>
            <div className="collapse" id="officersMenu">
              <button
                className={`sidebar-btn ${
                  activeTab === "add-officer" ? "active" : ""
                }`}
                onClick={() => setActiveTab("add-officer")}
              >
                Add Officer
              </button>
              <button
                className={`sidebar-btn ${
                  activeTab === "add-session" ? "active" : ""
                }`}
                onClick={() => setActiveTab("add-session")}
              >
                Add Session
              </button>
              <button
                className={`sidebar-btn ${
                  activeTab === "manage-officer" ? "active" : ""
                }`}
                onClick={() => setActiveTab("manage-officer")}
              >
                Manage Officers
              </button>
            </div>
          </div>

          {/* Enrollment Tables */}
          <button
            className={`sidebar-btn ${
              activeTab === "enrollment-tables" ? "active" : ""
            }`}
            onClick={() => setActiveTab("enrollment-tables")}
          >
            Enrollment Tables
          </button>

          {/* Reports (example of non-dropdown) */}
          <button
            className={`sidebar-btn ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            Reports
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
            {/* Duplicate Sidebar Items for Mobile */}
            <div className="dropdown w-100">
              <button
                className="sidebar-btn w-100 d-flex justify-content-between align-items-center"
                data-bs-toggle="collapse"
                data-bs-target="#officersMenuSm"
                aria-expanded="false"
                aria-controls="officersMenuSm"
              >
                Officers
                <i className="bi bi-chevron-down"></i>
              </button>
              <div className="collapse" id="officersMenuSm">
                <button
                  className={`sidebar-btn ${
                    activeTab === "add-officer" ? "active" : ""
                  }`}
                  data-bs-dismiss="offcanvas"
                  onClick={() => setActiveTab("add-officer")}
                >
                  Add Officer
                </button>
                <button
                  className={`sidebar-btn ${
                    activeTab === "manage-officer" ? "active" : ""
                  }`}
                  data-bs-dismiss="offcanvas"
                  onClick={() => setActiveTab("manage-officer")}
                >
                  Manage Officers
                </button>
              </div>
            </div>

            <button
              className={`sidebar-btn ${
                activeTab === "enrollment-tables" ? "active" : ""
              }`}
              data-bs-dismiss="offcanvas"
              onClick={() => setActiveTab("enrollment-tables")}
            >
              Enrollment Tables
            </button>

            <button
              className={`sidebar-btn ${
                activeTab === "reports" ? "active" : ""
              }`}
              data-bs-dismiss="offcanvas"
              onClick={() => setActiveTab("reports")}
            >
              Reports
            </button>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <main className="content p-3 flex-grow-1 ">
          {activeTab === "add-officer" && <AdminForm />}
          {activeTab === "add-session" && <AdminSessions />}
          {activeTab === "manage-officer" && (
            <p>Officer Table Component goes here</p>
          )}
          {activeTab === "enrollment-tables" && <ViewTable />}
          {activeTab === "reports" && <p>Reports Page</p>}
        </main>
      </div>
    </div>
  );
}

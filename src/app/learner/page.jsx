"use client";
import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function LearnerDashboard() {
  const [activeTab, setActiveTab] = useState("profile");
  const [activeTerm, setActiveTerm] = useState("1st Term"); // ✅ default

  const learner = {
    name: "Sir Jimmy",
    admissionNo: "BKBS/25/ABJ/001",
    class: "Basic 2",
    email: "sirjimmy.doe@example.com",
    phone: "+234 812 345 6789",
    feesBalance: "₦25,000",
    feesPaid: "₦75,000",
    position: "3rd out of 30",
    results: [
      { term: "1st Term", math: 85, english: 78, science: 90, avg: 84 },
      { term: "2nd Term", math: 80, english: 82, science: 88, avg: 83 },
      { term: "3rd Term", math: 88, english: 79, science: 92, avg: 86 },
    ],
    paymentHistory: [
      { date: "Jan 15, 2025", amount: "₦25,000", status: "Paid" },
      { date: "Apr 10, 2025", amount: "₦30,000", status: "Paid" },
      { date: "Jun 22, 2025", amount: "₦20,000", status: "Pending" },
    ],
  };

  const sidebarButtons = [
    { key: "profile", label: "Profile", icon: "person" },
    { key: "results", label: "Results", icon: "bar-chart" },
    { key: "fees", label: "Fees", icon: "wallet2" },
    { key: "messages", label: "Messages", icon: "envelope" },
    { key: "settings", label: "Settings", icon: "gear" },
  ];

  // Chart Data
  const terms = learner.results.map((r) => r.term);
  const barData = {
    labels: terms,
    datasets: [
      {
        label: "Math",
        data: learner.results.map((r) => r.math),
        backgroundColor: "#007bff",
      },
      {
        label: "English",
        data: learner.results.map((r) => r.english),
        backgroundColor: "#28a745",
      },
      {
        label: "Science",
        data: learner.results.map((r) => r.science),
        backgroundColor: "#ffc107",
      },
    ],
  };

  const lineData = {
    labels: terms,
    datasets: [
      {
        label: "Average",
        data: learner.results.map((r) => r.avg),
        borderColor: "#dc3545",
        backgroundColor: "rgba(220,53,69,0.2)",
        tension: 0.3,
      },
    ],
  };

  const handlePrint = () => {
    window.print();
  };

  // ✅ Find the selected term object
  const selectedResult = learner.results.find((r) => r.term === activeTerm);

  return (
    <div className="d-flex flex-column min-vh-100">
     {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top">
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <a href="/">
              <img
                src="/imgs/school logo.png"
                alt="BKBS Logo"
                width={40}
                height={40}
                className="mx-2"
              />
            </a>
            <span className="navbar-brand fw-bold">
              BKBS Dashboard
            </span>
          </div>

          <div className="d-flex align-items-center">
            <span className="text-light me-3 fw-semibold d-none d-md-block">
              {learner.name}
            </span>
            <button className="btn btn-outline-light btn-sm me-2">
              <i className="bi bi-box-arrow-right"></i>{" "}
              <span className="d-none d-md-inline">Logout</span>
            </button>
            {/* Navbar toggler */}
            <button
              className="btn btn-outline-light btn-sm d-lg-none"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#mobileSidebar"
            >
              <i className="bi bi-list"></i>
            </button>
          </div>
        </div>
      </nav>

      <div className="d-flex flex-grow-1">
        {/* Sidebar (Desktop) */}
        <div className="sidebar d-none d-lg-block">
          <div className="text-center p-3">
            <img
              src="/imgs/holder.svg"
              alt="BKBS Logo"
              width={40}
              height={40}
              className="mx-2 rounded-3"
            />
            <h6 className="fw-bold text-dark">{learner.name}</h6>
            <p className="small">{learner.admissionNo}</p>
          </div>
          {sidebarButtons.map((item) => (
            <button
              key={item.key}
              className={`sidebar-btn ${
                activeTab === item.key ? "active" : ""
              }`}
              onClick={() => setActiveTab(item.key)}
            >
              <i className={`bi bi-${item.icon} me-2`}></i>
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}

        <div className="content flex-grow-1 p-3">
          {/* Offcanvas Sidebar (Mobile) */}
          <div
            className="offcanvas offcanvas-start"
            tabIndex="-1"
            id="mobileSidebar"
          >
            <div className="offcanvas-header bg-warning">
              <h5 className="offcanvas-title fw-bold">Menu</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="offcanvas"
              ></button>
            </div>
            <div className="offcanvas-body">
              <div className="text-center p-3">
                <img
                  src="/imgs/holder.svg"
                  alt="Profile"
                  className="rounded-circle mb-2 border border-2 border-dark"
                  width="70"
                />
                <h6 className="fw-bold">{learner.name}</h6>
                <p className="small">{learner.admissionNo}</p>
              </div>
              {sidebarButtons.map((item) => (
                <button
                  key={item.key}
                  className={`sidebar-btn w-100 mb-2 ${
                    activeTab === item.key ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab(item.key);
                    document
                      .getElementById("mobileSidebar")
                      .classList.remove("show");
                  }}
                  data-bs-dismiss="offcanvas"
                >
                  <i className={`bi bi-${item.icon} me-2`}></i>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Profile */}
          {activeTab === "profile" && (
            <div className="card shadow-sm p-3">
              <h5 className="fw-bold mb-3">👤 Profile</h5>
              <div className="row">
                <div className="col-md-8">
                  <p>
                    <strong>Name:</strong> {learner.name}
                  </p>
                  <p>
                    <strong>Admission No:</strong> {learner.admissionNo}
                  </p>
                  <p>
                    <strong>Class:</strong> {learner.class}
                  </p>
                  <p>
                    <strong>Email:</strong> {learner.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {learner.phone}
                  </p>
                  <button className="btn btn-primary btn-sm no-print">
                    <i className="bi bi-pencil"></i> Edit Profile
                  </button>
                </div>
                <div className="col-md-4 mt-4 text-center">
                  <div className="border position rounded-3 p-3">
                    <h6 className="fw-bold text-success">📌 Position</h6>
                    <p className="fs-5">{learner.position}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {activeTab === "results" && (
            <div className="card shadow-sm p-3">
              {/* Header with selector */}
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap no-print">
                <h5 className="fw-bold">📊 Results</h5>
                <div className="d-flex gap-2">
                  <select
                    className="form-select shadow-none form-select-sm"
                    value={activeTerm}
                    onChange={(e) => setActiveTerm(e.target.value)}
                  >
                    {terms.map((t, i) => (
                      <option key={i} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={handlePrint}
                  >
                    <i className="bi bi-printer"></i> Print Report
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="table-responsive mb-4 no-print">
                <table className="table table-bordered align-middle text-center">
                  <thead>
                    <tr>
                      <th>Term</th>
                      <th>Math</th>
                      <th>English</th>
                      <th>Science</th>
                      <th>Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {learner.results.map((res, i) => (
                      <tr key={i}>
                        <td>{res.term}</td>
                        <td>{res.math}</td>
                        <td>{res.english}</td>
                        <td>{res.science}</td>
                        <td>{res.avg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Charts */}
              <div className="card p-3 shadow-sm no-print">
                <h6 className="fw-bold mb-3">📘 Performance Overview</h6>
                <div className="row">
                  <div className="col-lg-6 mb-3">
                    <Bar data={barData} />
                  </div>
                  <div className="col-lg-6 mb-3">
                    <Line data={lineData} />
                  </div>
                </div>
              </div>

              {/* Print-only report */}
              <div className="print-area d-none d-print-block p-4">
                <div className="text-center mb-4">
                  <img src="/imgs/school logo.png" alt="Logo" width={70} />
                  <h4 className="fw-bold">Bright Kingdom British School</h4>
                  <p className="small text-muted">
                    No. 12 School Road, Abuja, Nigeria
                  </p>
                  <h5 className="text-decoration-underline">Report Card</h5>
                </div>

                <p>
                  <strong>Name:</strong> {learner.name}
                </p>
                <p>
                  <strong>Admission No:</strong> {learner.admissionNo}
                </p>
                <p>
                  <strong>Class:</strong> {learner.class}
                </p>
                <p>
                  <strong>Position:</strong> {learner.position}
                </p>

                <div className="border rounded p-3 mb-4 bg-warning-subtle">
                  <h6 className="fw-bold mb-3">{activeTerm}</h6>
                  <table className="table table-bordered text-center">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Math</td>
                        <td>{selectedResult.math}</td>
                      </tr>
                      <tr>
                        <td>English</td>
                        <td>{selectedResult.english}</td>
                      </tr>
                      <tr>
                        <td>Science</td>
                        <td>{selectedResult.science}</td>
                      </tr>
                      <tr className="table-success fw-bold">
                        <td>Average</td>
                        <td>{selectedResult.avg}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-between mt-5">
                  <p>
                    <strong>Director:</strong> Dr Nathaniel Adeojo
                  </p>
                  <p className="fw-bold">Signature: ____________________</p>
                </div>
              </div>
            </div>
          )}

          {/* Fees */}
          {activeTab === "fees" && (
            <div className="card shadow-sm p-3">
              <h5 className="fw-bold">💰 Fees Payment</h5>
              <p>
                <strong>Total Paid:</strong> {learner.feesPaid}
              </p>
              <p>
                <strong>Outstanding Balance:</strong> {learner.feesBalance}
              </p>
              <button className="btn btn-success btn-sm no-print mb-3">
                <i className="bi bi-credit-card"></i> Pay Now
              </button>

              {/* Payment History */}
              <h6 className="fw-bold">📜 Payment History</h6>
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {learner.paymentHistory.map((p, i) => (
                      <tr key={i}>
                        <td>{p.date}</td>
                        <td>{p.amount}</td>
                        <td>
                          <span
                            className={`badge ${
                              p.status === "Paid" ? "bg-success" : "bg-warning"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Messages */}
          {activeTab === "messages" && (
            <div className="card shadow-sm p-3">
              <h5 className="fw-bold">📩 Messages</h5>
              <p>No new messages.</p>
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div className="card shadow-sm p-3">
              <h5 className="fw-bold">⚙️ Settings</h5>
              <p>Update password, notifications, etc.</p>
            </div>
          )}
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-area {
            background: #fff9c4; /* yellow */
            position: relative;
          }
          .print-area::before {
            content: "Bright Kingdom British School";
            position: absolute;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 3rem;
            color: rgba(0, 0, 0, 0.08);
            font-weight: bold;
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
}

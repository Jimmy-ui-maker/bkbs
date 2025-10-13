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
import ResultCard from "@/components/ResultCard";
import Comments from "@/components/LearnerComponent/Comments";

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
  const [activeTab, setActiveTab] = useState("results");
  const [activeTerm, setActiveTerm] = useState("1st Term");

  // ✅ Unified learner data (3 terms, all with CA1, CA2, Project, Exam)
  const learner = {
    name: "John Doe",
    admissionNo: "BKBS/A25/001",
    class: "JSS 2",
    email: "john.doe@example.com",
    phone: "+234 812 345 6789",
    feesBalance: "₦25,000",
    feesPaid: "₦75,000",
    position: "3rd out of 30",
    results: [
      {
        term: "1st Term",
        scores: {
          Mathematics: { CA1: 25, CA2: 27, Project: 8, Exam: 55 },
          "English Studies": { CA1: 22, CA2: 25, Project: 9, Exam: 52 },
          "Basic Science and Technology": { CA1: 28, CA2: 26, Project: 10, Exam: 60 },
          "National Value": { CA1: 21, CA2: 25, Project: 7, Exam: 50 },
          CRS: { CA1: 26, CA2: 27, Project: 9, Exam: 58 },
          "Computer Science": { CA1: 30, CA2: 28, Project: 10, Exam: 59 },
          "Verbal Reasoning": { CA1: 23, CA2: 25, Project: 8, Exam: 52 },
          "Quantitative Reasoning": { CA1: 22, CA2: 26, Project: 9, Exam: 54 },
          "Agricultural Science": { CA1: 25, CA2: 24, Project: 8, Exam: 55 },
          "Home Economics": { CA1: 20, CA2: 22, Project: 7, Exam: 49 },
          "History and Current Affair": { CA1: 24, CA2: 25, Project: 9, Exam: 50 },
          "Physical and Health Education": { CA1: 27, CA2: 28, Project: 10, Exam: 57 },
          "Cultural and Creative Art": { CA1: 21, CA2: 22, Project: 8, Exam: 50 },
        },
      },
      {
        term: "2nd Term",
        scores: {
          Mathematics: { CA1: 26, CA2: 28, Project: 9, Exam: 56 },
          "English Studies": { CA1: 23, CA2: 25, Project: 8, Exam: 54 },
          "Basic Science and Technology": { CA1: 29, CA2: 27, Project: 9, Exam: 58 },
          "National Value": { CA1: 22, CA2: 24, Project: 8, Exam: 52 },
          CRS: { CA1: 25, CA2: 26, Project: 9, Exam: 57 },
          "Computer Science": { CA1: 28, CA2: 27, Project: 10, Exam: 60 },
          "Verbal Reasoning": { CA1: 24, CA2: 26, Project: 9, Exam: 55 },
          "Quantitative Reasoning": { CA1: 23, CA2: 25, Project: 8, Exam: 56 },
          "Agricultural Science": { CA1: 26, CA2: 25, Project: 9, Exam: 57 },
          "Home Economics": { CA1: 22, CA2: 23, Project: 7, Exam: 51 },
          "History and Current Affair": { CA1: 23, CA2: 24, Project: 8, Exam: 52 },
          "Physical and Health Education": { CA1: 28, CA2: 27, Project: 9, Exam: 58 },
          "Cultural and Creative Art": { CA1: 22, CA2: 23, Project: 8, Exam: 51 },
        },
      },
      {
        term: "3rd Term",
        scores: {
          Mathematics: { CA1: 27, CA2: 29, Project: 9, Exam: 58 },
          "English Studies": { CA1: 24, CA2: 26, Project: 9, Exam: 55 },
          "Basic Science and Technology": { CA1: 28, CA2: 28, Project: 10, Exam: 59 },
          "National Value": { CA1: 23, CA2: 25, Project: 9, Exam: 53 },
          CRS: { CA1: 26, CA2: 28, Project: 9, Exam: 59 },
          "Computer Science": { CA1: 29, CA2: 28, Project: 9, Exam: 60 },
          "Verbal Reasoning": { CA1: 25, CA2: 27, Project: 8, Exam: 56 },
          "Quantitative Reasoning": { CA1: 24, CA2: 26, Project: 9, Exam: 57 },
          "Agricultural Science": { CA1: 27, CA2: 26, Project: 9, Exam: 58 },
          "Home Economics": { CA1: 23, CA2: 24, Project: 8, Exam: 52 },
          "History and Current Affair": { CA1: 24, CA2: 25, Project: 9, Exam: 53 },
          "Physical and Health Education": { CA1: 29, CA2: 28, Project: 10, Exam: 59 },
          "Cultural and Creative Art": { CA1: 23, CA2: 24, Project: 8, Exam: 52 },
        },
      },
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
    { key: "comments", label: "Comments", icon: "envelope" },
    { key: "settings", label: "Settings", icon: "gear" },
  ];

  const terms = learner.results.map((r) => r.term);

  const handlePrint = () => {
    window.print();
  };

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
            <span className="navbar-brand fw-bold">BKBS Dashboard</span>
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
              className={`sidebar-btn ${activeTab === item.key ? "active" : ""}`}
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
              {/* Header */}
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

              {/* Printable Report */}
              <div className="d-none d-print-block print-area">
                <ResultCard learner={learner} activeTerm={activeTerm} />
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

          {/* comments */}
          {activeTab === "comments" && (
            <div className="card shadow-sm p-3">
              <h5 className="fw-bold">📩 Comments</h5>
              <p>No new comments.</p>
              <Comments/>
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
            position: relative;
          }
          .print-area::before {
            content: "";
            background: url("/imgs/school logo.png") no-repeat center;
            background-size: 300px;
            opacity: 0.05;
            position: absolute;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            width: 100%;
            height: 100%;
          }
        }
      `}</style>
    </div>
  );
}

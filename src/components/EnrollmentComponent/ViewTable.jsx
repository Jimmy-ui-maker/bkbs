"use client";

import { useState, useEffect } from "react";

export default function ViewTable() {
  const [activeTab, setActiveTab] = useState("learners");
  const [learners, setLearners] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch learners & teachers
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Learners
        const resLearners = await fetch("/api/learners");
        const dataLearners = await resLearners.json();
        if (resLearners.ok && dataLearners.success) {
          setLearners(dataLearners.learners || []);
        }

        // Teachers
        const resTeachers = await fetch("/api/teachers");
        const dataTeachers = await resTeachers.json();
        if (resTeachers.ok && dataTeachers.success) {
          setTeachers(dataTeachers.teachers || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="container-fluid py-4">
      <div className="login-card shadow-lg my-4 p-md-5 p-4 rounded w-100">
        <h4 className="text-center titleColor font-monospace fw-bold text-uppercase mb-4">
          Enrollment Records
        </h4>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-3 justify-content-center">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "learners" ? "active" : ""}`}
              onClick={() => setActiveTab("learners")}
            >
              Learners
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "teachers" ? "active" : ""}`}
              onClick={() => setActiveTab("teachers")}
            >
              Teachers
            </button>
          </li>
        </ul>

        {loading && <p className="text-center">Loading...</p>}

        {/* Learners Table */}
        {activeTab === "learners" && !loading && (
          <div
            className="table-responsive"
            style={{ maxHeight: "400px", overflowY: "auto" }}
          >
            <table className="table table-bordered text-center align-middle">
              <thead className="table-dark sticky-top">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Gender</th>
                  <th>Password</th>
                  <th>Parent</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {learners.length > 0 ? (
                  learners.map((learner, index) => (
                    <tr key={learner._id || index}>
                      <td>{index + 1}</td>
                      <td>{learner.fullName}</td>
                      <td>{learner.classLevel}</td>
                      <td>{learner.gender}</td>
                      <td>{learner.password}</td>
                      <td>{learner.parentName}</td>
                      <td>{learner.parentPhone}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No learners found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Teachers Table */}
        {activeTab === "teachers" && !loading && (
          <div
            className="table-responsive"
            style={{ maxHeight: "400px", overflowY: "auto" }}
          >
            <table className="table custom-table table-bordered text-center align-middle">
              <thead className="table-dark sticky-top">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Subject</th>
                  <th>Qualification</th>
                  <th>Experience</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {teachers.length > 0 ? (
                  teachers.map((teacher, index) => (
                    <tr key={teacher._id || index}>
                      <td>{index + 1}</td>
                      <td>{teacher.fullName}</td>
                      <td>{teacher.specialization}</td>
                      <td>{teacher.qualification}</td>
                      <td>{teacher.experience}</td>
                      <td>{teacher.phone}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No teachers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

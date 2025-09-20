"use client";

import { useState } from "react";

export default function EnrolmentTabs() {
  const [activeTab, setActiveTab] = useState("learners");

  return (
    <div className="container enForm d-flex justify-content-center align-items-center min-vh-100">
      <div className="login-card shadow-lg my-4 p-md-5 p-4 rounded w-100">
        <h4 className="text-center titleColor font-monospace fw-bold text-uppercase mb-4">
          Enrolment Portal
        </h4>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4 justify-content-center">
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

        {/* Learners Form */}
        {activeTab === "learners" && (
          <form>
            <div className="row">
              {/* Learner Info */}
              <p className="fw-bold titleColor">Learner Information</p>
              <hr className="mb-2 mt-0" />

              {/* Full Name */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold text-muted">Full Name:</label>
                  <input
                    type="text"
                    className="form-control login-input"
                    required
                  />
                </div>
              </div>

              {/* Passport */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold text-muted">
                    Passport Photograph:
                  </label>
                  <input
                    type="file"
                    className="form-control login-input"
                    accept="image/*"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold text-muted">Email:</label>
                  <input
                    type="email"
                    className="form-control login-input"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold text-muted">Phone:</label>
                  <input
                    type="text"
                    className="form-control login-input"
                    required
                  />
                </div>
              </div>

              {/* DOB */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold text-muted">Date of Birth:</label>
                  <input
                    type="date"
                    className="form-control login-input"
                    required
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold text-muted">Gender:</label>
                  <select className="form-select login-input" required>
                    <option value="">-- Select --</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </div>

              {/* Class */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold text-muted">Class:</label>
                  <select className="form-select login-input" required>
                    <option value="">-- Select Class --</option>
                    <option>Creche</option>
                    <option>Basic 1</option>
                    <option>Basic 2</option>
                    <option>Basic 3</option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="fw-bold text-muted">Address:</label>
                  <textarea
                    className="form-control login-input"
                    rows={3}
                    required
                  ></textarea>
                </div>
              </div>

              {/* Parent Info */}
              <p className="fw-bold titleColor mt-3">
                Parent / Guardian Information
              </p>
              <hr />

              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold text-muted">Parent Name:</label>
                  <input
                    type="text"
                    className="form-control login-input"
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold text-muted">Parent Phone:</label>
                  <input
                    type="text"
                    className="form-control login-input"
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold text-muted">Parent Email:</label>
                  <input type="email" className="form-control login-input" />
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold text-muted">
                    Parent Occupation:
                  </label>
                  <input type="text" className="form-control login-input" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="custom-btn text-uppercase font-monospace mt-3"
            >
              Submit Learner
            </button>
          </form>
        )}

        {/* Teachers Form */}
        {activeTab === "teachers" && (
          <form>
            <div className="row">
              <p className="fw-bold titleColor">Teacher Information</p>
              <hr className="mb-2 mt-0" />

              {/* Full Name */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold text-muted">Full Name:</label>
                  <input
                    type="text"
                    className="form-control login-input"
                    required
                  />
                </div>
              </div>

              {/* Passport */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold text-muted">
                    Passport Photograph:
                  </label>
                  <input
                    type="file"
                    className="form-control login-input"
                    accept="image/*"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold text-muted">Email:</label>
                  <input
                    type="email"
                    className="form-control login-input"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold text-muted">Phone:</label>
                  <input
                    type="text"
                    className="form-control login-input"
                    required
                  />
                </div>
              </div>

              {/* DOB */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold text-muted">Date of Birth:</label>
                  <input
                    type="date"
                    className="form-control login-input"
                    required
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold text-muted">Gender:</label>
                  <select className="form-select login-input" required>
                    <option value="">-- Select --</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </div>

              {/* Qualification */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold text-muted">Qualification:</label>
                  <select className="form-select login-input" required>
                    <option value="">-- Select Qualification --</option>
                    <option value="NCE">NCE</option>
                    <option value="B.Ed">B.Ed</option>
                    <option value="B.Sc(Ed)">B.Sc (Ed)</option>
                    <option value="M.Ed">M.Ed</option>
                    <option value="PhD">PhD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Subject Specialization */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold text-muted">
                    Subject Specialization:
                  </label>
                  <select className="form-select login-input" required>
                    <option value="">-- Select Subject --</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="Science">Science</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="ICT/Computer">ICT / Computer</option>
                    <option value="Arts">Arts</option>
                    <option value="Physical Education">
                      Physical Education
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Years of Experience */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold text-muted">
                    Years of Experience:
                  </label>
                  <select className="form-select login-input" required>
                    <option value="">-- Select Years --</option>
                    <option value="0-1">0 - 1 year</option>
                    <option value="2-4">2 - 4 years</option>
                    <option value="5-7">5 - 7 years</option>
                    <option value="8-10">8 - 10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="fw-bold text-muted">Address:</label>
                  <textarea
                    className="form-control login-input"
                    rows={3}
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="custom-btn text-uppercase font-monospace mt-3"
            >
              Save Teacher
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

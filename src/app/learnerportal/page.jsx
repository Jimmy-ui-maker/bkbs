"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LearnerPortal() {
  const router = useRouter();
  const [learner, setLearner] = useState(null);
  const [selectedSession, setSelectedSession] = useState("2024/2025");
  const [showProfile, setShowProfile] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [updatedData, setUpdatedData] = useState({});

  const sessions = ["2024/2025", "2023/2024", "2022/2023"];
  const terms = ["First Term", "Second Term", "Third Term"];

  useEffect(() => {
    const storedData = localStorage.getItem("learnerData");
    if (storedData) {
      const parsed = JSON.parse(storedData);
      if (!parsed._id && parsed.id) parsed._id = parsed.id; // safety check
      setLearner(parsed);
      setUpdatedData(parsed);
    } else {
      router.push("/learnerportal/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("learnerData");
    router.push("/learnerportal/login");
  };

  // ✅ Unified Update Handler (used by the Edit form)
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!learner?._id) {
      alert("Learner ID missing. Please log in again.");
      return;
    }

    try {
      const res = await fetch(`/api/learners/${learner._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: updatedData.address,
          parentPhone: updatedData.parentPhone,
          password: updatedData.password || "",
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("learnerData", JSON.stringify(data.learner));
        setLearner(data.learner);
        setUpdatedData(data.learner);
        setShowEdit(false);
        alert("✅ Profile updated successfully!");
      } else {
        alert(data.error || "Error updating profile.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    }
  };

  if (!learner) {
    return (
      <div className="d-flex vh-100 justify-content-center align-items-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <section className="learner-dashboard">
      <div className="container py-5">
        <div className="p-4 portal shadow rounded-4 border border-warning-subtle ">
          {/* ===== Top User Bar ===== */}
          <div className="d-flex justify-content-end align-items-center flex-wrap gap-2 mb-3 user-bar">
            <div className="dropdown">
              <button
                className="btn dropdown-toggle user-btn"
                type="button"
                id="userMenuButton"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-person-circle me-1"></i> {learner.fullName}
              </button>
              <ul
                className="dropdown-menu dropdown-menu-end shadow-sm"
                aria-labelledby="userMenuButton"
              >
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => setShowProfile(true)}
                  >
                    <i className="bi bi-person"></i> View Profile
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => setShowEdit(true)}
                  >
                    <i className="bi bi-pencil-square"></i> Edit Profile
                  </button>
                </li>
              </ul>
            </div>

            <button
              className="btn logout-btn "
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>

          {/* ===== Profile Header ===== */}
          <div className="text-center mb-4 mt-3">
            <div
              className="profile-pic mx-auto mb-3 rounded-circle overflow-hidden border border-3 border-warning-subtle"
              style={{ width: "120px", height: "120px" }}
            >
              <img
                src={learner.imgUrl || "/imgs/school logo.png"}
                alt="Profile"
                className="w-100 h-100 object-fit-cover"
              />
            </div>
            <h5 className="mb-1 fw-bold">
              Admission No: {learner.admissionNo}
            </h5>
            <p className="mb-0">{learner.fullName}</p>
          </div>

          {/* ===== Profile Section ===== */}
          <h4 className="text-center mb-3 pb-2 fw-bold">My Dashboard</h4>

          <hr className="line" />
          {/* ===== Current Info ===== */}
          <div className="text-center d-flex flex-wrap justify-content-center gap-4 my-3">
            <h5 className="fw-semibold">
              Current Session: <span className="text-success">2024/2025</span>
            </h5>
            <h5 className="fw-semibold">
              Current Class:{" "}
              <span className="text-primary">{learner.classLevel}</span>
            </h5>
          </div>
          <hr className="line" />

          {/* ===== Session & Class Selectors ===== */}
          <div className="row mb-4 text-center">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Select Class</label>
              <select className="form-select login-input">
                <option>{learner.classLevel}</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Select Session</label>
              <select
                className="form-select login-input"
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
              >
                {sessions.map((session) => (
                  <option key={session}>{session}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ===== Term Results ===== */}
          <div className="result-section text-center">
            <h5 className="mb-3">
              Results for <span className="fw-bold">{selectedSession}</span>
            </h5>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              {terms.map((term) => (
                <div
                  key={term}
                  className="term-card rounded-4 p-3 border border-warning-subtle"
                  style={{ width: "250px" }}
                >
                  <h6 className="fw-bold mb-2">{term}</h6>
                  <div className="d-flex justify-content-center gap-2">
                    <button className="btn btn-outline-success btn-sm">
                      <i className="bi bi-eye"></i> View
                    </button>
                    <button className="btn btn-outline-primary btn-sm">
                      <i className="bi bi-download"></i> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== Footer ===== */}
          <div className="text-center mt-5 small">
            <p className="mb-0">
              Bright Kingdom British School — Excellence & Integrity
            </p>
          </div>
        </div>
      </div>

      {/* ===== PROFILE MODAL ===== */}
      {showProfile && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-color border-0 rounded-4 shadow">
              <div className="modal-header ">
                <h5 className="modal-title">Learner Profile</h5>
                <hr className="line" />
                <button
                  className="btn-close"
                  onClick={() => setShowProfile(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Name:</strong> {learner.fullName}
                </p>
                <p>
                  <strong>Admission No:</strong> {learner.admissionNo}
                </p>
                <p>
                  <strong>Gender:</strong> {learner.gender}
                </p>
                <p>
                  <strong>DOB:</strong> {new Date(learner.dob).toDateString()}
                </p>
                <p>
                  <strong>Class:</strong> {learner.classLevel}
                </p>
                <p>
                  <strong>Address:</strong> {learner.address}
                </p>
                <hr />
                <p>
                  <strong>Parent Name:</strong> {learner.parentName}
                </p>
                <p>
                  <strong>Parent Phone:</strong> {learner.parentPhone}
                </p>
                <p>
                  <strong>Parent Email:</strong> {learner.parentEmail}
                </p>
                <p>
                  <strong>Occupation:</strong> {learner.parentOccupation}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowProfile(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT PROFILE MODAL ===== */}
      {showEdit && learner && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered ">
            <div className="modal-content modal-color  border-0 rounded-4 shadow">
              <div className="modal-header ">
                <h5 className="modal-title">Edit Profile</h5>
                <button
                  className="btn-close"
                  onClick={() => {
                    setShowEdit(false);
                    setUpdatedData(learner);
                  }}
                ></button>
              </div>

              {/* ✅ Using handleUpdate here */}
              <form onSubmit={handleUpdate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Address</label>
                    <input
                      type="text"
                      className="form-control login-input"
                      value={updatedData.address || ""}
                      onChange={(e) =>
                        setUpdatedData({
                          ...updatedData,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Parent Phone
                    </label>
                    <input
                      type="text"
                      className="form-control login-input"
                      value={updatedData.parentPhone || ""}
                      onChange={(e) =>
                        setUpdatedData({
                          ...updatedData,
                          parentPhone: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Password</label>
                    <input
                      type="password"
                      className="form-control login-input"
                      placeholder="Enter new password (optional)"
                      value={updatedData.password || ""}
                      onChange={(e) =>
                        setUpdatedData({
                          ...updatedData,
                          password: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="submit" className="btn btn-success">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowEdit(false);
                      setUpdatedData(learner);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ClassSelector,
  SessionSelector,
  ResultViewer,
} from "@/components/LearnerComponent";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_UPLOAD_PRESET;

export default function LearnerPortal() {
  const router = useRouter();
  const [learner, setLearner] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [updatedData, setUpdatedData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [updatedFile, setUpdatedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [selectedSession, setSelectedSession] = useState("");
  const [currentSession, setCurrentSession] = useState(null);

  useEffect(() => {
    const fetchCurrentSession = async () => {
      try {
        const res = await fetch("/api/adminapi/sessions");
        const data = await res.json();

        if (data.success && data.sessions.length > 0) {
          // Get the latest or active session
          const active =
            data.sessions.find((s) => s.isActive) || data.sessions[0];
          setCurrentSession(active.sessionName);
          setSelectedSession(active.sessionName);
        }
      } catch (err) {
        console.error("Failed to fetch session:", err);
        setCurrentSession("2024/2025"); // fallback
        setSelectedSession("2024/2025");
      }
    };

    fetchCurrentSession();
  }, []);

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

  // Upload image to Cloudinary
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    return data.secure_url;
  };

  // ✅ Unified Update Handler (used by the Edit form)
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!learner?._id) {
      alert("Learner ID missing. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      let imageUrl = updatedData.imgUrl; // keep existing image by default

      // ✅ If user selected a new passport file, upload to Cloudinary
      if (updatedFile) {
        const uploaded = await uploadImage(updatedFile);
        if (uploaded) imageUrl = uploaded;
      }

      // ✅ Prepare the update payload
      const updatePayload = {
        fullName: updatedData.fullName,
        dob: updatedData.dob,
        parentName: updatedData.parentName,
        parentPhone: updatedData.parentPhone,
        parentEmail: updatedData.parentEmail,
        parentOccupation: updatedData.parentOccupation,
        imgUrl: imageUrl, // updated image here
        address: updatedData.address,
        gender: updatedData.gender,
        classLevel: updatedData.classLevel,
        house: updatedData.house,
        password: updatedData.password || "",
      };

      const res = await fetch(`/api/learners/${learner._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("learnerData", JSON.stringify(data.learner));
        setLearner(data.learner);
        setUpdatedData(data.learner);
        setShowEdit(false);
        setUpdatedFile(null);
        setPreviewUrl(null);
        alert("✅ Profile updated successfully!");
      } else {
        alert(data.error || "❌ Error updating profile.");
      }
    } catch (err) {
      console.error("Update Error:", err);
      alert("⚠️ Network error. Please try again.");
    }

    setLoading(false);
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
          {/* ===== Top Bar (Compact Icon Version) ===== */}
          <div className="d-flex justify-content-end align-items-end mb-3 user-bar">
            <div className="dropdown">
              <button
                className="btn text-truncate modal-color p-3 rounded-circle border-0"
                type="button"
                id="userMenuButton"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                title="Profile Menu"
                style={{
                  width: "45px",
                  height: "45px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className="bi bi-person-circle fs-4"></i>
              </button>

              <ul
                className="dropdown-menu shadow-sm modal-color"
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
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right"></i> Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* ===== Profile Header (Adjusted Upward) ===== */}
          <div className="text-center mb-4 profile-header">
            <div
              className="profile-pic mx-auto mb-2 rounded-circle overflow-hidden "
              style={{ width: "120px", height: "120px" }}
            >
              <img
                src={learner.imgUrl || "/imgs/school logo.png"}
                alt="Profile"
                className="w-100 h-100 object-fit-cover"
              />
            </div>
            <h5 className="mb-1 fw-bold text-wrap">
              Admission No: {learner.admissionNo}
            </h5>
            <p className="mb-0 text-truncate">{learner.fullName}</p>
          </div>

          {/* ===== Current Info ===== */}
          <div className="text-center d-flex flex-wrap justify-content-center gap-4 my-3">
            <h6 className="fw-semibold">
              Current Session:{" "}
              <span className="text-success">
                {currentSession || "Loading..."}
              </span>
            </h6>
            <h6 className="fw-semibold">
              Current Class:{" "}
              <span className="text-primary">{learner.classLevel}</span>
            </h6>
          </div>
          <hr className="line" />

          {/* ===== Session & Class Selectors ===== */}
          <div className="row mb-4 text-center">
            <div className="col-md-6">
              <ClassSelector
                learner={learner}
                selectedClass={learner.classLevel}
                setSelectedClass={(val) => console.log("Selected Class:", val)}
              />
            </div>
            <div className="col-md-6">
              <SessionSelector
                selectedSession={selectedSession}
                setSelectedSession={setSelectedSession}
              />
            </div>
          </div>

          {/* ===== Term Results ===== */}
          <ResultViewer
            learner={learner}
            selectedClass={learner.classLevel}
            selectedSession={selectedSession}
          />

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
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg modal-fullscreen-sm-">
            <div className="modal-content modal-color ">
              <div className="modal-header ">
                <h5 className="modal-title">Learner Profile</h5>
                <div className="line"> </div>
                <button
                  className="btn-close shadow-none"
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
                  <strong>House:</strong> {learner.house}
                </p>
                <p>
                  <strong>Address:</strong> {learner.address}
                </p>
                <div className="line"> </div>
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
                  className="btn btn-secondary shadow-none"
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
          <div className="modal-dialog modal-dialog-centered modal-lg modal-fullscreen-sm">
            <div className="modal-content modal-color  border-0 rounded-4 shadow">
              <div className="modal-header ">
                <h5 className="modal-title">Edit Profile</h5>
                <button
                  className="btn-close shadow-none border-0"
                  onClick={() => {
                    setShowEdit(false);
                    setUpdatedData(learner);
                  }}
                ></button>
              </div>

              {/* ✅ Using handleUpdate here */}
              <form onSubmit={handleUpdate}>
                <div className="modal-body w-100">
                  <div className="row">
                    <p className="fw-bold titleColor">Learner Information</p>
                    <hr className="mb-2 mt-0 line" />

                    {/* Full Name */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Full Name
                        </label>
                        <input
                          type="text"
                          className="form-control login-input"
                          value={updatedData.fullName || ""}
                          onChange={(e) =>
                            setUpdatedData({
                              ...updatedData,
                              fullName: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Passport Upload with Preview */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Passport Photograph
                      </label>
                      <input
                        type="file"
                        className="form-control login-input"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setUpdatedFile(file);
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) =>
                              setPreviewUrl(ev.target.result);
                            reader.readAsDataURL(file);
                          } else setPreviewUrl(null);
                        }}
                      />
                      <div className="mt-3 text-center d-flex justify-content-center gap-3 flex-wrap">
                        {updatedData.imgUrl && (
                          <div>
                            <p className="small fw-semibold">Current</p>
                            <img
                              src={updatedData.imgUrl}
                              alt="Old Passport"
                              className="rounded border"
                              style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        )}
                        {previewUrl && (
                          <div>
                            <p className="small fw-semibold">New</p>
                            <img
                              src={previewUrl}
                              alt="New Passport"
                              className="rounded border"
                              style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* DOB */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Date of Birth
                        </label>
                        <input
                          type="Date"
                          className="form-control login-input"
                          value={updatedData.dob || ""}
                          onChange={(e) =>
                            setUpdatedData({
                              ...updatedData,
                              dob: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Gender</label>
                        <select
                          className="form-select login-input"
                          value={updatedData.gender || ""}
                          onChange={(e) =>
                            setUpdatedData({
                              ...updatedData,
                              gender: e.target.value,
                            })
                          }
                        >
                          <option value="">-- Select --</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Address
                        </label>
                        <textarea
                          className="form-control login-input"
                          rows={3}
                          value={updatedData.address || ""}
                          onChange={(e) =>
                            setUpdatedData({
                              ...updatedData,
                              address: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Password (with Eye Icon) */}
                    <div className="col-md-6">
                      <div className="mb-3 position-relative">
                        <label className="form-label fw-semibold">
                          Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control login-input pe-5"
                          placeholder="Enter new password (optional)"
                          value={updatedData.password || ""}
                          onChange={(e) =>
                            setUpdatedData({
                              ...updatedData,
                              password: e.target.value,
                            })
                          }
                        />
                        <i
                          className={`bi ${
                            showPassword ? "bi-eye-slash" : "bi-eye"
                          } position-absolute`}
                          style={{
                            top: "65%",
                            right: "15px",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            color: "#000",
                          }}
                          onClick={() => setShowPassword(!showPassword)}
                        ></i>
                      </div>
                    </div>

                    {/* Parent Info */}
                    <p className="fw-bold titleColor mt-3">
                      Parent / Guardian Information
                    </p>
                    <hr className="mb-2 mt-0 line" />

                    {/* Parent Name */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Parent Name
                        </label>
                        <input
                          type="text"
                          className="form-control login-input"
                          value={updatedData.parentName || ""}
                          onChange={(e) =>
                            setUpdatedData({
                              ...updatedData,
                              parentName: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Parent Phone */}
                    <div className="col-md-6">
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
                    </div>

                    {/* Parent Email */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Parent Email
                        </label>
                        <input
                          type="email"
                          className="form-control login-input"
                          value={updatedData.parentEmail || ""}
                          onChange={(e) =>
                            setUpdatedData({
                              ...updatedData,
                              parentEmail: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Parent Occupation */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Parent Occupation
                        </label>
                        <select
                          className="form-select login-input"
                          value={updatedData.parentOccupation || ""}
                          onChange={(e) =>
                            setUpdatedData({
                              ...updatedData,
                              parentOccupation: e.target.value,
                            })
                          }
                        >
                          <option value="">-- Select --</option>
                          <option value="Teacher">Teacher</option>
                          <option value="Minister">Minister</option>
                          <option value="Doctor">Doctor</option>
                          <option value="Artistic">Artistic</option>
                          <option value="Engineer">Engineer</option>
                          <option value="Accountant">Accountant</option>
                          <option value="Business Man">Business Man</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="modal-footer">
                    <button
                      type="submit"
                      className="custom-btn text-uppercase font-monospace mt-3"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

"use client";

import { useState } from "react";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_UPLOAD_PRESET;

export default function EnrolmentTabs() {
  const [activeTab, setActiveTab] = useState("learners");
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Learner form state
  const [learnerForm, setLearnerForm] = useState({
    fullName: "",
    dob: "",
    gender: "",
    classLevel: "",
    password: "",
    address: "",
    house: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    parentOccupation: "",
    imgUrl: "",
  });

  const [learnerFile, setLearnerFile] = useState(null);

  // Teacher form state
  const [teacherForm, setTeacherForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    guarantorPhone: "",
    dob: "",
    gender: "",
    qualification: "",
    specialization: "",
    experience: "",
    address: "",
    password: "",
  });

  // Handle input changes
  const handleChange = (formType, field, value) => {
    if (formType === "learner") {
      setLearnerForm({ ...learnerForm, [field]: value });
    } else {
      setTeacherForm({ ...teacherForm, [field]: value });
    }
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

  // Submit learner
  const handleLearnerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ✅ Check password match
    if (learnerForm.password !== confirmPassword) {
      alert("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      let imgUrl = learnerForm.imgUrl;

      if (learnerFile) {
        imgUrl = await uploadImage(learnerFile);
      }

      const res = await fetch("/api/learners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...learnerForm, imgUrl }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(
          `Learner enrolled successfully! Admission No: ${data.admissionNo}`
        );
        setLearnerForm({
          fullName: "",
          dob: "",
          gender: "",
          classLevel: "",
          password: "",
          address: "",
          house: "",
          parentName: "",
          parentPhone: "",
          parentEmail: "",
          parentOccupation: "",
          imgUrl: "",
        });
        setConfirmPassword("");
        setLearnerFile(null);
      } else {
        alert(data.error || "Failed to enroll learner");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
    setLoading(false);
  };

  // Submit teacher
  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherForm),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Teacher enrolled successfully!");
        setTeacherForm({
          fullName: "",
          email: "",
          phone: "",
          guarantorPhone: "",
          dob: "",
          gender: "",
          qualification: "",
          specialization: "",
          experience: "",
          address: "",
          password: "",
        });
      } else {
        alert(data.error || "Failed to enroll teacher");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
    setLoading(false);
  };
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
          <form onSubmit={handleLearnerSubmit}>
            <div className="row">
              <p className="fw-bold titleColor">Learner Information</p>
              <hr className="mb-2 mt-0 line" />

              {/* Full Name */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold ">Full Name:</label>
                  <input
                    type="text"
                    className="form-control login-input"
                    required
                    value={learnerForm.fullName}
                    onChange={(e) =>
                      handleChange("learner", "fullName", e.target.value)
                    }
                  />
                </div>
              </div>
              {/* Passport Upload */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold ">Passport Photograph:</label>
                  <input
                    type="file"
                    className="form-control login-input"
                    accept="image/*"
                    onChange={(e) => setLearnerFile(e.target.files[0])}
                  />
                </div>
              </div>

              {/* DOB */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold ">Date of Birth:</label>
                  <input
                    type="date"
                    className="form-control login-input"
                    required
                    value={learnerForm.dob}
                    onChange={(e) =>
                      handleChange("learner", "dob", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold ">Gender:</label>
                  <select
                    className="form-select login-input"
                    required
                    value={learnerForm.gender}
                    onChange={(e) =>
                      handleChange("learner", "gender", e.target.value)
                    }
                  >
                    <option value="">-- Select --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              {/* House */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold ">House:</label>
                  <select
                    className="form-select login-input"
                    required
                    value={learnerForm.house}
                    onChange={(e) =>
                      handleChange("learner", "house", e.target.value)
                    }
                  >
                    <option value="">-- Select --</option>
                    <option value="Red House">Red House</option>
                    <option value="Blue House">Blue House</option>
                    <option value="Green House">Green House</option>
                    <option value="Yellow House">Yellow House</option>
                    <option value="Purple House">Purple House</option>
                  </select>
                </div>
              </div>

              {/* Class */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold ">Class:</label>
                  <select
                    className="form-select login-input"
                    required
                    value={learnerForm.classLevel}
                    onChange={(e) =>
                      handleChange("learner", "classLevel", e.target.value)
                    }
                  >
                    <option value="">-- Select Class --</option>
                    <option value="Creche">Creche</option>
                    <option value="Reception 1">Reception 1</option>
                    <option value="Reception 2">Reception 2</option>
                    <option value="Nursery 1">Nursery 1</option>
                    <option value="Nursery 2">Nursery 2</option>
                    <option value="Basic 1">Basic 1</option>
                    <option value="Basic 2">Basic 2</option>
                    <option value="Basic 3">Basic 3</option>
                    <option value="Basic 4">Basic 4</option>
                    <option value="Basic 5">Basic 5</option>
                    <option value="Basic 6">Basic 6</option>
                    <option value="JSS 1">JSS 1</option>
                    <option value="JSS 2">JSS 2</option>
                    <option value="JSS 3">JSS 3</option>
                    <option value="SSS 1">SSS 1</option>
                    <option value="SSS 2">SSS 2</option>
                    <option value="SSS 3">SSS 3</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div className="col-md-6">
                <div className="mb-3 position-relative">
                  <label className="fw-bold">Password:</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control login-input pe-5"
                    required
                    value={learnerForm.password}
                    onChange={(e) =>
                      handleChange("learner", "password", e.target.value)
                    }
                    placeholder="Enter password"
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

              {/* Confirm Password */}
              <div className="col-md-6">
                <div className="mb-3 position-relative">
                  <label className="fw-bold">Confirm Password:</label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control login-input pe-5"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                  />
                  <i
                    className={`bi ${
                      showConfirmPassword ? "bi-eye-slash" : "bi-eye"
                    } position-absolute`}
                    style={{
                      top: "65%",
                      right: "15px",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#000",
                    }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  ></i>
                </div>
              </div>

              {/* Address */}
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="fw-bold ">Address:</label>
                  <textarea
                    className="form-control login-input"
                    rows={3}
                    required
                    value={learnerForm.address}
                    onChange={(e) =>
                      handleChange("learner", "address", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Parent Info */}
              <p className="fw-bold titleColor mt-3">
                Parent / Guardian Information
              </p>
              <hr />

              {/* Parent Name */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold ">Parent Name (Mr and Mrs):</label>
                  <input
                    type="text"
                    className="form-control login-input"
                    required
                    value={learnerForm.parentName}
                    onChange={(e) =>
                      handleChange("learner", "parentName", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Parent Phone */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold ">Parent Phone:</label>
                  <input
                    type="text"
                    className="form-control login-input"
                    required
                    value={learnerForm.parentPhone}
                    onChange={(e) =>
                      handleChange("learner", "parentPhone", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Parent Email */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold ">Parent Email:</label>
                  <input
                    type="email"
                    className="form-control login-input"
                    value={learnerForm.parentEmail}
                    onChange={(e) =>
                      handleChange("learner", "parentEmail", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Parent Occupation */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold ">Parent Occupation:</label>
                  <select
                    className="form-select login-input"
                    required
                    value={learnerForm.parentOccupation}
                    onChange={(e) =>
                      handleChange(
                        "learner",
                        "parentOccupation",
                        e.target.value
                      )
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

            <button
              type="submit"
              className="custom-btn text-uppercase font-monospace mt-3"
              disabled={loading}
            >
              {loading ? "Enrolling..." : "Enroll Learner"}
            </button>
          </form>
        )}

        {/* Teachers Form */}
        {activeTab === "teachers" && (
          <form onSubmit={handleTeacherSubmit}>
            <div className="row">
              <p className="fw-bold titleColor">Teacher Information</p>
              <hr className="mb-2 mt-0" />

              {/* Full Name */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold ">Full Name:</label>
                  <input
                    type="text"
                    className="form-control login-input"
                    required
                    value={teacherForm.fullName}
                    onChange={(e) =>
                      handleChange("teacher", "fullName", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Email */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold ">Email:</label>
                  <input
                    type="email"
                    className="form-control login-input"
                    required
                    value={teacherForm.email}
                    onChange={(e) =>
                      handleChange("teacher", "email", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold ">Phone:</label>
                  <input
                    type="text"
                    className="form-control login-input"
                    required
                    value={teacherForm.phone}
                    onChange={(e) =>
                      handleChange("teacher", "phone", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Guarantor Phone */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold ">Guarantor Phone:</label>
                  <input
                    type="text"
                    className="form-control login-input"
                    required
                    value={teacherForm.guarantorPhone}
                    onChange={(e) =>
                      handleChange("teacher", "guarantorPhone", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* DOB */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold ">Date of Birth:</label>
                  <input
                    type="date"
                    className="form-control login-input"
                    required
                    value={teacherForm.dob}
                    onChange={(e) =>
                      handleChange("teacher", "dob", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold ">Gender:</label>
                  <select
                    className="form-select login-input"
                    required
                    value={teacherForm.gender}
                    onChange={(e) =>
                      handleChange("teacher", "gender", e.target.value)
                    }
                  >
                    <option value="">-- Select --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              {/* Qualification */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold ">Qualification:</label>
                  <select
                    className="form-select login-input"
                    required
                    value={teacherForm.qualification}
                    onChange={(e) =>
                      handleChange("teacher", "qualification", e.target.value)
                    }
                  >
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
                  <label className="fw-bold ">Subject Specialization:</label>
                  <select
                    className="form-select login-input"
                    required
                    value={teacherForm.specialization}
                    onChange={(e) =>
                      handleChange("teacher", "specialization", e.target.value)
                    }
                  >
                    <option value="">-- Select Specialization --</option>
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
                  <label className="fw-bold ">Years of Experience:</label>
                  <select
                    className="form-select login-input"
                    required
                    value={teacherForm.experience}
                    onChange={(e) =>
                      handleChange("teacher", "experience", e.target.value)
                    }
                  >
                    <option value="">-- Select Years --</option>
                    <option value="0-1">0 - 1 year</option>
                    <option value="2-4">2 - 4 years</option>
                    <option value="5-7">5 - 7 years</option>
                    <option value="8-10">8 - 10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div className="col-md-6">
                <div className="mb-3 position-relative">
                  <label className="fw-bold">Password:</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control login-input pe-5"
                    required
                    value={teacherForm.password}
                    onChange={(e) =>
                      handleChange("teacher", "password", e.target.value)
                    }
                    placeholder="Enter password"
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

              {/* Address */}
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="fw-bold ">Address:</label>
                  <textarea
                    className="form-control login-input"
                    rows={3}
                    required
                    value={teacherForm.address}
                    onChange={(e) =>
                      handleChange("teacher", "address", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="custom-btn text-uppercase font-monospace mt-3"
              disabled={loading}
            >
              {loading ? "Enrolling..." : "Enroll Teacher"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

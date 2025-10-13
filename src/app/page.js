"use client";

import AboutSection from "@/components/modal-component/AboutSection";
import AnnouncementPage from "@/components/modal-component/AnnouncementPage";
import FAQSection from "@/components/modal-component/FAQSection";
import GalleryPage from "@/components/modal-component/GalleryPage";
import LandingSection from "@/components/modal-component/LandingSection";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Default credentials
  const users = {
    enrolment: {
      username: "enroll1",
      password: "password",
      route: "/enrollment",
    },
    admin: { username: "admin1", password: "admin1", route: "/admin" },
    teacher: { username: "teacher1", password: "teacher1", route: "/teacher" },
    headteacher: {
      username: "head1",
      password: "head1",
      route: "/headteacher",
    },
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // Check credentials
    for (const [roleKey, creds] of Object.entries(users)) {
      if (username === creds.username && password === creds.password) {
        console.log(
          "✅ Logged in as:",
          roleKey,
          "→ Redirecting to:",
          creds.route
        );

        localStorage.setItem("role", roleKey);
        localStorage.setItem("username", username);
        router.push(creds.route);
        return;
      }
    }

    // ❌ Invalid login
    setError("Invalid username or password");
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
      {/* Logo */}
      <img
        src="/imgs/school logo.png"
        alt="BKBS Logo"
        width={120}
        height={120}
        className="mb-3"
      />

      {/* Title */}
      <h4 className="fw-bold text-center">Bright Kingdom British School</h4>
      <p className=" text-center">The future is now</p>

      {/* Login Form */}
      <div className="login-card p-4 w-100" style={{ maxWidth: "400px" }}>
        <h5 className="fw-semibold mb-3">Sign In</h5>

        <form onSubmit={handleLogin}>
          {/* Username */}
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="login-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="form-label">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="login-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Show Password */}
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input shadow-none text-bg-secondary"
              id="showPassword"
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="showPassword">
              Show Password
            </label>
          </div>

          {/* Error message */}
          {error && <p className="text-danger small">{error}</p>}

          {/* Sign In Button */}
          <button type="submit" className="custom-btn">
            Sign In
          </button>
        </form>

        {/* Forgot Password */}
        <div className="text-end mt-2">
          <a href="/learnerportal" className=" fw-semibold">
            Learner Login →
          </a>
        </div>
      </div>

      {/* Sticky Info Button */}
      <button className="chat-btn" onClick={() => setShowModal(true)}>
        <i className="bi bi-info"></i>
      </button>

      {/* Fullscreen Modal */}
      {showModal && (
        <div className="custom-modal">
          <div className="custom-modal-content">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg text-dark shadow-lg px-3">
              <a className="navbar-brand fw-bold" href="#">
                BKBS
              </a>
              <button
                className="btn-close btn-close-dark ms-auto"
                onClick={() => setShowModal(false)}
              ></button>
            </nav>

            {/* Page Sections */}
            <div className="p-4">
              <LandingSection />
              <AboutSection />
              <AnnouncementPage />
              <GalleryPage />
              <FAQSection />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

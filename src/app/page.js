"use client";

import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
      {/* Logo */}
      <img
        src="/imgs/logo.jpg"
        alt="BKBS Logo"
        width={120}
        height={120}
        className="mb-3"
      />

      {/* Title */}
      <h4 className="fw-bold text-center">Bright Kingdom British School</h4>
      <p className="text-muted text-center">The future is now</p>

      {/* Login Form */}
      <div className="login-card p-4 w-100" style={{ maxWidth: "400px" }}>
        <h5 className="fw-semibold mb-3">Sign In</h5>

        <form>
          {/* Username */}
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input type="text" className="login-input" placeholder="Username" />
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="form-label">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="login-input"
              placeholder="Password"
            />
          </div>

          {/* Show Password */}
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="showPassword"
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="showPassword">
              Show Password
            </label>
          </div>

          {/* Sign In Button */}
          <button type="submit" className="custom-btn">
            Sign In
          </button>
        </form>

        {/* Forgot Password */}
        <div className="text-end mt-2">
          <a href="#" className="text-decoration-none fw-semibold">
            Forgot Password →
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
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
              <a className="navbar-brand fw-bold" href="#">
                BKBS
              </a>
              <button
                className="btn-close btn-close-white ms-auto"
                onClick={() => setShowModal(false)}
              ></button>
            </nav>

            {/* Page Sections */}
            <div className="p-4 text-center">
              {/* Landing Page */}
              <section className="mb-5">
                <h1 className="fw-bold">Welcome to Bright Kingdom British School</h1>
                <p className="lead">
                  Building the leaders of tomorrow through excellence in education.
                </p>
              </section>

              {/* About the School */}
              <section className="mb-5">
                <h2 className="fw-semibold">About Us</h2>
                <p>
                  Bright Kingdom British School is dedicated to nurturing young
                  minds with quality education, modern facilities, and strong values. 
                  We prepare students for the future with confidence and integrity.
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

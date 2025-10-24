"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LearnerLogin() {
  const router = useRouter();

  const [admissionNo, setAdmissionNo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/learners/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admissionNo, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Optionally store learner info in localStorage
        localStorage.setItem("learnerData", JSON.stringify(data.learner));
        router.push("/learnerportal"); // Redirect to portal
      } else {
        setError(data.message || "Login failed. Try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex flex-column justify-content-center py-4 align-items-center">
      {/* Logo */}
      <img
        src="/imgs/school logo.png"
        alt="BKBS Logo"
        width={100}
        height={100}
        className="mb-3"
      />

      <h4 className="fw-bold text-center mb-3">Learner Login</h4>

      <div
        className="login-card p-4 w-100 shadow rounded-4"
        style={{ maxWidth: "400px" }}
      >
        <form onSubmit={handleLogin} className="card login-card p-4 shadow-sm">
          {/* Admission Number */}
          <div className="mb-3">
            <label className="form-label">Admission Number</label>
            <input
              type="text"
              className="login-input"
              placeholder="e.g. BKBS/A25/001"
              value={admissionNo}
              onChange={(e) => setAdmissionNo(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="form-label">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="login-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Show Password */}
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input shadow-none"
              id="showPassword"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="showPassword">
              Show Password
            </label>
          </div>

          {/* Error Message */}
          {error && <p className="text-danger small text-center">{error}</p>}

          {/* Login Button */}
          <button
            type="submit"
            className=" custom-btn w-100 "
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        {/* learners portal */}
        <div className="text-end mt-2">
          <a href="/" className=" fw-semibold">
            Home Page
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-4 text-center small text-muted">
        <p className="mb-1">
          © {new Date().getFullYear()} Bright Kingdom British School
        </p>
        <p className="mb-0">
          Designed in{" "}
          <span className="fw-semibold text-success">Nigeria 🇳🇬</span> by{" "}
          <a
            href="https://jimmysite.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none fw-bold text-warning"
          >
            Sir Jimmy
          </a>
        </p>
      </footer>
    </div>
  );
}

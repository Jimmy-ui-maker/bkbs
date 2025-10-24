"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TeacherLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/teachers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid login credentials");
        setLoading(false);
        return;
      }

      // ✅ Store login info using email instead of full name
      localStorage.setItem("role", "teacher");
      localStorage.setItem("username", data.teacher.email); // 👈 Fix here
      localStorage.setItem("teacherId", data.teacher.id);

      // Redirect to teacher dashboard
      router.push("/teacher");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex flex-column justify-content-center py-5 align-items-center ">
      {/* Logo */}
      <img
        src="/imgs/school logo.png"
        alt="BKBS Logo"
        width={100}
        height={100}
        className="mb-3"
      />

      <h4 className="fw-bold text-center">Teacher Login</h4>

      <div className="login-card p-4 w-100" style={{ maxWidth: "400px" }}>
        <form onSubmit={handleLogin} className="card login-card p-4 shadow-sm">
          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="form-label">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="login-input"
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

          {/* Error */}
          {error && <p className="text-danger small">{error}</p>}

          {/* Button */}
          <button type="submit" className="custom-btn w-100" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Link to home */}
        <div className="text-end mt-2">
          <a href="/" className="fw-semibold">
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

      <style jsx>{`
        @media (max-width: 576px) {
          .login-card {
            padding: 1.5rem !important;
          }
          button {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
}

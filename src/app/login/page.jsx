// src/app/teacher/login/page.jsx
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

      // ✅ Store login info in localStorage
      localStorage.setItem("role", "teacher");
      localStorage.setItem("username", data.teacher.fullName);
      localStorage.setItem("teacherId", data.teacher.id);

      // ✅ Redirect to teacher dashboard
      router.push("/teacher");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
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
        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="login-input"
              placeholder="Enter your email"
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
              className="form-check-input"
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
        {/* teachers portal */}
        <div className="text-end mt-2">
          <a href="/" className=" fw-semibold">
            Home Page 
          </a>
        </div>
      </div>
    </div>
  );
}

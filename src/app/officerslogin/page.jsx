"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OfficcersLoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Logging in...");

    try {
      const res = await fetch("/api/adminapi/loginofficers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        // Save token + user data in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setStatus("Login successful ✅ Redirecting...");

        // Role-based redirection
        switch (data.user.role) {
          case "Head Teacher":
            router.push("/headteacher");
            break;
          case "Enrollment Officer":
            router.push("/enrollment");
            break;
          case "Support Officer":
            router.push("/supportofficer");
            break;
          case "Exams Officer":
            router.push("/examofficer/dashboard");
            break;
          case "Annoucement Officer":
            router.push("/annoucement");
            break;
          default:
            router.push("/"); // fallback
        }
      } else {
        setStatus("❌ " + data.error);
      }
    } catch (err) {
      setStatus("⚠️ Something went wrong");
    }
  };

  return (
    <div className="container d-flex flex-column justify-content-center py-4 align-items-center ">
      {/* Logo */}
      <img
        src="/imgs/school logo.png"
        alt="BKBS Logo"
        width={100}
        height={100}
        className="mb-3"
      />

      <h4 className="fw-bold text-center">Officers Login</h4>
      <div className="login-card p-4 w-100" style={{ maxWidth: "400px" }}>
        <form onSubmit={handleSubmit} className="card login-card p-4 shadow-sm">
          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control login-input"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control login-input"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-dark w-100">
            Login
          </button>
          {status && <p className="text-center mt-3">{status}</p>}
        </form>
        {/* Officers portal */}
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

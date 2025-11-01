"use client";
import { useRouter } from "next/navigation";

export default function HeadteacherNavbar({ username }) {
  const router = useRouter();

  return (
    <nav className="navbar sticky-top d-flex justify-content-between align-items-center px-2 bg-dark">
      <div className="d-flex align-items-center">
        <img
          src="/imgs/school logo.png"
          alt="BKBS Logo"
          width={40}
          height={40}
          className="mx-1"
        />
        <button
          className="btn btn-lg text-light d-lg-none"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebarOffcanvas"
          aria-controls="sidebarOffcanvas"
        >
          <i className="bi bi-list"></i>
        </button>
        <p className="mb-0 text-light ms-1">Head Teacher</p>
      </div>

      <div className="d-flex align-items-center gap-2 flex-wrap">
        <span className="fw-semibold text-light d-none d-md-block">
          {username || "Guest"}
        </span>
        <button
          className="btn-get logout-btn"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/officerslogin");
          }}
        >
          <span className="d-none d-md-inline">Logout</span>
          <i className="bi bi-box-arrow-right d-inline d-md-none"></i>
        </button>
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";

export default function LandingSection() {
  return (
    <div className="section shadow-sm mt-4 rounded-3">
      <div className="soft-card p-4 p-md-5">
        <div className="row align-items-center g-4">
          <div className="col-12 col-md-7">
            <h1 className="display-5 fw-bold mb-2">
              Welcome to Bright Kingdom British School
            </h1>

            <p className="lead mb-4">
              Building the leaders of tomorrow through excellence in education.
            </p>
            <div className="d-grid d-sm-flex gap-2">
              <Link href="" className="btn-get  btn-lg soft-shadow">
                Get started
              </Link>
              <Link
                href=""
                className="btn-get btn-lg soft-shadow"
              >
                About
              </Link>
            </div>
          </div>
          <div className="col-12 col-md-5">
            <div className="ratio ratio-1x1 rounded-4 overflow-hidden soft-shadow">
              <img
                src="/imgs/school logo.png"
                alt="Avatar"
                className="w-100 h-100 p-0 object-fit-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

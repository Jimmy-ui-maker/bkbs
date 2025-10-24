"use client";

import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <section
      id="not-found"
      className="not-found w-100 vh-100 d-flex flex-column justify-content-center align-items-center text-center"
    >
      <div className="container">
        {/* Big Emoji */}
        <div className="emoji">😵‍💫</div>

        {/* Heading */}
        <h1 className="oops-title">Oooops...!!!</h1>
        <h4 className="oops-subtitle">
          This page might be still under construction 🤯🚧🔧
        </h4>

        {/* Fun Message */}
        <p className="funny-text">
          Looks like you took a wrong turn at the Internet highway 🛣️😂 <br />
          Don’t worry, let’s get you back on track!
        </p>

        {/* Link Back */}
        <a href="/" className="btn-back-home">
          ⬅️ Take Me Home
        </a>

        {/* Extra Funny Footer */}
        <p className="mt-3 small ">
          (P.S. Our developer might be busy eating 🍕 or taking a ☕ break...)
        </p>
      </div>
    </section>
  );
}

"use client";

export default function AnnouncementCard({ author, role, time, body }) {
  return (
    <div className="announcement-card p-3 mb-4">
      {/* Header: Author + Role + Time */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <h6 className="mb-0 fw-bold">{author}</h6>
          <small className="text-muted">{role}</small>
        </div>
        <small className="text-muted">{time}</small>
      </div>

      {/* Body */}
      <p className="mb-0">{body}</p>
    </div>
  );
}

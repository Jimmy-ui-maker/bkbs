"use client";

import AnnouncementCard from "./AnnouncementCard";

export default function AnnouncementPage() {
  const announcements = [
    {
      author: "Mrs. Johnson",
      role: "Head Teacher",
      time: "Sep 14, 2025 - 10:30 AM",
      body: "The mid-term exams will begin next week. Please ensure all students are prepared.",
    },
    {
      author: "Mr. Smith",
      role: "Math Teacher",
      time: "Sep 13, 2025 - 2:00 PM",
      body: "Extra math classes will be held after school hours for Grade 6 students.",
    },
    {
      author: "School Admin",
      role: "Administrator",
      time: "Sep 12, 2025 - 9:15 AM",
      body: "Reminder: School uniforms must be worn on all school days.",
    },
  ];

  return (
    <section className="mb-5 shadow-sm mt-3 rounded-3">
      <div className="container py-5">
        <h2 className="fw-bold text-center mb-4">Announcements</h2>
        {announcements.map((item, index) => (
          <AnnouncementCard
            key={index}
            author={item.author}
            role={item.role}
            time={item.time}
            body={item.body}
          />
        ))}
      </div>
    </section>
  );
}

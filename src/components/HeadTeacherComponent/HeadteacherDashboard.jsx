"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeadteacherNavbar from "./HeadteacherNavbar";
import HeadteacherSidebar from "./HeadteacherSidebar";
import TeachersTab from "./TeachersTab";
import LearnersTab from "./LearnersTab";
import ReportsTab from "./ReportsTab";
import HeadTeacherRemarkTab from "./HeadTeacherRemarkTab";

export default function HeadteacherDashboard() {
  const [activeTab, setActiveTab] = useState("teachers");
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role === "Head Teacher") {
      setLoggedIn(true);
      setUsername(user.name);
    } else router.push("/officerslogin");
  }, [router]);

  // Fetch teachers
  useEffect(() => {
    if (activeTab === "teachers") {
      fetch("/api/headteacher/teachers")
        .then((res) => res.json())
        .then((data) => data.success && setTeachers(data.teachers))
        .catch((err) => console.error("Error fetching teachers:", err));
    }
  }, [activeTab]);

  // Fetch learners
  useEffect(() => {
    if (activeTab === "learners") {
      fetch("/api/headteacher/learners")
        .then((res) => res.json())
        .then((data) => data.success && setLearners(data.learners))
        .catch((err) => console.error("Error fetching learners:", err));
    }
  }, [activeTab]);

  const promoteLearner = async (id) => {
    if (!confirm("Promote this learner?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/headteacher/learners/${id}/promote`, {
        method: "PUT",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Learner promoted to ${data.learner.classLevel}`);
        setLearners((prev) =>
          prev.map((l) => (l._id === id ? data.learner : l))
        );
      } else {
        alert(data.error || "Promotion failed");
      }
    } catch (error) {
      console.error("Promote error:", error);
    }
    setLoading(false);
  };

  if (!loggedIn) return null;

  return (
    <div className="headteacher-dashboard">
      <HeadteacherNavbar username={username} />
      <div className="d-flex flex-column flex-lg-row">
        <HeadteacherSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="content p-3 flex-grow-1">
          {activeTab === "teachers" && <TeachersTab teachers={teachers} />}
          {activeTab === "learners" && (
            <LearnersTab
              learners={learners}
              promoteLearner={promoteLearner}
              loading={loading}
            />
          )}
          {activeTab === "reports" && <ReportsTab />}
          {activeTab === "remarks" && (
            <HeadTeacherRemarkTab username={username} />
          )}
        </main>
      </div>
    </div>
  );
}

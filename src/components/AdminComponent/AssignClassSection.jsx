"use client";
import { useState, useEffect } from "react";

export default function AdminAssignClass() {
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [editingId, setEditingId] = useState(null);

  // ✅ Fetch teachers and assignments
  const fetchData = async () => {
    try {
      // Teachers
      const resTeachers = await fetch("/api/teachers");
      const dataTeachers = await resTeachers.json();
      if (resTeachers.ok && dataTeachers.success) {
        setTeachers(dataTeachers.teachers || []);
      }

      // Assignments
      const resAssignments = await fetch("/api/adminapi/assign-class");
      const dataAssignments = await resAssignments.json();
      if (dataAssignments.success)
        setAssignments(dataAssignments.assignments || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Add or Update Assignment
  const handleSubmit = async () => {
    if (!selectedTeacher || !selectedClass)
      return alert("Please select both a teacher and a class.");

    const method = editingId ? "PUT" : "POST";
    const body = editingId
      ? { id: editingId, teacherId: selectedTeacher, classLevel: selectedClass }
      : {
          teacherId: selectedTeacher,
          classLevel: selectedClass,
          assignedBy: "Admin",
        };

    const res = await fetch("/api/adminapi/assign-class", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    alert(
      data.message || (data.success ? "Saved successfully" : "Operation failed")
    );

    if (data.success) {
      setSelectedTeacher("");
      setSelectedClass("");
      setEditingId(null);
      fetchData();
    }
  };

  // ✅ Edit existing assignment
  const handleEdit = (a) => {
    setEditingId(a._id);
    setSelectedTeacher(a.teacherId?._id || "");
    setSelectedClass(a.classLevel);
  };

  // ✅ Delete assignment
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this class assignment?"))
      return;

    const res = await fetch("/api/adminapi/assign-class", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();
    alert(
      data.message ||
        (data.success ? "Deleted successfully" : "Failed to delete")
    );
    if (data.success) fetchData();
  };

  return (
    <div className="container py-4">
      <h4 className="mb-3">🏫 Assign Class to Teachers</h4>

      <div className="row mb-3">
        {/* Select Teacher */}
        <div className="col-md-6 mb-2">
          <label className="form-label fw-semibold">Select Teacher</label>
          <select
            className="form-select login-input"
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
          >
            <option value="">-- Select Teacher --</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Select Class */}
        <div className="col-md-6 mb-2">
          <label className="form-label fw-semibold">Select Class</label>
          <select
            className="form-select login-input"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- Select Class --</option>
            <option value="Creche">Creche</option>
            <option value="Reception 1">Reception 1</option>
            <option value="Reception 2">Reception 2</option>
            <option value="Nursery 1">Nursery 1</option>
            <option value="Nursery 2">Nursery 2</option>
            <option value="Basic 1">Basic 1</option>
            <option value="Basic 2">Basic 2</option>
            <option value="Basic 3">Basic 3</option>
            <option value="Basic 4">Basic 4</option>
            <option value="Basic 5">Basic 5</option>
            <option value="Basic 6">Basic 6</option>
            <option value="JSS 1">JSS 1</option>
            <option value="JSS 2">JSS 2</option>
            <option value="JSS 3">JSS 3</option>
            <option value="SSS 1">SSS 1</option>
            <option value="SSS 2">SSS 2</option>
            <option value="SSS 3">SSS 3</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="col-12">
          <button
            className={`btn w-100 ${editingId ? "btn-warning" : "btn-primary"}`}
            onClick={handleSubmit}
          >
            {editingId ? "Update" : "Assign"}
          </button>
        </div>
      </div>

      {/* Assignments List */}
      <ul className="list-group form-card">
        {assignments.length === 0 && (
          <li className="list-group-item text-center">No class assigned yet</li>
        )}
        {assignments.map((a) => (
          <li
            key={a._id}
            className="list-group-item d-flex justify-content-between align-items-center my-1"
          >
            <span>
              <strong>{a.teacherId?.fullName}</strong> — {a.classLevel}
            </span>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleEdit(a)}
              >
                ✏️ Edit
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDelete(a._id)}
              >
                🗑️ Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

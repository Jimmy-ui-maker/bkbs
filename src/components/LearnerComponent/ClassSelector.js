"use client";
export default function ClassSelector({
  learner,
  selectedClass,
  setSelectedClass,
}) {
  // Example logic: current + past classes active, next class disabled
  const allClasses = [
    "Creche",
    "Reception 1",
    "Reception 2",
    "Nursery 1",
    "Nursery 2",
    "Basic 1",
    "Basic 2",
    "Basic 3",
    "Basic 4",
    "Basic 5",
    "Basic 6",
    "JSS 1",
    "JSS 2",
    "JSS 3",
    "SSS 1",
    "SSS 2",
    "SSS 3",
  ];
  const learnerClass = learner.classLevel;
  const learnerIndex = allClasses.indexOf(learnerClass);

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">Select Class</label>
      <select
        className="form-select login-input"
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
      >
        {allClasses.map((cls, idx) => (
          <option key={cls} disabled={idx > learnerIndex}>
            {cls}
          </option>
        ))}
      </select>
    </div>
  );
}

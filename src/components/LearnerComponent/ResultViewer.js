"use client";
export default function ResultViewer({
  learner,
  selectedClass,
  selectedSession,
}) {
  const terms = ["First Term", "Second Term", "Third Term"];

  return (
    <div className="result-section text-center">
      <h5 className="mb-3">
        Results for <span className="fw-bold">{selectedSession}</span> —{" "}
        <span className="text-primary">{selectedClass}</span>
      </h5>

      <div className="d-flex flex-wrap justify-content-center gap-3">
        {terms.map((term) => (
          <div
            key={term}
            className="term-card rounded-4 p-3 border border-warning-subtle"
            style={{ width: "250px" }}
          >
            <h6 className="fw-bold mb-2">{term}</h6>
            <div className="d-flex justify-content-center gap-2">
              <button className="btn btn-outline-success btn-sm">
                <i className="bi bi-eye"></i> View
              </button>
              <button className="btn btn-outline-primary btn-sm">
                <i className="bi bi-download"></i> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

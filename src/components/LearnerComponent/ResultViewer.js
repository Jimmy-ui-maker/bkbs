// src/components/LearnerComponent/ResultViewer.js
"use client";

import { useState } from "react";

export default function ResultViewer({
  learner,
  selectedClass,
  selectedSession,
}) {
  const [loadingTerm, setLoadingTerm] = useState(null);
  const [viewingTerm, setViewingTerm] = useState(null);
  const [termData, setTermData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const terms = ["First Term", "Second Term", "Third Term"];

  const fetchTermResult = async (term) => {
    if (!learner?._id) return alert("Learner data missing.");
    setLoadingTerm(term);

    try {
      const res = await fetch(`/api/results/${learner._id}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.results)) {
        const sessionDoc = data.results.find(
          (r) => r.session === selectedSession
        );
        if (!sessionDoc) {
          alert(`No result found for ${selectedSession}.`);
          return;
        }

        const termObj = sessionDoc.results.find((t) => t.term === term);
        if (!termObj || !termObj.subjects?.length) {
          alert(`No record yet for ${term}.`);
          return;
        }

        setTermData(termObj);
        setViewingTerm(term);
        setShowModal(true);
      } else {
        alert("No result data found.");
      }
    } catch (err) {
      console.error("Error fetching result:", err);
      alert("Failed to load result.");
    } finally {
      setLoadingTerm(null);
    }
  };

  const handleDownload = () => {
    if (!termData) return;
    window.print(); // temporary: print/download PDF
  };

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
              <button
                className="btn btn-outline-success btn-sm"
                onClick={() => fetchTermResult(term)}
                disabled={loadingTerm === term}
              >
                {loadingTerm === term ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1"></span>
                    Loading...
                  </>
                ) : (
                  <>
                    <i className="bi bi-eye"></i> View
                  </>
                )}
              </button>

              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => handleDownload(term)}
                disabled={!termData}
              >
                <i className="bi bi-download"></i> Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== Modal for Viewing Result ===== */}
      {showModal && termData && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content p-3 rounded-4">
              <div className="modal-header border-0">
                <h5 className="modal-title">
                  {learner.fullName} — {viewingTerm}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <table className="table table-bordered align-middle">
                  <thead className="table-warning">
                    <tr>
                      <th>Subject</th>
                      <th>CA1</th>
                      <th>CA2</th>
                      <th>HF</th>
                      <th>Project</th>
                      <th>Exams</th>
                      <th>Total</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {termData.subjects.map((subj) => (
                      <tr key={subj.subject}>
                        <td>{subj.subject}</td>
                        <td>{subj.CA1 ?? "-"}</td>
                        <td>{subj.CA2 ?? "-"}</td>
                        <td>{subj.HF ?? "-"}</td>
                        <td>{subj.Project ?? "-"}</td>
                        <td>{subj.Exams ?? "-"}</td>
                        <td>{subj.Total ?? "-"}</td>
                        <td>{subj.Grade ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-footer border-0">
                <button className="btn btn-primary" onClick={handleDownload}>
                  <i className="bi bi-download"></i> Download
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// src/components/LearnerComponent/ResultViewer.js
"use client";

import { useState, useRef } from "react";
import html2pdf from "html2pdf.js";

export default function ResultViewer({
  learner,
  selectedClass,
  selectedSession,
}) {
  const [loadingTerm, setLoadingTerm] = useState(null);
  const [viewingTerm, setViewingTerm] = useState(null);
  const [termData, setTermData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const pdfRef = useRef();

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
        if (!sessionDoc) return alert(`No result for ${selectedSession}`);
        const termObj = sessionDoc.results.find((t) => t.term === term);
        if (!termObj) return alert(`No record for ${term}`);
        setTermData(termObj);
        setViewingTerm(term);
        setShowModal(true);
      } else alert("No result data found.");
    } catch (err) {
      console.error(err);
      alert("Failed to fetch result.");
    } finally {
      setLoadingTerm(null);
    }
  };

  const handleDownload = () => {
    const opt = {
      margin: 0.5,
      filename: `${learner.fullName}-${viewingTerm}-result.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "A4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(pdfRef.current).save();
  };

  return (
    <div className="result-section text-center">
      <h5 className="mb-3 fw-bold text-uppercase">
        {selectedSession} Results — {selectedClass}
      </h5>

      <div className="d-flex flex-wrap justify-content-center gap-3">
        {terms.map((term) => (
          <div
            key={term}
            className="card border-warning-subtle rounded-4 p-3"
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
                  <>View</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== Modal for Report Card ===== */}
      {showModal && termData && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content p-3 rounded-4">
              <div className="modal-header border-0">
                <h5 className="fw-bold">Report Sheet — {viewingTerm}</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body" ref={pdfRef}>
                {/* ===== WATERMARK ===== */}
                <div
                  style={{
                    position: "absolute",
                    top: "40%",
                    left: "50%",
                    transform: "translate(-50%, -50%) rotate(-30deg)",
                    fontSize: "3rem",
                    color: "rgba(0,0,0,0.05)",
                    whiteSpace: "nowrap",
                    zIndex: 0,
                    pointerEvents: "none",
                  }}
                >
                  Bright Kingdom British School
                </div>

                {/* ===== HEADER ===== */}
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                  <div className="text-start">
                    <img src="/logo.png" alt="school logo" width="80" />
                    <h5 className="fw-bold mt-2">
                      Bright Kingdom British School
                    </h5>
                    <p className="small mb-0">No. 12 Royal Avenue, Kaduna</p>
                    <p className="small mb-0">Tel: +234 800 123 4567</p>
                    <p className="small mb-0">
                      Email: info@brightkingdom.edu.ng
                    </p>
                  </div>
                  <div className="text-end">
                    <img
                      src={learner.photoURL || "/passport-placeholder.jpg"}
                      alt="passport"
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "8px",
                        border: "2px solid #ccc",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>

                {/* ===== REPORT INFO ===== */}
                <div className="border rounded-3 p-2 mb-3">
                  <div className="row g-2 text-start small">
                    <div className="col-md-6">
                      <p>
                        <strong>Name:</strong> {learner.fullName}
                      </p>
                      <p>
                        <strong>Sex:</strong> {learner.gender}
                      </p>
                      <p>
                        <strong>Age:</strong> {learner.age || "—"}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p>
                        <strong>Class:</strong> {selectedClass}
                      </p>
                      <p>
                        <strong>Term:</strong> {viewingTerm}
                      </p>
                      <p>
                        <strong>Session:</strong> {selectedSession}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ===== SUBJECT TABLE ===== */}
                <table className="table table-bordered small text-center align-middle">
                  <thead className="table-warning">
                    <tr>
                      <th>Subjects</th>
                      <th>1st CA (15)</th>
                      <th>2nd CA (15)</th>
                      <th>Home Fun (5)</th>
                      <th>Project (5)</th>
                      <th>Exams (60)</th>
                      <th>Total (100)</th>
                      <th>Highest</th>
                      <th>Lowest</th>
                      <th>Grade</th>
                      <th>Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {termData.subjects.map((s, i) => (
                      <tr key={i}>
                        <td>{s.subject}</td>
                        <td>{s.CA1 ?? "-"}</td>
                        <td>{s.CA2 ?? "-"}</td>
                        <td>{s.HF ?? "-"}</td>
                        <td>{s.Project ?? "-"}</td>
                        <td>{s.Exams ?? "-"}</td>
                        <td>{s.Total ?? "-"}</td>
                        <td>{s.Highest ?? "-"}</td>
                        <td>{s.Lowest ?? "-"}</td>
                        <td>{s.Grade ?? "-"}</td>
                        <td>{s.Remark ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* ===== SUMMARY ===== */}
                <div className="row text-start small mb-3">
                  <div className="col-md-6">
                    <p>
                      <strong>Total Mark Obtainable:</strong>{" "}
                      {termData.subjects.length * 100}
                    </p>
                    <p>
                      <strong>Total Score:</strong>{" "}
                      {termData.subjects.reduce(
                        (a, b) => a + (b.Total || 0),
                        0
                      )}
                    </p>
                    <p>
                      <strong>Average Score:</strong>{" "}
                      {(
                        termData.subjects.reduce(
                          (a, b) => a + (b.Total || 0),
                          0
                        ) / termData.subjects.length
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Highest in Class:</strong> —
                    </p>
                    <p>
                      <strong>Lowest in Class:</strong> —
                    </p>
                  </div>
                </div>

                {/* ===== SKILLS & GRADES ===== */}
                <div className="row small mb-3">
                  <div className="col-md-4">
                    <h6 className="fw-bold">Psychomotor Skills</h6>
                    <table className="table table-bordered text-center">
                      <thead>
                        <tr>
                          <th>Skill</th>
                          <th>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          "Writing",
                          "Reading",
                          "Fluency",
                          "Sports",
                          "Language Skill",
                        ].map((s) => (
                          <tr key={s}>
                            <td>{s}</td>
                            <td>—</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-4">
                    <h6 className="fw-bold">Affective Ability</h6>
                    <table className="table table-bordered text-center">
                      <thead>
                        <tr>
                          <th>Trait</th>
                          <th>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          "Punctuality",
                          "Neatness",
                          "Politeness",
                          "Cooperation",
                          "Self-control",
                          "Attentiveness",
                        ].map((t) => (
                          <tr key={t}>
                            <td>{t}</td>
                            <td>—</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-4">
                    <h6 className="fw-bold">Grading Key</h6>
                    <ul className="list-unstyled small">
                      <li>A: 90–100 = Excellent</li>
                      <li>B: 70–89 = Very Good</li>
                      <li>C: 60–69 = Credit</li>
                      <li>D: 50–59 = Pass</li>
                      <li>E: 40–49 = Fair</li>
                      <li>F: 0–39 = Poor</li>
                    </ul>
                  </div>
                </div>

                {/* ===== REMARKS ===== */}
                <div className="border-top pt-2 small text-start">
                  <p>
                    <strong>Learner Conduct:</strong>{" "}
                    ____________________________
                  </p>
                  <p>
                    <strong>Class Teacher Remark:</strong>{" "}
                    ________________________
                  </p>
                </div>
              </div>

              <div className="modal-footer border-0">
                <button className="btn btn-primary" onClick={handleDownload}>
                  Download PDF
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

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
      margin: 0,
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
            className="card login-card rounded-4 p-3"
            style={{ width: "250px" }}
          >
            <h6 className="fw-bold mb-2">{term}</h6>
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
                <>View / Download</>
              )}
            </button>
          </div>
        ))}
      </div>

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

              <div className="modal-body result-sheet" ref={pdfRef}>
                <div className="result-watermark">
                  Bright Kingdom British School
                </div>

                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center  pb-2 mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src="/imgs/school logo.png"
                      alt="school logo"
                      className="school-logo"
                    />
                    <div>
                      <h5 className="fw-bold mb-1">
                        Bright Kingdom British School
                      </h5>
                      <p className="small mb-0">
                        Phase 3, Zakoyi-Bmuko, Dutse, Abuja (FCT)
                      </p>
                      <p className="small mb-0">
                        Tel: +234 703 812 2394, +234 813 772 5649
                      </p>
                      <p className="small mb-0">
                        Email: brightkingdombritishschool@gmail.com
                      </p>
                    </div>
                  </div>

                  <div className="text-end">
                    <img
                      src={learner.imgUrl}
                      alt="passport"
                      className="student-passport"
                    />
                  </div>
                </div>

                <p className="small mb-3">
                  <strong>
                    Report Sheet for {viewingTerm} {selectedSession} Academic
                    Session
                  </strong>
                </p>

                {/* STUDENT INFO */}
                <div className="border-0  rounded-3 p-2 mb-3">
                  <div className="row g-2 text-start small">
                    <div className="col-md-4">
                      <p>
                        <strong>Name:</strong> {learner.fullName}
                      </p>
                      <p>
                        <strong>Sex:</strong> {learner.gender}
                      </p>
                      <p>
                        <strong>Age:</strong>{" "}
                        {Math.floor(
                          (new Date() - new Date(learner.dob)) /
                            (365.25 * 24 * 60 * 60 * 1000)
                        )}{" "}
                      </p>
                    </div>
                    <div className="col-md-4">
                      <p>
                        <strong>Class:</strong> {selectedClass}
                      </p>
                      <p>
                        <strong>Time Present:</strong> 102
                      </p>
                      <p>
                        <strong>Number in Class:</strong> 002
                      </p>
                    </div>
                    <div className="col-md-4">
                      <p>
                        <strong>Term Opens:</strong> 20/09/2025
                      </p>
                      <p>
                        <strong>Term Ends:</strong> 20/12/2025
                      </p>
                      <p>
                        <strong>Next Term:</strong> 15/01/2026
                      </p>
                    </div>
                  </div>
                </div>

                {/* SUBJECTS */}
                <table className="table table-bordered small text-center align-middle">
                  <thead className="">
                    <tr>
                      <th>Subjects</th>
                      <th>1st CA</th>
                      <th>2nd CA</th>
                      <th>Home Fun</th>
                      <th>Project</th>
                      <th>Exams</th>
                      <th>Total</th>
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

                {/* SUMMARY */}
                <div className="row small mb-3 text-start">
                  <div className="col-md-6">
                    <p>
                      <strong>Total Obtainable:</strong>{" "}
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

                {/* SKILLS */}
                <div className="row small mb-3">
                  {/* Psychomotor Skills */}
                  <div className="col-md-6 mb-3">
                    <table className="table table-bordered text-center">
                      <thead className="">
                        <tr>
                          <th>Psychomotor Skills</th>
                          <th>A</th>
                          <th>B</th>
                          <th>C</th>
                          <th>D</th>
                          <th>E</th>
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
                            <td>—</td>
                            <td>—</td>
                            <td>—</td>
                            <td>—</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Affective Ability */}
                  <div className="col-md-6 mb-3">
                    <table className="table table-bordered text-center">
                      <thead className="">
                        <tr>
                          <th>Affective Ability</th>
                          <th>A</th>
                          <th>B</th>
                          <th>C</th>
                          <th>D</th>
                          <th>E</th>
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
                            <td>—</td>
                            <td>—</td>
                            <td>—</td>
                            <td>—</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Grading Key Split into Two Columns */}
                  <div className="col-md-12">
                    <h6 className="fw-bold mb-2 text-center">Grading Key</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <ul className="list-unstyled small">
                          <li>A: 90–100 = Excellent</li>
                          <li>B: 70–89 = Very Good</li>
                          <li>C: 60–69 = Credit</li>
                        </ul>
                      </div>
                      <div className="col-md-6">
                        <ul className="list-unstyled small">
                          <li>D: 50–59 = Pass</li>
                          <li>E: 40–49 = Fair</li>
                          <li>F: 0–39 = Poor</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* REMARKS */}
                <div className="border-top pt-2 small text-start">
                  <p>
                    <strong>Learner Conduct:</strong>{" "}
                    ____________________________
                  </p>
                  <p>
                    <strong>Class Teacher:</strong> ________________________
                  </p>
                  <p>
                    <strong>Teacher Remark:</strong> ________________________
                  </p>
                  <p>
                    <strong>Head Teacher:</strong> ________________________
                  </p>
                  <p>
                    <strong>Head Teacher Remark:</strong>{" "}
                    ________________________
                  </p>
                  <p>
                    <strong>School Stamp & Signature:</strong>{" "}
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

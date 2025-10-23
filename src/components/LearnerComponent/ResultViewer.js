// src/components/LearnerComponent/ResultViewer.js
"use client";

import { useState, useRef } from "react";

export default function ResultViewer({
  learner,
  selectedClass,
  selectedSession,
}) {
  const [loadingTerm, setLoadingTerm] = useState(null);
  const [viewingTerm, setViewingTerm] = useState(null);
  const [termData, setTermData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [skillData, setSkillData] = useState(null);
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

        // ✅ Fetch skills for that learner and term
        const skillRes = await fetch(`/api/teachers/skills/${learner._id}`);
        const skillJson = await skillRes.json();
        if (
          skillJson.success &&
          skillJson.skill &&
          skillJson.skill.term === term
        ) {
          setSkillData(skillJson.skill);
        } else {
          setSkillData(null);
        }

        setShowModal(true);
      } else alert("No result data found.");
    } catch (err) {
      console.error(err);
      alert("Failed to fetch result.");
    } finally {
      setLoadingTerm(null);
    }
  };

  const handleDownload = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
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

              <div className="modal-body " ref={pdfRef}>
                <div className="result-sheet">
                  <div className="result-watermark">
                    Bright Kingdom British School
                  </div>

                  {/* HEADER */}
                  <div className="report-header text-center mb-3 pb-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                      {/* Left: Logo */}
                      <div className="text-start">
                        <img
                          src="/imgs/school logo.png"
                          alt="school logo"
                          className="school-logo"
                        />
                      </div>

                      {/* Center: School Info */}
                      <div className="flex-grow-1">
                        <h4 className="fw-bold mb-1 text-uppercase ">
                          Bright Kingdom British School
                        </h4>
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

                      {/* Right: Passport */}
                      <div className="text-end">
                        <img
                          src={learner.imgUrl}
                          alt="passport"
                          className="student-passport"
                        />
                      </div>
                    </div>

                    <p className="small mt-2 mb-0 fw-semibold">
                      <strong>
                        Report Sheet for {viewingTerm} {selectedSession}{" "}
                        Academic Session
                      </strong>
                    </p>
                  </div>

                  {/* STUDENT INFO */}
                  <div className="border rounded-3 p-2 mb-3">
                    <div className="row g-2 text-start small">
                      <div className="col-md-4">
                        <p>
                          <strong>Name:</strong> {learner.fullName}
                        </p>
                        <p>
                          <strong>Sex:</strong> {learner.gender}
                        </p>
                        <p>
                          <strong>DOB:</strong>{" "}
                          {new Date(learner.dob).toDateString()}
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
                    <thead className="table-warning">
                      <tr>
                        <th>Subjects</th> <th>1st CA (15)</th>{" "}
                        <th>2nd CA (15)</th> <th>Home Fun (5)</th>{" "}
                        <th>Project (5)</th> <th>Exams (60)</th>{" "}
                        <th>Total (100)</th> <th>Highest</th> <th>Lowest</th>{" "}
                        <th>Grade</th> <th>Remark</th>
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
                        <thead className="table-warning">
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
                            "LanguageSkill",
                          ].map((s) => (
                            <tr key={s}>
                              <td>{s}</td>
                              {["A", "B", "C", "D", "E"].map((g) => (
                                <td key={g}>
                                  {skillData?.psychomotor?.[s] === g
                                    ? "✔️"
                                    : ""}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Affective Ability */}
                    <div className="col-md-6 mb-3">
                      <table className="table table-bordered text-center">
                        <thead className="table-warning">
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
                            "SelfControl",
                            "Attentiveness",
                          ].map((t) => (
                            <tr key={t}>
                              <td>{t}</td>
                              {["A", "B", "C", "D", "E"].map((g) => (
                                <td key={g}>
                                  {skillData?.affective?.[t] === g ? "✔️" : ""}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
                      <strong>Head Teacher Name:</strong>{" "}
                      ________________________
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

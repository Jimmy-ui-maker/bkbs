// src/components/LearnerComponent/ResultViewer.js
"use client";

import { useState, useRef, useEffect } from "react";

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
  const [termDates, setTermDates] = useState(null);
  const [highestLowest, setHighestLowest] = useState(null);
  const [teacherRemark, setTeacherRemark] = useState(null);

  const [classCount, setClassCount] = useState(0);

  const [headTeacherRemark, setHeadTeacherRemark] = useState("");
  const [headTeacherName, setHeadTeacherName] = useState("");

  // ✅ Count learner per class
  useEffect(() => {
    if (!selectedClass) return;

    const fetchClassCount = async () => {
      try {
        const res = await fetch(
          `/api/learners/count?class=${encodeURIComponent(selectedClass)}`
        );
        const data = await res.json();
        if (data.success) setClassCount(data.count);
      } catch (err) {
        console.error("Error fetching class count:", err);
      }
    };

    fetchClassCount();
  }, [selectedClass]);

  // ✅ Fetch Head Teacher Remark (corrected)
  const fetchHeadTeacherRemark = async (term) => {
    try {
      const res = await fetch(
        `/api/headteacher/remarks?learnerId=${
          learner._id
        }&class=${encodeURIComponent(
          selectedClass
        )}&session=${encodeURIComponent(
          selectedSession
        )}&term=${encodeURIComponent(term)}`
      );
      const data = await res.json();
      if (data.success && data.remarks.length > 0) {
        setHeadTeacherRemark(data.remarks[0].remark);
        setHeadTeacherName(data.remarks[0].headTeacherName);
      } else {
        setHeadTeacherRemark("");
        setHeadTeacherName("");
      }
    } catch (err) {
      console.error("Error fetching Head Teacher remark:", err);
    }
  };

  // ✅ Fetch class  summary
  useEffect(() => {
    const fetchClassSummary = async () => {
      if (!selectedClass || !selectedSession || !viewingTerm) return;

      try {
        const res = await fetch(
          `/api/results/class-summary?class=${selectedClass}&session=${selectedSession}&term=${viewingTerm}`
        );
        const data = await res.json();
        if (data.success) {
          setHighestLowest({
            highest: data.highest,
            lowest: data.lowest,
          });
        }
      } catch (err) {
        console.error("Error fetching class summary:", err);
      }
    };

    fetchClassSummary();
  }, [selectedClass, selectedSession, viewingTerm]);

  // Term date fetch
  // ✅ Fetch term dates dynamically based on term + session
  useEffect(() => {
    const fetchTermDates = async () => {
      try {
        const dateRes = await fetch("/api/adminapi/term-dates");
        const dateJson = await dateRes.json();

        console.log("📦 Raw API response:", dateJson);

        // ✅ use `dateJson.terms` instead of `termDates`
        if (dateJson.success && Array.isArray(dateJson.terms)) {
          console.log("Fetched terms:", dateJson.terms);

          const match = dateJson.terms.find(
            (t) =>
              t.session.trim().toLowerCase() ===
                selectedSession.trim().toLowerCase() &&
              t.term.trim().toLowerCase() === viewingTerm?.trim().toLowerCase()
          );

          console.log("Matched Term Record:", match);
          setTermDates(match || null);
        } else {
          console.warn("❌ Unexpected API structure:", dateJson);
        }
      } catch (err) {
        console.error("Failed to fetch term dates:", err);
      }
    };

    if (viewingTerm && selectedSession) fetchTermDates();
  }, [viewingTerm, selectedSession]);

  // ✅ Fetch term result
  const fetchTermResult = async (term) => {
    if (!learner?._id) return alert("Learner data missing.");
    setLoadingTerm(term);

    try {
      const res = await fetch(
        `/api/results/${learner._id}?session=${encodeURIComponent(
          selectedSession
        )}&term=${encodeURIComponent(term)}`
      );
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

        // ✅ Fetch attendance summary
        try {
          const attRes = await fetch(
            `/api/attendance/summary?learnerId=${learner._id}&session=${selectedSession}&term=${term}`
          );
          const attJson = await attRes.json();
          if (attJson.success) {
            setTermData((prev) => ({
              ...prev,
              timePresent: attJson.presentCount || 0,
            }));
          }
        } catch (err) {
          console.error("Attendance summary fetch failed:", err);
        }

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

        // ✅ Fetch teacher remark and conduct
        try {
          const resRemark = await fetch(
            `/api/teachers/remarks?learnerId=${
              learner._id
            }&class=${encodeURIComponent(
              selectedClass
            )}&session=${encodeURIComponent(
              selectedSession
            )}&term=${encodeURIComponent(term)}`
          );
          const dataRemark = await resRemark.json();
          if (dataRemark.success && dataRemark.remarks.length > 0) {
            setTeacherRemark(dataRemark.remarks[0]);
          } else {
            setTeacherRemark(null);
          }
        } catch (err) {
          console.error("Error fetching teacher remark:", err);
          setTeacherRemark(null);
        }
        // ✅ Fetch head teacher remark next
        await fetchHeadTeacherRemark(term);
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
            <div className="modal-content modal-color p-3 rounded-4">
              <div className="modal-header border-0">
                <h5 className="fw-bold">Report Sheet — {viewingTerm}</h5>
                <button
                  className="btn-close shadow-none"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body " ref={pdfRef}>
              <div className="result-sheet-wrapper">
                <div className="result-sheet">
                  <div className="result-watermark">
                    <img
                      src="/imgs/school logo.png"
                      alt="water mark"
                      className="school-logo"
                    />
                  </div>

                  {/* HEADER */}
                  <div className="report-header text-center mb-3 pb-3 ">
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
                    <p className="small mt-2 mb-0 fw-semibold">
                      Admission No: {learner.admissionNo}
                    </p>
                  </div>

                  {/* STUDENT INFO */}
                  <div className=" st-info border-top rounded-3 p-2 mb-3">
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
                          <strong>Time Present:</strong>{" "}
                          {termData?.timePresent !== undefined
                            ? termData.timePresent
                            : "—"}
                        </p>

                        <p>
                          <strong>Number in Class:</strong>{" "}
                          {String(classCount).padStart(3, "0")}
                        </p>
                      </div>
                      {termDates && (
                        <div className="col-md-4">
                          <p>
                            <strong>Term Opens:</strong>{" "}
                            {termDates.termOpens || "—"}
                          </p>
                          <p>
                            <strong>Term Ends:</strong>{" "}
                            {termDates.termEnds || "—"}
                          </p>
                          <p>
                            <strong>Next Term:</strong>{" "}
                            {termDates.nextTermBegins || "—"}
                          </p>
                        </div>
                      )}
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
                        <th>Position</th>
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
                          <td>{s.Position ?? "-"}</td>
                          <td>{s.Grade ?? "-"}</td>
                          <td>{s.Remark ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* === SUMMARY SECTION === */}
                  <div className="summary-section small text-start">
                    <div className="summary-row">
                      {/* Left Column */}
                      <div className="summary-col">
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
                      <div className="summary-col"></div>
                      {/* Right Column */}
                      <div className="summary-col">
                        <p>
                          <strong>Highest in Class:</strong>{" "}
                          {highestLowest?.highest
                            ? `${highestLowest.highest.total}`
                            : "—"}
                        </p>
                        <p>
                          <strong>Lowest in Class:</strong>{" "}
                          {highestLowest?.lowest
                            ? `${highestLowest.lowest.total}`
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* === SKILLS SECTION === */}
                  <div className="skills-section">
                    <div className="skills-row">
                      {/* Psychomotor Skills */}
                      <div className="skills-col">
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
                              "-",
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
                      <div className="skills-col">
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
                                    {skillData?.affective?.[t] === g
                                      ? "✔️"
                                      : ""}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* === REMARKS & FOOTER SECTION === */}
                  <div className="result-footer-section small text-start">
                    <div className="result-footer">
                      {/* === Left: Class Teacher === */}
                      <div className="footer-left">
                        <p>
                          <strong>Learner’s Conduct:</strong>{" "}
                          {teacherRemark?.conduct ||
                            "____________________________"}
                        </p>
                        <p>
                          <strong>Class Teacher’s Name:</strong>{" "}
                          {teacherRemark?.teacherName ||
                            "________________________"}
                        </p>
                        <p>
                          <strong>Teacher’s Remark:</strong>{" "}
                          {teacherRemark?.remark || "________________________"}
                        </p>
                      </div>

                      {/* === Center: Stamp & Signature === */}
                      <div className="footer-center text-center">
                        <img
                          src="/imgs/stamp2.png"
                          alt="Bright Kingdom British School Stamp"
                          className="stamp-image"
                        />
                        <img
                          src="/imgs/signature.png"
                          alt="School Head Signature"
                          className="signature-image"
                        />
                        <div className="signature-line"></div>
                      </div>

                      {/* === Right: Head Teacher === */}
                      <div className="footer-right text-start">
                        <p>
                          <strong className=" fw-bold">
                            Head Teacher’s Name:
                          </strong>{" "}
                          {headTeacherName || "________________________"}
                        </p>
                        <p>
                          <strong>Head Teacher’s Remark:</strong>{" "}
                          {headTeacherRemark || "________________________"}
                        </p>
                        <p>
                          <strong>Date:</strong>{" "}
                          {new Date().toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
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

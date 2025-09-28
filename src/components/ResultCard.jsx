"use client";
import React from "react";

export default function ResultCard({ learner, activeTerm }) {
  const selectedResult = learner.results.find((r) => r.term === activeTerm);

  if (!selectedResult) return <p>No result available for {activeTerm}</p>;

  return (
    <div className="p-4 print-area">
      {/* Header */}
      <div className="text-center mb-4">
        <img
          src="/imgs/school logo.png"
          alt="BKBS Logo"
          width={70}
          height={70}
          className="mb-2"
        />
        <h4 className="fw-bold">Bright Kingdom British School</h4>
        <p className="mb-1">Director: Dr Nathaniel Adeojo</p>
        <h6 className="fw-bold">Student Report Card</h6>
      </div>

      {/* Student Info */}
      <div className="mb-3">
        <p>
          <strong>Name:</strong> {learner.name}
        </p>
        <p>
          <strong>Admission No:</strong> {learner.admissionNo}
        </p>
        <p>
          <strong>Class:</strong> {learner.class}
        </p>
        <p>
          <strong>Term:</strong> {activeTerm}
        </p>
      </div>

      {/* Results Table */}
      <div className="table-responsive">
        <table className="table table-bordered text-center align-middle">
          <thead>
            <tr>
              <th>Subject</th>
              <th>CA1 (30)</th>
              <th>CA2 (30)</th>
              <th>Project (10)</th>
              <th>Exam (60)</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(selectedResult.scores).map(([subject, score], i) => {
              const total = score.CA1 + score.CA2 + score.Project + score.Exam;
              return (
                <tr key={i}>
                  <td className="text-start fw-semibold">{subject}</td>
                  <td>{score.CA1}</td>
                  <td>{score.CA2}</td>
                  <td>{score.Project}</td>
                  <td>{score.Exam}</td>
                  <td className="fw-bold">{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 text-end">
        <p>
          <strong>Position:</strong> {learner.position}
        </p>
        <p>
          <em>Teacher's Remark: ____________________________</em>
        </p>
        <p>
          <em>Principal's Signature: ________________________</em>
        </p>
      </div>
    </div>
  );
}

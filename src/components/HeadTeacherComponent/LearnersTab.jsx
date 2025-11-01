"use client";

export default function LearnersTab({ learners, promoteLearner, loading }) {
  return (
    <div>
      <h5 className="fw-semibold mb-3">All Learners</h5>
      <div className="table-responsive">
        <table className="table table-bordered text-center">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Admission No</th>
              <th>Class</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {learners.length > 0 ? (
              learners.map((l, i) => (
                <tr key={l._id}>
                  <td>{i + 1}</td>
                  <td>{l.fullName}</td>
                  <td>{l.admissionNo}</td>
                  <td>{l.classLevel}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      disabled={loading}
                      onClick={() => promoteLearner(l._id)}
                    >
                      Promote
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No learners found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

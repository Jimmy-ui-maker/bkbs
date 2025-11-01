"use client";

export default function TeachersTab({ teachers }) {
  return (
    <div>
      <h5 className="fw-semibold mb-3">All Teachers</h5>
      <div className="table-responsive">
        <table className="table table-bordered text-center">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Subject / Specialization</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length > 0 ? (
              teachers.map((t, i) => (
                <tr key={t._id}>
                  <td>{i + 1}</td>
                  <td>{t.fullName}</td>
                  <td>{t.email}</td>
                  <td>{t.specialization}</td>
                  <td>{t.phone}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No teachers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

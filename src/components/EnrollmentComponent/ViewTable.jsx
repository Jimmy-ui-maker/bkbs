"use client";

export default function ViewTable() {
  const learners = [
    {
      id: 1,
      name: "John Doe",
      class: "Basic 2",
      gender: "Male",
      parent: "Mr. Doe",
      phone: "08012345678",
    },
    {
      id: 2,
      name: "Mary Johnson",
      class: "Basic 1",
      gender: "Female",
      parent: "Mrs. Johnson",
      phone: "08087654321",
    },
  ];

  const teachers = [
    {
      id: 1,
      name: "Mr. Smith",
      subject: "Mathematics",
      qualification: "B.Ed",
      experience: "5-7 years",
      phone: "08123456789",
    },
    {
      id: 2,
      name: "Ms. Grace",
      subject: "English",
      qualification: "M.Ed",
      experience: "8-10 years",
      phone: "08198765432",
    },
  ];

  return (
    <div className="container enForm d-flex justify-content-center align-items-center min-vh-100">
      <div className="login-card shadow-lg my-4 p-md-5 p-4 rounded w-100">
        <h4 className="text-center titleColor font-monospace fw-bold text-uppercase mb-4">
          Enrolment Records
        </h4>

        {/* Learners Table */}
        <p className="fw-bold titleColor">Learners</p>
        <div className="table-scroll mb-4">
          <table className="table table-bordered table-striped custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Class</th>
                <th>Gender</th>
                <th>Parent</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {learners.map((learner) => (
                <tr key={learner.id}>
                  <td>{learner.id}</td>
                  <td>{learner.name}</td>
                  <td>{learner.class}</td>
                  <td>{learner.gender}</td>
                  <td>{learner.parent}</td>
                  <td>{learner.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Teachers Table */}
        <p className="fw-bold titleColor">Teachers</p>
        <div className="table-scroll">
          <table className="table table-bordered table-striped custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Subject</th>
                <th>Qualification</th>
                <th>Experience</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td>{teacher.id}</td>
                  <td>{teacher.name}</td>
                  <td>{teacher.subject}</td>
                  <td>{teacher.qualification}</td>
                  <td>{teacher.experience}</td>
                  <td>{teacher.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../services/api";
import Navbar from "../components/Navbar";
import Message from "../components/Message";

const EmployeeDetails = () => {
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState("");

  const { id } = useParams();

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        const data = await apiRequest(`/api/employees/${id}`);
        setEmployee(data);
      } catch (err) {
        setError(err.message);
      }
    };

    loadEmployee();
  }, [id]);

  if (error) {
    return (
      <>
        <Navbar />
        <main className="container">
          <Message error={error} />
        </main>
      </>
    );
  }

  if (!employee) {
    return (
      <>
        <Navbar />
        <main className="container">
          <p className="loading">Loading employee...</p>
        </main>
      </>
    );
  }

  const details = [
    ["Email", employee.email],
    ["Phone", employee.phone],
    ["Department", employee.department],
    ["Position", employee.position],
    ["Salary", `₹${Number(employee.salary).toLocaleString("en-IN")}`],
    [
      "Joining Date",
      new Date(employee.joiningDate).toLocaleDateString(),
    ],
  ];

  return (
    <>
      <Navbar />

      <main className="container">
        <div className="page-heading">
          <div>
            <h1>{employee.name}</h1>
            <p>Employee details</p>
          </div>

          <Link className="button" to={`/employees/${id}/edit`}>
            Edit Employee
          </Link>
        </div>

        <div className="details panel">
          {details.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        <Link className="back-link" to="/employees">
          Back to Employees
        </Link>
      </main>
    </>
  );
};

export default EmployeeDetails;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";
import Navbar from "../components/Navbar";
import Message from "../components/Message";

const departments = [
  "Development",
  "HR",
  "Testing",
  "Management",
  "Sales",
];

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await apiRequest("/api/employees");
        setEmployees(data);
      } catch (err) {
        setError(err.message);
      }
    };

    loadEmployees();
  }, []);

  const countDepartment = (department) => {
    return employees.filter(
      (employee) => employee.department === department
    ).length;
  };

  return (
    <>
      <Navbar />

      <main className="container">
        <div className="page-heading">
          <div>
            <h1>Dashboard</h1>
            <p>Overview of your team.</p>
          </div>

          <Link className="button" to="/employees/add">
            Add Employee
          </Link>
        </div>

        <Message error={error} />

        <div className="cards">
          <div className="card">
            <span>Total Employees</span>
            <strong>{employees.length}</strong>
          </div>

          {departments.map((department) => (
            <div className="card" key={department}>
              <span>{department}</span>
              <strong>{countDepartment(department)}</strong>
            </div>
          ))}
        </div>

        <section className="panel">
          <h2>Recent Employees</h2>

          {employees.length ? (
            employees.slice(0, 5).map((employee) => (
              <div className="recent" key={employee._id}>
                <div>
                  <strong>{employee.name}</strong>
                  <span>{employee.position}</span>
                </div>

                <span className="badge">
                  {employee.department}
                </span>
              </div>
            ))
          ) : (
            <p>No employees added yet.</p>
          )}
        </section>
      </main>
    </>
  );
};

export default Dashboard;

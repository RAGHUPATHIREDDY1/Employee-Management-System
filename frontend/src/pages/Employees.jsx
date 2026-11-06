
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";
import Navbar from "../components/Navbar";
import Message from "../components/Message";
import EmployeeTable from "../components/EmployeeTable";

const departments = [
  "Development",
  "HR",
  "Testing",
  "Management",
  "Sales",
];

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const loadEmployees = async () => {
    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams();

      if (search) query.set("search", search);
      if (department) query.set("department", department);

      const data = await apiRequest(`/api/employees?${query}`);
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEmployees();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, department]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;

    try {
      const data = await apiRequest(
        `/api/employees/${id}`,
        "DELETE"
      );

      setSuccess(data.message || "Employee deleted successfully");
      loadEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Navbar />

      <main className="container">
        <div className="page-heading">
          <div>
            <h1>Employees</h1>
            <p>Search, view and manage employee records.</p>
          </div>

          <Link className="button" to="/employees/add">
            Add Employee
          </Link>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder="Search by employee name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">All Departments</option>

            {departments.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <Message error={error} success={success} />

        <div className="table-wrap">
          {loading ? (
            <p className="loading">Loading employees...</p>
          ) : employees.length === 0 ? (
            <p className="loading">No employees found.</p>
          ) : (
            <EmployeeTable
              employees={employees}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>
    </>
  );
};

export default Employees;

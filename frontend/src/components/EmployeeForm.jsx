
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../services/api";
import Message from "./Message";

const departments = [
  "Development",
  "HR",
  "Testing",
  "Management",
  "Sales",
];

const emptyEmployee = {
  name: "",
  email: "",
  phone: "",
  department: "Development",
  position: "",
  salary: "",
  joiningDate: "",
};

const EmployeeForm = ({ editing = false }) => {
  const [form, setForm] = useState(emptyEmployee);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!editing) return;

    const loadEmployee = async () => {
      try {
        const employee = await apiRequest(`/api/employees/${id}`);

        setForm({
          ...employee,
          joiningDate: employee.joiningDate.slice(0, 10),
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEmployee();
  }, [editing, id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const url = editing
        ? `/api/employees/${id}`
        : "/api/employees";

      const method = editing ? "PUT" : "POST";

      await apiRequest(url, method, form);

      navigate("/employees");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="loading">Loading employee...</p>;
  }

  return (
    <form className="employee-form panel" onSubmit={handleSubmit}>
      <Message error={error} />

      <label>
        Name
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Email
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Phone
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Department
        <select
          name="department"
          value={form.department}
          onChange={handleChange}
        >
          {departments.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
      </label>

      <label>
        Position
        <input
          type="text"
          name="position"
          value={form.position}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Salary
        <input
          type="number"
          name="salary"
          value={form.salary}
          onChange={handleChange}
          min="0"
          required
        />
      </label>

      <label>
        Joining Date
        <input
          type="date"
          name="joiningDate"
          value={form.joiningDate}
          onChange={handleChange}
          required
        />
      </label>

      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving
            ? "Saving..."
            : editing
            ? "Update Employee"
            : "Add Employee"}
        </button>

        <button
          type="button"
          className="secondary"
          onClick={() => navigate("/employees")}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;

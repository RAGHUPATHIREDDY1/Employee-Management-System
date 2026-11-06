
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

const EmployeeSearch = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter employee name");
      return;
    }

    setError("");

    try {
      const employee = await apiRequest(
        `/api/employees/name/${encodeURIComponent(name.trim())}`
      );

      navigate(`/employees/${employee._id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="panel">
      <h2>Search Employee</h2>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter employee name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button type="submit">
          Search
        </button>
      </form>

      {error && <p className="message error">{error}</p>}
    </div>
  );
};

export default EmployeeSearch;


import { Link } from "react-router-dom";

const EmployeeTable = ({ employees, onDelete }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Department</th>
          <th>Position</th>
          <th>Salary</th>
          <th>Joining Date</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {employees.map((employee) => (
          <tr key={employee._id}>
            <td>{employee.name}</td>
            <td>{employee.email}</td>
            <td>{employee.phone}</td>

            <td>
              <span className="badge">
                {employee.department}
              </span>
            </td>

            <td>{employee.position}</td>

            <td>
              ₹{Number(employee.salary).toLocaleString("en-IN")}
            </td>

            <td>
              {new Date(employee.joiningDate).toLocaleDateString()}
            </td>

            <td className="actions">
              <Link to={`/employees/${employee._id}`}>
                View
              </Link>

              <Link to={`/employees/${employee._id}/edit`}>
                Edit
              </Link>

              <button
                className="danger-link"
                onClick={() => onDelete(employee._id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default EmployeeTable;


import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link className="brand" to="/dashboard">
        Employee Management System
      </Link>

      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/employees">Employees</Link>
        <Link to="/employees/add">Add Employee</Link>

        <button className="link-button" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

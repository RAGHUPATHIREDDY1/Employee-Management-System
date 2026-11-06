import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import EmployeeForm from "../components/EmployeeForm";

const EditEmployee = () => {
  return (
    <>
      <Navbar />

      <main className="container">
        <div className="page-heading">
          <div>
            <h1>Edit Employee</h1>
            <p>Update employee information.</p>
          </div>

          <Link className="back-link" to="/employees">
            Back to Employees
          </Link>
        </div>

        <EmployeeForm editing />
      </main>
    </>
  );
};

export default EditEmployee;


import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import EmployeeForm from "../components/EmployeeForm";

const AddEmployee = () => {
  return (
    <>
      <Navbar />

      <main className="container">
        <div className="page-heading">
          <div>
            <h1>Add Employee</h1>
            <p>Add a new member to your team.</p>
          </div>

          <Link className="back-link" to="/employees">
            Back to Employees
          </Link>
        </div>

        <EmployeeForm />
      </main>
    </>
  );
};

export default AddEmployee;

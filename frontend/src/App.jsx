
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import VerifyResetOtp from "./pages/VerifyResetOtp";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import AddEmployee from "./pages/AddEmployee";
import EditEmployee from "./pages/EditEmployee";
import EmployeeDetails from "./pages/EmployeeDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import EmployeeSearch from "./components/EmployeeSearch";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />

      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <Employees />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/add"
        element={
          <ProtectedRoute>
            <AddEmployee />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/:id"
        element={
          <ProtectedRoute>
            <EmployeeDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/name/:name"
        element={
          <ProtectedRoute>
            <EmployeeSearch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/:id/edit"
        element={
          <ProtectedRoute>
            <EditEmployee />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;

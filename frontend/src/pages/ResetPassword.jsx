import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import Message from "../components/Message";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const resetToken = location.state?.resetToken || sessionStorage.getItem("resetToken");

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!resetToken) {
      setError("Your reset session is missing or expired. Please request a new OTP.");
      return;
    }

    if (!form.newPassword || !form.confirmPassword) {
      setError("Please fill in both password fields");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest(
        "/api/auth/reset-password",
        "POST",
        {
          resetToken,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        },
        false
      );

      setSuccess(data.message || "Password reset successful");
      sessionStorage.removeItem("resetToken");
      sessionStorage.removeItem("resetEmail");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Reset Password</h1>
        <p>Enter your new password below.</p>

        <Message error={error} success={success} />

        <label>
          New Password
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            minLength={6}
            required
          />
        </label>

        <label>
          Confirm Password
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            minLength={6}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : "Reset Password"}
        </button>

        <p className="form-footer">
          <Link to="/login">Back to Login</Link>
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;

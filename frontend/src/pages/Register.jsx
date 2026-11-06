
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import Message from "../components/Message";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  
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

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest(
        "/api/auth/register",
        "POST",
        {
          name: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        },
        false
      );

      setSuccess(data.message || "Verification OTP sent. Please check your email.");
      sessionStorage.setItem("verificationEmail", data.email || form.email.trim());
      sessionStorage.setItem("verificationExpiresAt", data.expiresAt);
      sessionStorage.setItem("verificationResendAt", data.resendAvailableAt);
      navigate("/verify-email", {
        state: {
          email: data.email || form.email.trim(),
          expiresAt: data.expiresAt,
          resendAvailableAt: data.resendAvailableAt,
        },
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create Account</h1>
        <p>Start managing employees simply.</p>

        <Message error={error} success={success} />

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
          Password
          <input
            type="password"
            name="password"
            value={form.password}
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
          {loading ? "Please wait..." : "Register"}
        </button>

        <p className="form-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;

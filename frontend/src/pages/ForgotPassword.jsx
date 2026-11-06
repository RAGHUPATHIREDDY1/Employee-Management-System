import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import Message from "../components/Message";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest(
        "/api/auth/forgot-password",
        "POST",
        { email },
        false
      );

      setSuccess(data.message || "Password reset email sent. Please check your inbox.");
      sessionStorage.setItem("resetEmail", email.trim().toLowerCase());
      sessionStorage.setItem("resetRequestedAt", String(Date.now()));
      navigate("/verify-reset-otp", {
        state: { email: email.trim().toLowerCase(), requestedAt: Date.now() },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Forgot Password</h1>
        <p>Enter your email to receive a password reset OTP.</p>

        <Message error={error} success={success} />

        <label>
          Email
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : "Send Reset OTP"}
        </button>

        <p className="form-footer">
          <Link to="/login">Back to Login</Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;

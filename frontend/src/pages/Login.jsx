
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import Message from "../components/Message";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

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
    setUnverifiedEmail("");
    setLoading(true);

    try {
      const data = await apiRequest(
        "/api/auth/login",
        "POST",
        form,
        false
      );

      localStorage.setItem("token", data.token);

      navigate("/dashboard");
    } catch (err) {
      if (err.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(form.email.trim());
        setError(err.message);
      } else if (err.code === "OTP_COOLDOWN") {
        sessionStorage.setItem("verificationEmail", form.email.trim());
        sessionStorage.setItem("verificationExpiresAt", err.data.expiresAt || "");
        sessionStorage.setItem("verificationResendAt", err.data.resendAvailableAt || "");
        navigate("/verify-email", {
          state: { email: form.email.trim(), ...err.data },
        });
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResending(true);
    try {
      const data = await apiRequest(
        "/api/auth/resend-verification-otp",
        "POST",
        { email: unverifiedEmail },
        false
      );
      sessionStorage.setItem("verificationEmail", unverifiedEmail);
      sessionStorage.setItem("verificationExpiresAt", data.expiresAt);
      sessionStorage.setItem("verificationResendAt", data.resendAvailableAt);
      navigate("/verify-email", { state: { email: unverifiedEmail, ...data } });
    } catch (err) {
      if (err.code === "OTP_COOLDOWN") {
        sessionStorage.setItem("verificationEmail", unverifiedEmail);
        sessionStorage.setItem("verificationExpiresAt", err.data.expiresAt || "");
        sessionStorage.setItem("verificationResendAt", err.data.resendAvailableAt || "");
        navigate("/verify-email", {
          state: { email: unverifiedEmail, ...err.data },
        });
      } else {
        setError(err.message);
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Welcome Back</h1>
        <p>Log in to manage your employees.</p>

        <Message error={error} />

        {unverifiedEmail && (
          <button type="button" className="secondary" onClick={handleResend} disabled={resending}>
            {resending ? "Please wait..." : "Resend verification OTP"}
          </button>
        )}

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

        <div style={{ marginBottom: "12px" }}>
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : "Login"}
        </button>

        <p className="form-footer">
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import Message from "../components/Message";

const formatTime = (seconds) => {
  const minutes = Math.floor(Math.max(seconds, 0) / 60);
  const remainingSeconds = Math.max(seconds, 0) % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || sessionStorage.getItem("verificationEmail") || "";
  const expiresAt = location.state?.expiresAt || sessionStorage.getItem("verificationExpiresAt");
  const resendAvailableAt = location.state?.resendAvailableAt || sessionStorage.getItem("verificationResendAt");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const secondsRemaining = expiresAt ? Math.ceil((Date.parse(expiresAt) - now) / 1000) : 0;
  const resendSeconds = resendAvailableAt
    ? Math.ceil((Date.parse(resendAvailableAt) - now) / 1000)
    : 0;

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must be 6 digits.");
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest("/api/auth/verify-email", "POST", { email, otp }, false);
      setSuccess(data.message || "Email verification successful.");
      sessionStorage.removeItem("verificationEmail");
      sessionStorage.removeItem("verificationExpiresAt");
      sessionStorage.removeItem("verificationResendAt");
      window.setTimeout(() => navigate("/login"), 900);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setResending(true);
    try {
      const data = await apiRequest(
        "/api/auth/resend-verification-otp",
        "POST",
        { email },
        false
      );
      sessionStorage.setItem("verificationExpiresAt", data.expiresAt);
      sessionStorage.setItem("verificationResendAt", data.resendAvailableAt);
      navigate("/verify-email", { replace: true, state: { email, ...data } });
      setSuccess(data.message);
      setNow(Date.now());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleVerify}>
        <h1>Verify Your Email</h1>
        <p>Enter the 6-digit code sent to {email || "your email"}.</p>
        <Message error={error} success={success} />

        {!email ? (
          <p className="form-footer">Verification details are missing. <Link to="/register">Register again</Link></p>
        ) : (
          <>
            <label>
              Email
              <input type="email" value={email} readOnly />
            </label>
            <label>
              6-digit OTP
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                required
              />
            </label>
            <p>OTP expires in {formatTime(secondsRemaining)}.</p>
            <button type="submit" disabled={loading || Boolean(success)}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={handleResend}
              disabled={resending || resendSeconds > 0}
            >
              {resending
                ? "Sending..."
                : resendSeconds > 0
                  ? `Resend OTP in ${formatTime(resendSeconds)}`
                  : "Resend OTP"}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default VerifyEmail;
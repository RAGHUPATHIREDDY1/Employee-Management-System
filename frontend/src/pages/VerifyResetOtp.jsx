import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import Message from "../components/Message";

const formatTime = (seconds) => {
  const minutes = Math.floor(Math.max(seconds, 0) / 60);
  const remainingSeconds = Math.max(seconds, 0) % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const VerifyResetOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || sessionStorage.getItem("resetEmail") || "";
  const requestedAt = Number(
    location.state?.requestedAt || sessionStorage.getItem("resetRequestedAt") || 0
  );
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

  const secondsRemaining = requestedAt
    ? Math.ceil((requestedAt + 5 * 60 * 1000 - now) / 1000)
    : 0;
  const resendSeconds = requestedAt
    ? Math.ceil((requestedAt + 60 * 1000 - now) / 1000)
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
      const data = await apiRequest("/api/auth/verify-reset-otp", "POST", { email, otp }, false);
      sessionStorage.setItem("resetToken", data.resetToken);
      setSuccess("OTP verified. Continue to choose a new password.");
      navigate("/reset-password", { state: { resetToken: data.resetToken } });
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
      const data = await apiRequest("/api/auth/resend-reset-otp", "POST", { email }, false);
      const nextRequestAt = Date.now();
      sessionStorage.setItem("resetRequestedAt", String(nextRequestAt));
      setSuccess(data.message);
      setNow(nextRequestAt);
      navigate("/verify-reset-otp", {
        replace: true,
        state: { email, requestedAt: nextRequestAt },
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleVerify}>
        <h1>Verify Reset OTP</h1>
        <p>Enter the 6-digit password reset code sent to {email || "your email"}.</p>
        <Message error={error} success={success} />

        {!email ? (
          <p className="form-footer">Reset details are missing. <Link to="/forgot-password">Request another OTP</Link></p>
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
            <button type="submit" disabled={loading}>
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

export default VerifyResetOtp;
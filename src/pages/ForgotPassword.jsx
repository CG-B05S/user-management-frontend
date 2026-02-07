import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load reCAPTCHA v3 script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${import.meta.env.VITE_RECAPTCHA_SITE_KEY}`;
    document.head.appendChild(script);
  }, []);

  const validateEmail = (value) => {
    if (!value) {
      setEmailError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(value)) {
      setEmailError("Enter valid email");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      validateEmail(value);
    } else {
      setEmailError("");
    }
  };

  const isFormValid = email && !emailError;

  const handleSendOTP = async () => {
    setError("");
    setSuccess("");

    if (!validateEmail(email)) {
      return;
    }

    try {
      setLoading(true);

      // Get reCAPTCHA v3 token
      let recaptchaToken = "";
      if (window.grecaptcha && import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
        recaptchaToken = await window.grecaptcha.execute(
          import.meta.env.VITE_RECAPTCHA_SITE_KEY,
          { action: "forgot_password" }
        );
      }

      await API.post("/auth/forgot-password", {
        email,
        recaptchaToken
      });
      setSuccess("OTP sent to your email");
      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Forgot Password</h2>
          <p className="text-sm text-slate-600">
            Enter your email address and we'll send you an OTP to reset your password.
          </p>

          {error && (
            <div className="alert alert-error shadow-md">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success shadow-md">
              <span>{success}</span>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Email Address <span className="text-red-500">*</span></span>
            </label>
            <input
              type="email"
              className={`input input-bordered w-full ${emailError ? "input-error" : ""}`}
              placeholder="Enter your email address"
              value={email}
              onChange={handleEmailChange}
              disabled={loading}
            />
            {emailError && (
              <label className="label">
                <span className="label-text-alt text-error">✗ {emailError}</span>
              </label>
            )}
          </div>

          <button
            className="btn btn-primary mt-4 w-full"
            onClick={handleSendOTP}
            disabled={!isFormValid || loading}
          >
            {loading ? "Sending..." : "Send OTP"}
            {loading && <span className="loading loading-spinner loading-sm"></span>}
          </button>

          <div className="divider text-xs">OR</div>

          <p className="text-sm text-center">
            Remember your password?{" "}
            <Link to="/login" className="link link-primary">
              Login
            </Link>
          </p>

          <p className="text-sm text-center">
            Don't have an account?{" "}
            <Link to="/register" className="link link-primary">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

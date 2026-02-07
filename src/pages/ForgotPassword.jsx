import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load reCAPTCHA v3 script
  useEffect(() => {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    if (!siteKey) return;

    const scriptId = "recaptcha-v3-script";
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      document.head.appendChild(script);
    }

    document.querySelectorAll(".grecaptcha-badge").forEach((badge) => {
      badge.style.visibility = "visible";
      badge.style.opacity = "1";
    });

    return () => {
      document.querySelectorAll(".grecaptcha-badge").forEach((badge) => badge.remove());
      script?.remove();
    };
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

      const normalizedEmail = email.trim().toLowerCase();
      await API.post("/auth/forgot-password", {
        email: normalizedEmail,
        recaptchaToken
      });

      navigate("/reset-password", { state: { email: normalizedEmail } });
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
            Enter your email address and we&apos;ll send you an OTP to reset your password.
          </p>

          {error && (
            <div className="alert alert-error shadow-md">
              <span>{error}</span>
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
                <span className="label-text-alt text-error">x {emailError}</span>
              </label>
            )}
          </div>

          <button
            className="btn btn-primary mt-4 w-full"
            onClick={handleSendOTP}
            disabled={!isFormValid || loading}
          >
            {loading ? "Sending..." : "Continue"}
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
            Don&apos;t have an account?{" "}
            <Link to="/register" className="link link-primary">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

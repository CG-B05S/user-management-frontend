import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { validatePassword } from "../utils/passwordValidator";
import PasswordRequirements from "../components/PasswordRequirements";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [fieldErrors, setFieldErrors] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const state = location.state?.email;
    if (state) {
      setEmail(state);
    }

    // Load reCAPTCHA v3 script
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${import.meta.env.VITE_RECAPTCHA_SITE_KEY}`;
    document.head.appendChild(script);
  }, [location.state]);

  const validateField = (name, value) => {
    let fieldError = "";

    if (name === "otp") {
      if (!value) fieldError = "OTP is required";
      else if (!/^\d{6}$/.test(value.trim())) fieldError = "OTP must be 6 digits";
    }

    if (name === "confirmPassword") {
      if (!value) fieldError = "Confirm password is required";
      else if (form.newPassword && value !== form.newPassword) fieldError = "Passwords do not match";
    }

    setFieldErrors(prev => ({ ...prev, [name]: fieldError }));
    return !fieldError;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (value) {
      validateField(name, value);
    } else {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const isFormValid =
    email &&
    form.otp &&
    form.newPassword &&
    form.confirmPassword &&
    !fieldErrors.otp &&
    !fieldErrors.newPassword &&
    !fieldErrors.confirmPassword &&
    form.newPassword === form.confirmPassword;

  const handleReset = async () => {
    setError("");
    setSuccess("");

    // Validate all fields
    const otpValid = validateField("otp", form.otp);
    const passwordValid = validateField("newPassword", form.newPassword);
    const confirmValid = validateField("confirmPassword", form.confirmPassword);

    if (!otpValid || !passwordValid || !confirmValid) {
      return;
    }

    try {
      setLoading(true);

      // Get reCAPTCHA v3 token
      let recaptchaToken = "";
      if (window.grecaptcha && import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
        recaptchaToken = await window.grecaptcha.execute(
          import.meta.env.VITE_RECAPTCHA_SITE_KEY,
          { action: "reset_password" }
        );
      }

      await API.post("/auth/reset-password", {
        email,
        otp: form.otp,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
        recaptchaToken
      });
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Reset Password</h2>
          <p className="text-sm text-slate-600">
            Enter the OTP from your email and set a new password.
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
              <span className="label-text font-semibold">Email</span>
            </label>
            <input
              type="email"
              className="input input-bordered w-full bg-slate-50"
              value={email}
              disabled={true}
              placeholder="Your email"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">OTP <span className="text-red-500">*</span></span>
              <span className="label-text-alt text-slate-500">6 digits</span>
            </label>
            <input
              type="text"
              className={`input input-bordered w-full ${fieldErrors.otp ? "input-error" : ""}`}
              name="otp"
              value={form.otp}
              onChange={handleChange}
              disabled={loading}
              placeholder="Enter 6-digit OTP from email"
              maxLength="6"
              inputMode="numeric"
            />
            {fieldErrors.otp && (
              <label className="label">
                <span className="label-text-alt text-error">✗ {fieldErrors.otp}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">New Password <span className="text-red-500">*</span></span>
            </label>
            <input
              type="password"
              className={`input input-bordered w-full ${fieldErrors.newPassword ? "input-error" : ""}`}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              disabled={loading}
              placeholder="Minimum 8 characters"
            />
            {fieldErrors.newPassword && (
              <label className="label">
                <span className="label-text-alt text-error">✗ {fieldErrors.newPassword}</span>
              </label>
            )}
            {form.newPassword && !fieldErrors.newPassword && (
              <PasswordRequirements password={form.newPassword} />
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Confirm Password <span className="text-red-500">*</span></span>
            </label>
            <input
              type="password"
              className={`input input-bordered w-full ${fieldErrors.confirmPassword ? "input-error" : ""}`}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              placeholder="Re-enter password"
            />
            {fieldErrors.confirmPassword && (
              <label className="label">
                <span className="label-text-alt text-error">✗ {fieldErrors.confirmPassword}</span>
              </label>
            )}
          </div>

          <button
            className="btn btn-primary w-full mt-4"
            onClick={handleReset}
            disabled={!isFormValid || loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
            {loading && <span className="loading loading-spinner loading-sm"></span>}
          </button>

          <p className="text-sm text-center mt-4">
            <Link to="/login" className="link link-primary">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { validatePassword } from "../utils/passwordValidator";
import PasswordRequirements from "../components/PasswordRequirements";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const validate = (name, value) => {
    let error = "";

    if (name === "name") {
      if (!value) error = "Name is required";
    }

    if (name === "email") {
      if (!value) error = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(value))
        error = "Enter valid email";
    }

    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm(prev => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  const isFormValid =
    form.name &&
    form.email &&
    form.password &&
    !errors.name &&
    !errors.email &&
    !errors.password;

  const handleRegister = async () => {
    setApiError("");
    setLoading(true);

    try {
      // Get reCAPTCHA v3 token
      let recaptchaToken = "";
      if (window.grecaptcha && import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
        recaptchaToken = await window.grecaptcha.execute(
          import.meta.env.VITE_RECAPTCHA_SITE_KEY,
          { action: "register" }
        );
      }

      await API.post("/auth/register", {
        ...form,
        email: form.email.trim().toLowerCase(),
        recaptchaToken
      });
      navigate("/verify-otp", { state: { email: form.email.trim().toLowerCase() } });
    } catch (err) {
      setApiError(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">

          <h2 className="card-title">Register</h2>

          {apiError && (
            <div className="alert alert-error shadow-md">
              <span>{apiError}</span>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Name <span className="text-red-500">*</span></span>
            </label>
            <input
              name="name"
              className={`input input-bordered w-full ${errors.name ? "input-error" : ""}`}
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.name && (
              <label className="label">
                <span className="label-text-alt text-error">✗ {errors.name}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Email <span className="text-red-500">*</span></span>
            </label>
            <input
              name="email"
              className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`}
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.email && (
              <label className="label">
                <span className="label-text-alt text-error">✗ {errors.email}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Password <span className="text-red-500">*</span></span>
            </label>
            <input
              type="password"
              name="password"
              className={`input input-bordered w-full ${errors.password ? "input-error" : ""}`}
              placeholder="Enter a strong password"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.password && (
              <label className="label">
                <span className="label-text-alt text-error">✗ {errors.password}</span>
              </label>
            )}
            {form.password && !errors.password && (
              <PasswordRequirements password={form.password} />
            )}
          </div>

          <button
            className="btn btn-primary mt-4"
            disabled={!isFormValid || loading}
            onClick={handleRegister}
          >
            {loading ? "Registering..." : "Register"}
            {loading && <span className="loading loading-spinner loading-sm"></span>}
          </button>

          <p className="text-sm text-center mt-3">
            Already have an account?{" "}
            <Link to="/" className="link link-primary">
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

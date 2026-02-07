import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = (name, value) => {
    let error = "";

    if (name === "email") {
      if (!value) error = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(value))
        error = "Enter valid email";
    }

    if (name === "password") {
      if (!value) error = "Password is required";
      else if (value.length < 6)
        error = "Minimum 6 characters required";
    }

    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm(prev => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  const isFormValid =
    form.email &&
    form.password &&
    !errors.email &&
    !errors.password;

  const handleLogin = async () => {
    setApiError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", form);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard", { state: { loggedIn: true } });
      } else {
        setApiError("Login failed: No token received");
      }
    } catch (err) {
      setApiError(err.response?.data?.message || "Login failed");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">

          <h2 className="card-title">Login</h2>

          {apiError && (
            <div className="alert alert-error">{apiError}</div>
          )}

          <div>
            <input
              name="email"
              className="input input-bordered w-full"
              placeholder="Email"
              onChange={handleChange}
            />
            {errors.email && (
              <p className="text-error text-sm mt-1">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              name="password"
              className="input input-bordered w-full"
              placeholder="Password"
              onChange={handleChange}
            />
            {errors.password && (
              <p className="text-error text-sm mt-1">
                {errors.password}
              </p>
            )}
          </div>

          <button
            className="btn btn-primary mt-4"
            disabled={!isFormValid || loading}
            onClick={handleLogin}
          >
            {loading ? "Logging in..." : "Login"}
            {loading && <span className="loading loading-spinner loading-sm"></span>}
          </button>

          <p className="text-sm text-center mt-3">
            <Link to="/forgot-password" className="link link-primary">
              Forgotten Password?
            </Link>
          </p>

          <p className="text-sm text-center mt-3">
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

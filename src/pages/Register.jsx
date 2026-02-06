import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const validate = (name, value) => {
    let error = "";

    if (name === "name") {
      if (!value) error = "Name is required";
    }

    if (name === "email") {
      if (!value) error = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(value))
        error = "Invalid email format";
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
    form.name &&
    form.email &&
    form.password &&
    !errors.name &&
    !errors.email &&
    !errors.password;

  const handleRegister = async () => {
    setApiError("");

    try {
      await API.post("/auth/register", form);
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      setApiError(err.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">

          <h2 className="card-title">Register</h2>

          {apiError && (
            <div className="alert alert-error">{apiError}</div>
          )}

          <input
            name="name"
            className="input input-bordered"
            placeholder="Name"
            onChange={handleChange}
          />
          {errors.name && (
            <p className="text-error text-sm">{errors.name}</p>
          )}

          <input
            name="email"
            className="input input-bordered"
            placeholder="Email"
            onChange={handleChange}
          />
          {errors.email && (
            <p className="text-error text-sm">{errors.email}</p>
          )}

          <input
            type="password"
            name="password"
            className="input input-bordered"
            placeholder="Password"
            onChange={handleChange}
          />
          {errors.password && (
            <p className="text-error text-sm">{errors.password}</p>
          )}

          <button
            className="btn btn-primary mt-4"
            disabled={!isFormValid}
            onClick={handleRegister}
          >
            Register
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

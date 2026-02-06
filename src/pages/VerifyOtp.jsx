import { useEffect, useState } from "react";
import API from "../services/api";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(5);

  useEffect(() => {
    const timer =
      cooldown > 0 &&
      setInterval(() => setCooldown((prev) => prev - 1), 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const verifyOtp = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/verify-otp", {
        email,
        otp
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");

    } catch (err) {
      setAttemptsLeft((prev) => prev - 1);
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    await API.post("/auth/register", { email });
    setCooldown(60);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Verify OTP</h2>

          <p className="text-sm opacity-70">
            OTP sent to {email}
          </p>

          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          <input
            className="input input-bordered text-center tracking-widest text-lg"
            placeholder="Enter OTP"
            maxLength={6}
            value={otp}
            onChange={(e)=>setOtp(e.target.value)}
          />

          <button
            className={`btn btn-primary mt-3 ${loading ? "loading":""}`}
            onClick={verifyOtp}
          >
            Verify OTP
          </button>

          <button
            className="btn btn-link mt-2"
            disabled={cooldown > 0}
            onClick={resendOtp}
          >
            {cooldown > 0
              ? `Resend OTP in ${cooldown}s`
              : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}

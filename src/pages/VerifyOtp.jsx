import { useEffect, useState } from "react";
import API from "../services/api";
import { useLocation, useNavigate } from "react-router-dom";
import OtpInput from "../components/OtpInput";

const OTP_LENGTH = 6;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  /* ---------------------------
     Redirect if email missing
  ----------------------------*/
  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  /* ---------------------------
     Cooldown timer
  ----------------------------*/
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  /* ---------------------------
     Auto submit when OTP complete
  ----------------------------*/
  useEffect(() => {
    if (otp.join("").length === OTP_LENGTH && !loading) {
      verifyOtp();
    }
  }, [otp]);

  /* ---------------------------
     Verify OTP API
  ----------------------------*/
  const verifyOtp = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.post("/auth/verify-otp", {
        email,
        otp: otp.join("")
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");

    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 to-base-300 px-4">
      <div className="w-full max-w-md bg-base-100 shadow-2xl rounded-2xl p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold">
            Verify Your Email
          </h2>

          {/* Compact inline message */}
          <p className="text-sm text-base-content/70 mt-2">
            Enter the 6-digit code sent to{" "}
            <span className="font-medium text-base-content">
              {email}
            </span>
            <button
              onClick={() => navigate("/register")}
              className="ml-2 text-primary hover:underline"
            >
              Change
            </button>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error mb-4">
            {error}
          </div>
        )}

        {/* OTP Inputs */}
        <OtpInput
          value={otp}
          onChange={setOtp}
          disabled={loading}
        />

        {/* Verify Button */}
        <button
          className="btn btn-primary w-full mt-6"
          disabled={loading}
          onClick={verifyOtp}
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            "Verify"
          )}
        </button>

        {/* Resend Section */}
        <div className="text-center text-sm mt-5 text-base-content/70">
          Didn’t receive OTP?{" "}
          <button
            className={`cursor-pointer font-medium ${
              cooldown > 0 || resendLoading
                ? "text-base-content/40 cursor-not-allowed"
                : "text-primary hover:underline"
            }`}
            disabled={cooldown > 0 || resendLoading}
            onClick={async () => {
              try {
                setResendLoading(true);
                setError("");
                await API.post("/auth/resend-verification-otp", { email });
                setCooldown(60);
              } catch (err) {
                setError(err.response?.data?.message || "Failed to resend OTP");
              } finally {
                setResendLoading(false);
              }
            }}
          >
            {cooldown > 0
              ? `Resend in ${cooldown}s`
              : resendLoading
              ? "Sending..."
              : "Request again"}
          </button>
        </div>

      </div>
    </div>
  );
}

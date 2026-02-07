import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import { useLocation, useNavigate } from "react-router-dom";

const OTP_LENGTH = 6;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(5);

  const inputRefs = useRef([]);

  /* ---------------------------
     Auto focus first input
  ----------------------------*/
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

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
    const otpValue = otp.join("");

    if (
      otpValue.length === OTP_LENGTH &&
      !loading
    ) {
      verifyOtp();
    }
  }, [otp]);

  /* ---------------------------
     Verify OTP API
  ----------------------------*/
  const verifyOtp = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== OTP_LENGTH) return;

    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/verify-otp", {
        email,
        otp: otpValue
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

  /* ---------------------------
     Handle input change
  ----------------------------*/
  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // move forward
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /* ---------------------------
     Handle backspace
  ----------------------------*/
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /* ---------------------------
     Handle paste full OTP
  ----------------------------*/
  const handlePaste = (e) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pastedData) return;

    const newOtp = pastedData.split("");
    while (newOtp.length < OTP_LENGTH) {
      newOtp.push("");
    }

    setOtp(newOtp);

    const lastIndex = Math.min(
      pastedData.length - 1,
      OTP_LENGTH - 1
    );

    inputRefs.current[lastIndex]?.focus();
  };

  const isOtpComplete = otp.join("").length === OTP_LENGTH;

  return (
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 to-base-300 px-4">
  <div className="w-full max-w-md bg-base-100 shadow-2xl rounded-2xl p-8">

    {/* Header */}
    <div className="text-center mb-6">
      <h2 className="text-2xl font-semibold text-base-content">
        Check Your Email
      </h2>
      <p className="text-sm text-base-content/70 mt-2 leading-relaxed">
        In the next moment you should receive an email with a
        6-digit OTP. Please enter it below to verify your account.
      </p>
    </div>

    {/* Error */}
    {error && (
      <div className="alert alert-error mb-4">
        {error}
      </div>
    )}

    {/* OTP Inputs */}
    <div className="flex justify-center gap-3 mb-6">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={loading}
          className="
            w-12 h-14
            text-center text-lg font-medium
            border border-base-300
            rounded-xl
            focus:outline-none
            focus:ring-2 focus:ring-primary
            focus:border-primary
            transition-all duration-150
          "
        />
      ))}
    </div>

    {/* Verify Button */}
    <button
      className={`btn w-full rounded-xl ${
        loading || !isOtpComplete
          ? "btn-disabled"
          : "btn-primary"
      }`}
      onClick={verifyOtp}
      disabled={!isOtpComplete || loading}
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
        className={`font-medium ${
          cooldown > 0
            ? "text-base-content/40 cursor-not-allowed"
            : "text-primary hover:underline"
        }`}
        disabled={cooldown > 0}
        onClick={async () => {
          await API.post("/auth/register", { email });
          setCooldown(60);
        }}
      >
        {cooldown > 0
          ? `Resend in ${cooldown}s`
          : "Request again"}
      </button>
    </div>

  </div>
</div>

  );
}

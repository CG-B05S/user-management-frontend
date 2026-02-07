import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import { Link, useLocation, useNavigate } from "react-router-dom";
import OtpInput from "../components/OtpInput";
import { validatePassword } from "../utils/passwordValidator";
import PasswordRequirements from "../components/PasswordRequirements";

const OTP_LENGTH = 6;

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [step, setStep] = useState("otp");
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0 || step !== "otp") return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown, step]);

  const passwordValidation = useMemo(() => validatePassword(newPassword), [newPassword]);
  const otpValue = otp.join("");

  const handleContinueFromOtp = () => {
    if (otpValue.length !== OTP_LENGTH) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setError("");
    setStep("password");
  };

  const handleResendOtp = async () => {
    try {
      setResendLoading(true);
      setError("");

      await API.post("/auth/forgot-password", { email });
      setCooldown(60);
      setOtp(new Array(OTP_LENGTH).fill(""));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!passwordValidation.isValid) {
      setError("Please enter a strong password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await API.post("/auth/reset-password", {
        email,
        otp: otpValue,
        newPassword,
        confirmPassword
      });

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
      if ((err.response?.data?.message || "").toLowerCase().includes("otp")) {
        setStep("otp");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="w-full max-w-md bg-base-100 shadow-xl rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-center">Reset Password</h2>

        {error && <div className="alert alert-error mt-4">{error}</div>}

        {step === "otp" && (
          <>
            <p className="text-sm text-center mt-2 text-base-content/70">
              Enter the OTP sent to <span className="font-medium">{email}</span>
            </p>

            <div className="mt-6">
              <OtpInput value={otp} onChange={setOtp} disabled={loading || resendLoading} />
            </div>

            <button
              className="btn btn-primary w-full mt-6"
              onClick={handleContinueFromOtp}
              disabled={otpValue.length !== OTP_LENGTH || loading || resendLoading}
            >
              Continue
            </button>

            <div className="text-center text-sm mt-4 text-base-content/70">
              Didn&apos;t receive OTP?{" "}
              <button
                type="button"
                className={`font-medium ${
                  cooldown > 0 || resendLoading ? "text-base-content/40 cursor-not-allowed" : "text-primary hover:underline"
                }`}
                disabled={cooldown > 0 || resendLoading}
                onClick={handleResendOtp}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : resendLoading ? "Sending..." : "Resend OTP"}
              </button>
            </div>
          </>
        )}

        {step === "password" && (
          <>
            <p className="text-sm text-center mt-2 text-base-content/70">Set your new password</p>

            <input
              type="password"
              className="input input-bordered w-full mt-6"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />

            {newPassword && <PasswordRequirements password={newPassword} />}

            <input
              type="password"
              className="input input-bordered w-full mt-3"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />

            <button
              className="btn btn-primary w-full mt-3"
              onClick={handleResetPassword}
              disabled={loading || !passwordValidation.isValid || !confirmPassword || newPassword !== confirmPassword}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        <p className="text-sm text-center mt-6">
          Back to{" "}
          <Link to="/login" className="link link-primary">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

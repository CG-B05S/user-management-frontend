import { useEffect, useRef } from "react";

const OTP_LENGTH = 6;

export default function OtpInput({
  value,
  onChange,
  disabled = false
}) {
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (val, index) => {
    if (!/^[0-9]?$/.test(val)) return;

    const newOtp = [...value];
    newOtp[index] = val;
    onChange(newOtp);

    if (val && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    const newOtp = pasted.split("");
    while (newOtp.length < OTP_LENGTH) newOtp.push("");

    onChange(newOtp);
  };

  return (
    <div className="flex justify-center gap-3">
      {value.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) =>
            handleChange(e.target.value, index)
          }
          onKeyDown={(e) =>
            handleKeyDown(e, index)
          }
          onPaste={handlePaste}
          className="
            w-12 h-14 text-center text-lg font-medium
            border border-base-300 rounded-xl
            focus:ring-2 focus:ring-primary
            focus:border-primary
          "
        />
      ))}
    </div>
  );
}

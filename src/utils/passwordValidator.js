// Password validation utility
export const validatePassword = (password) => {
  const requirements = {
    minLength: password.length >= 8,
    hasCapital: /[A-Z]/.test(password),
    hasSmall: /[a-z]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  return {
    isValid: Object.values(requirements).every(req => req),
    requirements
  };
};

export const getPasswordRequirements = () => [
  { key: "minLength", label: "At least 8 characters", icon: "🔤" },
  { key: "hasCapital", label: "1 Capital letter (A-Z)", icon: "🔤" },
  { key: "hasSmall", label: "1 Small letter (a-z)", icon: "🔡" },
  { key: "hasSpecial", label: "1 Special character (!@#$%...)", icon: "!@#" }
];

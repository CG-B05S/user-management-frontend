import { validatePassword, getPasswordRequirements } from "../utils/passwordValidator";

const PasswordRequirements = ({ password }) => {
  const { requirements } = validatePassword(password);
  const requirementsList = getPasswordRequirements();

  return (
    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
      <div className="text-xs font-semibold text-slate-600 mb-2">Password Requirements:</div>
      <div className="space-y-1">
        {requirementsList.map((req) => (
          <div
            key={req.key}
            className={`flex items-center text-xs gap-2 ${
              requirements[req.key] ? "text-green-600" : "text-slate-500"
            }`}
          >
            <span className="text-base">
              {requirements[req.key] ? "✓" : "○"}
            </span>
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordRequirements;

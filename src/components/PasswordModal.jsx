import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { validatePassword } from "../utils/passwordValidator";
import PasswordRequirements from "./PasswordRequirements";

export default function PasswordModal({ onClose, onSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async () => {
    try {
      setError("");
      setSuccess("");

      // Validation
      if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
        setError("All fields are required");
        return;
      }

      if (form.currentPassword === form.newPassword) {
        setError("New password must be different from current password");
        return;
      }

      if (form.newPassword !== form.confirmPassword) {
        setError("New passwords do not match");
        return;
      }

      const { isValid } = validatePassword(form.newPassword);
      if (!isValid) {
        setError("New password doesn't meet requirements");
        return;
      }

      setLoading(true);

      await API.put("/auth/update-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });

      setSuccess("Password updated successfully! Logging out...");
      setTimeout(() => {
        // Clear token from localStorage
        localStorage.removeItem("token");
        // Navigate to login page
        navigate("/");
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Update failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-6">Update Password</h3>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-4">
            <span>{success}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text font-semibold">Current Password</span>
            </label>
            <input
              type="password"
              name="currentPassword"
              className="input input-bordered w-full"
              value={form.currentPassword}
              onChange={handleChange}
              disabled={loading}
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold">New Password</span>
            </label>
            <input
              type="password"
              name="newPassword"
              className="input input-bordered w-full"
              value={form.newPassword}
              onChange={handleChange}
              disabled={loading}
              placeholder="Enter new password"
            />
            {form.newPassword && (
              <PasswordRequirements password={form.newPassword} />
            )}
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold">Confirm New Password</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              className="input input-bordered w-full"
              value={form.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              placeholder="Re-enter new password"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="modal-action mt-6">
          <button className="btn" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
            {loading && <span className="loading loading-spinner loading-sm"></span>}
          </button>
        </div>
      </div>
    </div>
  );
}

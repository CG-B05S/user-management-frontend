import { useState, useEffect } from "react";
import API from "../services/api";

export default function UserFormModal({
  close,
  onSuccess,
  editUser
}) {
  const [form, setForm] = useState({
    companyName: "",
    contactNumber: "",
    address: "",
    status: "",
    followUpDateTime: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEdit = !!editUser;

  useEffect(() => {
    if (editUser) {
      setForm({
        companyName: editUser.companyName || "",
        contactNumber: editUser.contactNumber || "",
        address: editUser.address || "",
        status: editUser.status || "",
        followUpDateTime: editUser.followUpDateTime
          ? editUser.followUpDateTime.slice(0, 16)
          : ""
      });
    }
    setError("");
  }, [editUser]);

  const handleSave = async () => {
    try {
      setError("");
      setLoading(true);

      if (isEdit) {
        await API.put(`/users/${editUser._id}`, form);
      } else {
        await API.post("/users", form);
      }

      onSuccess();
      close();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Save failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">

        <h3 className="font-bold text-2xl mb-6 text-slate-800">
          {isEdit ? "✏️ Edit User" : "Add New User"}
        </h3>

        {error && (
          <div className="alert alert-error mb-5 shadow-md">
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-slate-700">Company Name</span>
            </label>
            <input
              className="input input-bordered w-full focus:input-primary focus:outline-none"
              placeholder="Enter company name"
              value={form.companyName}
              onChange={(e) =>
                setForm({ ...form, companyName: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-slate-700">Contact Number</span>
            </label>
            <input
              className="input input-bordered w-full focus:input-primary focus:outline-none"
              placeholder="Enter phone number"
              value={form.contactNumber}
              onChange={(e) =>
                setForm({ ...form, contactNumber: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-slate-700">Address</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full focus:textarea-primary focus:outline-none"
              placeholder="Enter address"
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
              disabled={loading}
              rows="3"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-slate-700">Status</span>
            </label>
            <select
              className="select select-bordered w-full focus:select-primary focus:outline-none"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
              disabled={loading}
            >
              <option value="">Select Status</option>
              <option value="received">Received</option>
              <option value="not_received">Not Received</option>
              <option value="switch_off">Switch Off</option>
              <option value="callback">Callback</option>
              <option value="required">Required</option>
              <option value="not_required">Not Required</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-slate-700">Follow Up Date & Time</span>
            </label>
            <input
              type="datetime-local"
              className="input input-bordered w-full focus:input-primary focus:outline-none"
              value={form.followUpDateTime}
              onChange={(e) =>
                setForm({
                  ...form,
                  followUpDateTime: e.target.value
                })
              }
              disabled={loading}
            />
          </div>
        </div>

        <div className="modal-action mt-8">
          <button className="btn btn-outline" onClick={close} disabled={loading}>
            Cancel
          </button>

          <button
            className={`btn btn-primary gap-2 ${loading ? "loading" : ""}`}
            onClick={handleSave}
            disabled={loading}
          >
            {isEdit ? "Update" : "Save"}
          </button>
        </div>

      </div>
    </div>
  );
}

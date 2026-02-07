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
      <div className="modal-box">

        <h3 className="font-bold text-lg mb-4">
          {isEdit ? "Edit User" : "Add User"}
        </h3>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <input
          className="input input-bordered w-full mb-2"
          placeholder="Company Name"
          value={form.companyName}
          onChange={(e) =>
            setForm({ ...form, companyName: e.target.value })
          }
          disabled={loading}
        />

        <input
          className="input input-bordered w-full mb-2"
          placeholder="Contact Number"
          value={form.contactNumber}
          onChange={(e) =>
            setForm({ ...form, contactNumber: e.target.value })
          }
          disabled={loading}
        />

        <textarea
          className="textarea textarea-bordered w-full mb-2"
          placeholder="Address"
          value={form.address}
          onChange={(e) =>
            setForm({ ...form, address: e.target.value })
          }
          disabled={loading}
        />

        <select
          className="select select-bordered w-full mb-2"
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
        </select>


        <input
          type="datetime-local"
          className="input input-bordered w-full"
          value={form.followUpDateTime}
          onChange={(e) =>
            setForm({
              ...form,
              followUpDateTime: e.target.value
            })
          }
          disabled={loading}
        />

        <div className="modal-action">
          <button className="btn" onClick={close} disabled={loading}>
            Cancel
          </button>

          <button
            className={`btn btn-primary ${loading ? "loading" : ""}`}
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

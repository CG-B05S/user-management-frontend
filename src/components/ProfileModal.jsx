import { useState, useRef } from "react";
import API from "../services/api";

export default function ProfileModal({ user, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || ""
  });
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Compress image before converting to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        // Create an image element to compress
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Resize if image is too large
          if (width > 500) {
            const ratio = height / width;
            width = 500;
            height = width * ratio;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.7 quality
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          setProfilePhoto(compressedBase64);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setError("");
      setLoading(true);

      const res = await API.put("/auth/update-profile", {
        name: form.name,
        profilePhoto: profilePhoto
      });

      onSuccess(res.data.user);
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
        <h3 className="font-bold text-lg mb-6">User Profile</h3>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {/* Profile Photo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center font-bold text-3xl mb-4">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              form.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "U"
            )}
          </div>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            📷 Change Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text font-semibold">Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={loading}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold">Email</span>
            </label>
            <input
              type="email"
              className="input input-bordered w-full"
              value={form.email}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="modal-action mt-6">
          <button className="btn" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className={`btn btn-primary ${loading ? "loading" : ""}`}
            onClick={handleSave}
            disabled={loading}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import API from "../services/api";

export default function BulkUploadModal({ close, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Select file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      await API.post("/users/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      onSuccess();
      close();

    } catch {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">

        <h3 className="font-bold text-lg mb-4">
          Bulk Upload Users
        </h3>

        <input
          type="file"
          accept=".xlsx"
          className="file-input file-input-bordered w-full"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <div className="modal-action">
          <button className="btn" onClick={close}>
            Cancel
          </button>

          <button
            className={`btn btn-primary ${loading ? "loading":""}`}
            onClick={handleUpload}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}

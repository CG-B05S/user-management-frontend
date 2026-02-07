import { useState } from "react";
import * as XLSX from "xlsx";
import API from "../services/api";

export default function BulkUploadModal({ close, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Select file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await API.post(
        "/users/bulk-upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
      
      // store backend response
      setResult(res.data);

      // refresh table after upload
      onSuccess();

    } catch (err) {
      console.error("❌ Upload error:", err);
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const downloadFailedRows = () => {
    if (!result?.failedRows || result.failedRows.length === 0) return;

    // Prepare data for Excel with row number and reason
    const excelData = result.failedRows.map((failedRow) => ({
      "Row #": failedRow.rowNumber,
      "Reason": failedRow.reason,
      "COMPANY  NAME": failedRow.data["COMPANY  NAME"],
      "Contact No": failedRow.data["Contact No"],
      "Address": failedRow.data["Address"],
      "Status": failedRow.data["Status"],
      "Follow Up Date Time": failedRow.data["Follow Up Date Time"]
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    worksheet["!cols"] = [
      { wch: 8 },  // Row #
      { wch: 30 }, // Reason
      { wch: 25 }, // Company Name
      { wch: 15 }, // Contact No
      { wch: 25 }, // Address
      { wch: 15 }, // Status
      { wch: 25 }  // Follow Up Date Time
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Failed Rows");
    
    // Download
    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `failed-rows-${timestamp}.xlsx`);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">

        <h3 className="font-bold text-lg mb-4">
          Bulk Upload Users
        </h3>

        {/* FILE INPUT */}
        <input
          type="file"
          accept=".xlsx"
          className="file-input file-input-bordered w-full"
          onChange={(e) => setFile(e.target.files[0])}
          disabled={loading || result}
        />

        {/* RESULT SECTION */}
        {result && (
          <div className="mt-5 p-4 bg-base-200 rounded-lg">

            <p className="text-success font-semibold">
              ✅ {result.successCount} users uploaded successfully
            </p>

            {result.failedCount > 0 && (
              <>
                <p className="text-error font-semibold mt-3">
                  ❌ {result.failedCount} rows failed
                </p>

                <div className="max-h-40 overflow-auto mt-2 border rounded">
                  {result.failedRows.map((row, index) => (
                    <div
                      key={index}
                      className="text-sm px-2 py-1 border-b"
                    >
                      Row {row.rowNumber} — {row.reason}
                    </div>
                  ))}
                </div>

                <button
                  className="btn btn-sm btn-outline mt-3 w-full"
                  onClick={downloadFailedRows}
                >
                  📥 Download Failed Rows as Excel
                </button>
              </>
            )}
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="modal-action">

          <button className="btn" onClick={close}>
            Close
          </button>

          {!result && (
            <button
              className={`btn btn-primary ${
                loading ? "loading" : ""
              }`}
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          )}

        </div>

      </div>
    </div>
  );
}

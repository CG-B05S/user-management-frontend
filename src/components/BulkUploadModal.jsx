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
      "Follow Up Date Time": failedRow.data["Follow Up Date Time"],
      "Notes": failedRow.data["Notes"] || failedRow.data["Note"]
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
      { wch: 25 }, // Follow Up Date Time
      { wch: 35 }  // Notes
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Failed Rows");
    
    // Download
    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `failed-rows-${timestamp}.xlsx`);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-xl">

        <h3 className="font-bold text-xl mb-4 text-slate-800">
          📥 Bulk Upload Users
        </h3>

        {/* FILE INPUT */}
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text font-semibold text-slate-700">Select Excel File</span>
            <span className="label-text-alt text-slate-500">(.xlsx only)</span>
          </label>
          <input
            type="file"
            accept=".xlsx"
            className="file-input file-input-bordered w-full focus:file-input-primary"
            onChange={(e) => setFile(e.target.files[0])}
            disabled={loading || result}
          />
        </div>

        {/* RESULT SECTION */}
        {result && (
          <div className="mt-6 p-6 bg-slate-50 rounded-lg border-2 border-slate-200">

            <p className="text-success font-bold text-lg mb-4">
              ✅ {result.successCount} users uploaded successfully
            </p>

            {result.failedCount > 0 && (
              <>
                <p className="text-error font-bold text-lg mb-3">
                  ❌ {result.failedCount} rows failed
                </p>

                <div className="max-h-48 overflow-auto mb-4 border-2 border-red-200 rounded-lg bg-red-50">
                  {result.failedRows.map((row, index) => (
                    <div
                      key={index}
                      className="text-sm px-4 py-2 border-b border-red-100 hover:bg-red-100 transition-colors"
                    >
                      <span className="font-semibold text-red-600">Row {row.rowNumber}:</span> {row.reason}
                    </div>
                  ))}
                </div>

                <button
                  className="btn btn-sm btn-outline w-full"
                  onClick={downloadFailedRows}
                >
                  📥 Download Failed Rows as Excel
                </button>
              </>
            )}
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="modal-action mt-8">

          <button className="btn btn-outline" onClick={close} disabled={loading}>
            Close
          </button>

          {!result && (
            <button
              className={`btn btn-primary gap-2 ${
                loading ? "loading" : ""
              }`}
              onClick={handleUpload}
              disabled={loading || !file}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          )}

        </div>

      </div>
    </div>
  );
}

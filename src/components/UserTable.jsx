import { useEffect, useState } from "react";
import API from "../services/api";
import Toast from "./Toast";

export default function UserTable({ refresh, search, statusFilter, onEdit }) {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [toast, setToast] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [deleteUserId, setDeleteUserId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 2500);
    };

    const fetchUsers = async () => {
        const res = await API.get(
            `/users?page=${page}&search=${search}&status=${statusFilter}`
        );
        setUsers(res.data.users);
        setTotalPages(res.data.pages);
    };

    const deleteUser = async (id) => {
        try {
            await API.delete(`/users/${id}`);
            fetchUsers();
            showToast("User deleted successfully");
        } catch {
            showToast("Delete failed");
        }
    };

    const confirmDelete = async () => {
        try {
            await API.delete(`/users/${deleteUserId}`);
            fetchUsers();
            showToast("User deleted successfully");
        } catch {
            showToast("Delete failed");
        } finally {
            setShowDeleteModal(false);
            setDeleteUserId(null);
        }
    };


    const updateStatus = async (id, status) => {
        try {
            await API.put(`/users/${id}`, { status });
            fetchUsers();
            showToast("Status updated");
        } catch {
            showToast("Update failed");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, refresh, search, statusFilter]);

    const statusColor = (status) => {
        switch (status) {
            case "received":
                return "select-success border-green-500 focus:border-green-600";
            case "not_received":
                return "select-warning border-yellow-500 focus:border-yellow-600";
            case "switch_off":
                return "select-error border-red-500 focus:border-red-600";
            case "callback":
                return "select-info border-blue-500 focus:border-blue-600";
            case "required":
                return "select-success border-green-500 focus:border-green-600";
            case "not_required":
                return "select-error border-red-500 focus:border-red-600";
            default:
                return "";
        }
    };

    const getRowColor = (status) => {
        switch (status) {
            case "required":
                return "bg-green-200 hover:bg-green-300";
            case "not_required":
                return "bg-red-200 hover:bg-red-300";
            default:
                return "";
        }
    };

    return (
        <div>
            <Toast message={toast} />

            {/* TABLE */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="table table-sm w-full">
                    <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white sticky top-0">
                        <tr>
                            <th className="font-bold text-white">S.No</th>
                            <th className="font-bold text-white">Company Name</th>
                            <th className="font-bold text-white">Contact Number</th>
                            <th className="font-bold text-white">Address</th>
                            <th className="font-bold text-white">Status</th>
                            <th className="font-bold text-white">Follow Up Date</th>
                            <th className="font-bold text-white text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-16">
                                    <div className="flex flex-col items-center gap-3">
                                        <span className="text-xl font-semibold text-slate-600">
                                            📭 No users found
                                        </span>
                                        <span className="text-sm text-slate-500">
                                            Try adjusting search or filters
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            users.map((u, index) => (
                                <tr key={u._id} className={`${getRowColor(u.status)} transition-colors duration-200 font-medium hover:shadow-md`}>
                                    <td className="font-semibold text-slate-700 py-2 text-sm">{index + 1}</td>
                                    <td className="font-semibold text-slate-800 py-2 text-sm">{u.companyName}</td>
                                    <td className="text-slate-700 py-2 text-sm">{u.contactNumber || "N/A"}</td>
                                    <td className="text-slate-600 py-2 text-sm">{u.address || "N/A"}</td>

                                    <td className="py-2">
                                        <select
                                            className={`select select-xs select-bordered font-semibold text-sm ${statusColor(
                                                u.status
                                            )}`}
                                            value={u.status}
                                            onChange={(e) =>
                                                updateStatus(u._id, e.target.value)
                                            }
                                        >
                                            <option value="Select Status" disabled>Select Status</option>
                                            <option value="received">Received</option>
                                            <option value="not_received">Not Received</option>
                                            <option value="switch_off">Switch Off</option>
                                            <option value="callback">Callback</option>
                                            <option value="required">Required</option>
                                            <option value="not_required">Not Required</option>
                                        </select>
                                    </td>

                                    <td className="text-slate-700 py-2 text-sm">
                                        {u.followUpDateTime
                                            ? new Date(
                                                u.followUpDateTime
                                            ).toLocaleString("en-US", { 
                                                year: 'numeric', 
                                                month: 'short', 
                                                day: 'numeric', 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })
                                            : "—"}
                                    </td>

                                    <td className="flex gap-1 justify-center py-2">
                                        <button
                                            className="btn btn-xs btn-accent gap-1 hover:bg-purple-700 text-white font-semibold"
                                            onClick={() => onEdit(u)}
                                            title="Edit user"
                                        >
                                            ✏️ Edit
                                        </button>

                                        <button
                                            className="btn btn-xs btn-error gap-1 hover:bg-red-700 text-white font-semibold"
                                            onClick={() => {
                                                setDeleteUserId(u._id);
                                                setShowDeleteModal(true);
                                            }}
                                            title="Delete user"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* PAGINATION */}
                {totalPages > 0 && (
                <div className="flex justify-end items-center py-4 px-4 bg-slate-50">
                    <div className="join">
                        <button
                            className="join-item btn btn-sm"
                            disabled={page === 1}
                            onClick={() =>
                                setPage((p) => Math.max(1, p - 1))
                            }
                        >
                            Prev
                        </button>

                        <button className="join-item btn btn-sm">
                            {page} / {totalPages}
                        </button>

                        <button
                            className="join-item btn btn-sm"
                            disabled={page === totalPages}
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                        >
                            Next
                        </button>
                    </div>
                </div>
                )}

            </div>
            {showDeleteModal && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">
                            Delete User
                        </h3>

                        <p className="py-4">
                            Are you sure you want to delete this user?
                            This action cannot be undone.
                        </p>

                        <div className="modal-action">
                            <button
                                className="btn"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="btn btn-error"
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

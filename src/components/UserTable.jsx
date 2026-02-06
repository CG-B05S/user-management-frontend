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
                return "select-success";
            case "not_received":
                return "select-warning";
            case "switch_off":
                return "select-error";
            case "callback":
                return "select-info";
            default:
                return "";
        }
    };

    return (
        <div>
            <Toast message={toast} />

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="table table-zebra">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Company</th>
                            <th>Contact</th>
                            <th>Address</th>
                            <th>Status</th>
                            <th>Follow Up</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-10">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-lg font-medium">
                                            No users found
                                        </span>
                                        <span className="text-sm opacity-70">
                                            Try adjusting search or filters
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            users.map((u, index) => (
                                <tr key={u._id}>
                                    <td>{index + 1}</td>
                                    <td>{u.companyName}</td>
                                    <td>{u.contactNumber}</td>
                                    <td>{u.address}</td>

                                    <td>
                                        <select
                                            className={`select select-bordered select-sm ${statusColor(
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
                                        </select>
                                    </td>

                                    <td>
                                        {u.followUpDateTime
                                            ? new Date(
                                                u.followUpDateTime
                                            ).toLocaleString()
                                            : "-"}
                                    </td>

                                    <td>
                                        <button
                                            className="btn btn-xs btn-outline"
                                            onClick={() => onEdit(u)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="btn btn-xs btn-error ml-2"
                                            onClick={() => {
                                                setDeleteUserId(u._id);
                                                setShowDeleteModal(true);
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* PAGINATION */}
                <div className="flex justify-end mt-4">
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

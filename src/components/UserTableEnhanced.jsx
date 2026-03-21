import { useEffect, useState } from "react";
import API from "../services/api";
import Toast from "./Toast";

export default function UserTableEnhanced({
    refresh,
    search,
    statusFilter,
    followUpFilter,
    followUpStateFilter,
    customFollowUpStart,
    customFollowUpEnd,
    onEdit
}) {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [toast, setToast] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 2500);
    };

    const toIsoDateTime = (value) => {
        if (!value) return "";
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
    };

    const fetchUsers = async () => {
        const normalizedCustomFollowUpStart =
            followUpFilter === "custom" ? toIsoDateTime(customFollowUpStart) : "";
        const normalizedCustomFollowUpEnd =
            followUpFilter === "custom" ? toIsoDateTime(customFollowUpEnd) : "";

        if (
            followUpFilter === "custom" &&
            (
                !normalizedCustomFollowUpStart ||
                !normalizedCustomFollowUpEnd ||
                new Date(normalizedCustomFollowUpStart) > new Date(normalizedCustomFollowUpEnd)
            )
        ) {
            setUsers([]);
            setTotalPages(1);
            return;
        }

        const res = await API.get("/users", {
            params: {
                page,
                search,
                status: statusFilter,
                followUp: followUpFilter,
                followUpState: followUpStateFilter,
                customFollowUpStart: normalizedCustomFollowUpStart,
                customFollowUpEnd: normalizedCustomFollowUpEnd
            }
        });
        setUsers(res.data.users);
        setTotalPages(Math.max(res.data.pages || 1, 1));

        if ((res.data.pages || 0) > 0 && page > res.data.pages) {
            setPage(1);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget?._id) return;

        try {
            await API.delete(`/users/${deleteTarget._id}`);
            fetchUsers();
            showToast("User deleted successfully");
        } catch {
            showToast("Delete failed");
        } finally {
            setShowDeleteModal(false);
            setDeleteTarget(null);
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

    const markFollowUpDone = async (user) => {
        try {
            await API.put(`/users/${user._id}`, {
                followUpStatus: "done",
                followUpCompletedAt: new Date().toISOString()
            });
            fetchUsers();
            showToast("Follow-up marked done");
        } catch {
            showToast("Follow-up update failed");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, refresh, search, statusFilter, followUpFilter, followUpStateFilter, customFollowUpStart, customFollowUpEnd]);

    useEffect(() => {
        setPage(1);
    }, [search, statusFilter, followUpFilter, followUpStateFilter, customFollowUpStart, customFollowUpEnd]);

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
                return "bg-green-50 border-green-300 text-green-700";
            case "not_required":
                return "bg-red-50 border-red-300 text-red-700";
            default:
                return "";
        }
    };

    const getRowColor = (status) => {
        switch (status) {
            case "required":
                return "bg-green-100/80 hover:bg-green-100";
            case "not_required":
                return "bg-red-100/80 hover:bg-red-100";
            default:
                return "";
        }
    };

    const getFollowUpBadge = (user) => {
        switch (user.computedFollowUpStatus) {
            case "done":
                return "badge badge-success badge-outline";
            case "missed":
                return "badge badge-error badge-outline";
            case "pending":
                return "badge badge-warning badge-outline";
            default:
                return "badge badge-ghost";
        }
    };

    const getFollowUpLabel = (user) => {
        switch (user.computedFollowUpStatus) {
            case "done":
                return "Done";
            case "missed":
                return "Missed";
            case "pending":
                return "Pending";
            default:
                return "No Follow-up";
        }
    };

    return (
        <div>
            <Toast message={toast} />

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="table w-full">
                    <thead className="bg-slate-900 text-white sticky top-0">
                        <tr>
                            <th className="w-12 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-200">#</th>
                            <th className="min-w-[110px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-200">Name</th>
                            <th className="min-w-[130px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-200">Company</th>
                            <th className="min-w-[110px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-200">Contact</th>
                            <th className="min-w-[220px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-200">Address</th>
                            <th className="min-w-[120px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-200">Status</th>
                            <th className="min-w-[220px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-200">Follow Up</th>
                            <th className="min-w-[120px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-200">Notes</th>
                            <th className="min-w-[170px] px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-200">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="text-center py-12">
                                    <div className="flex flex-col items-center gap-3">
                                        <span className="text-xl font-semibold text-slate-600">No users found</span>
                                        <span className="text-sm text-slate-500">Try adjusting search or filters</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            users.map((u, index) => (
                                <tr key={u._id} className={`${getRowColor(u.status)} transition-colors duration-150 hover:bg-slate-50`}>
                                    <td className="px-3 py-3 align-top text-sm font-semibold text-slate-600">
                                        {((page - 1) * 10) + index + 1}
                                    </td>
                                    <td className="px-3 py-3 align-top text-sm font-semibold text-slate-900 break-words">{u.name || "N/A"}</td>
                                    <td className="px-3 py-3 align-top text-sm font-medium text-slate-800 break-words">{u.companyName || "N/A"}</td>
                                    <td className="px-3 py-3 align-top text-sm text-slate-700">{u.contactNumber || "N/A"}</td>
                                    <td className="px-3 py-3 align-top text-sm text-slate-600">
                                        <div className="line-clamp-3 break-words leading-5" title={u.address || "N/A"}>
                                            {u.address || "N/A"}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 align-top">
                                        <select
                                            className={`select select-sm h-10 min-h-0 w-full max-w-[120px] select-bordered text-sm font-medium ${statusColor(u.status)}`}
                                            value={u.status}
                                            onChange={(e) => updateStatus(u._id, e.target.value)}
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
                                    <td className="px-3 py-3 align-top text-sm text-slate-700">
                                        <div className="flex flex-col gap-2">
                                            <span className={getFollowUpBadge(u)}>{getFollowUpLabel(u)}</span>
                                            <div>
                                                {u.followUpDateTime
                                                    ? new Date(u.followUpDateTime).toLocaleString("en-US", {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })
                                                    : "-"}
                                            </div>
                                            {u.followUpCompletedAt && (
                                                <div className="text-xs text-slate-500">
                                                    Done: {new Date(u.followUpCompletedAt).toLocaleString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 align-top text-sm text-slate-600">
                                        <div className="block w-full truncate" title={u.notes || "N/A"}>
                                            {u.notes || "N/A"}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 align-top">
                                        <div className="flex justify-center gap-2">
                                            {(u.computedFollowUpStatus === "pending" || u.computedFollowUpStatus === "missed") && (
                                                <button
                                                    className="btn btn-xs h-8 min-h-0 px-3 btn-success text-white"
                                                    onClick={() => markFollowUpDone(u)}
                                                    title="Mark follow-up done"
                                                >
                                                    Done
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-xs h-8 min-h-0 px-3 btn-accent text-white"
                                                onClick={() => onEdit(u)}
                                                title="Edit user"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-xs h-8 min-h-0 px-3 btn-error text-white"
                                                onClick={() => {
                                                    setDeleteTarget(u);
                                                    setShowDeleteModal(true);
                                                }}
                                                title="Delete user"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {users.length > 0 && totalPages > 0 && (
                    <div className="flex justify-end items-center py-3 px-4 bg-slate-50 border-t border-slate-200">
                        <div className="join">
                            <button
                                className="join-item btn btn-sm"
                                disabled={page === 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                Prev
                            </button>

                            <button className="join-item btn btn-sm">
                                {page} / {totalPages}
                            </button>

                            <button
                                className="join-item btn btn-sm"
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
                        <h3 className="font-bold text-lg">Delete User</h3>
                        <p className="py-4">
                            Are you sure you want to delete this user?
                            This action cannot be undone.
                        </p>
                        <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-700">
                            <div><strong>Name:</strong> {deleteTarget?.name || "N/A"}</div>
                            <div><strong>Company:</strong> {deleteTarget?.companyName || "N/A"}</div>
                            <div><strong>Contact:</strong> {deleteTarget?.contactNumber || "N/A"}</div>
                        </div>
                        <div className="modal-action">
                            <button className="btn" onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-error" onClick={confirmDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

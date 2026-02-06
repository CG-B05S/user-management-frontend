import { useNavigate } from "react-router-dom";
import { useState } from "react";
import UserTable from "../components/UserTable";
import UserFormModal from "../components/UserFormModal";
import BulkUploadModal from "../components/BulkUploadModal";

export default function Dashboard() {
    const navigate = useNavigate();

    const [openModal, setOpenModal] = useState(false);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [editUser, setEditUser] = useState(null);

    // NEW STATES (moved from table)
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const refreshTable = () => {
        setRefresh(prev => !prev);
    };

    return (
        <div className="min-h-screen bg-base-200">

            {/* HEADER */}
            <div className="navbar bg-base-100 shadow px-6">
                <div className="flex-1">
                    <span className="text-lg font-semibold">
                        User Management
                    </span>
                </div>

                <div className="flex-none">
                    <button
                        className="btn btn-error btn-sm"
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            <div className="p-6 max-w-[90%] mx-auto">

                <div className="card bg-base-100 shadow">
                    <div className="card-body">

                        {/* TOOLBAR */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">

                            {/* LEFT SIDE - FILTERS */}
                            <div className="flex gap-3">

                                <input
                                    type="text"
                                    placeholder="Search company or contact..."
                                    className="input input-bordered input-sm w-72"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />

                                <select
                                    className="select select-bordered select-sm w-48"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="" disabled selected>Select Status</option>
                                    <option value="received">Received</option>
                                    <option value="not_received">Not Received</option>
                                    <option value="switch_off">Switch Off</option>
                                    <option value="callback">Callback</option>
                                </select>

                            </div>

                            {/* RIGHT SIDE - ACTIONS */}
                            <div className="flex gap-2">
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setBulkOpen(true)}
                                >
                                    Bulk Upload
                                </button>

                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => setOpenModal(true)}
                                >
                                    Add User
                                </button>
                            </div>

                        </div>

                        <UserTable
                            refresh={refresh}
                            search={search}
                            statusFilter={statusFilter}
                            onEdit={setEditUser}
                        />

                    </div>
                </div>

            </div>

            {(openModal || editUser) && (
                <UserFormModal
                    close={() => {
                        setOpenModal(false);
                        setEditUser(null);
                    }}
                    onSuccess={refreshTable}
                    editUser={editUser}
                />
            )}


            {bulkOpen && (
                <BulkUploadModal
                    close={() => setBulkOpen(false)}
                    onSuccess={refreshTable}
                />
            )}
        </div>
    );
}

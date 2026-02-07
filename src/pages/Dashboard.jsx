import { useState } from "react";
import UserTable from "../components/UserTable";
import UserFormModal from "../components/UserFormModal";
import BulkUploadModal from "../components/BulkUploadModal";
import ProfileDropdown from "../components/ProfileDropdown";
import Footer from "./Footer";

export default function Dashboard() {
    const [openModal, setOpenModal] = useState(false);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [editUser, setEditUser] = useState(null);

    // NEW STATES (moved from table)
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const refreshTable = () => {
        setRefresh(prev => !prev);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

            {/* HEADER */}
            <div className="navbar bg-white shadow-md sticky top-0 z-50">
                <div className="flex-1">
                    <span className="text-2xl font-bold text-slate-800">
                         User Management System
                    </span>
                </div>

                <div className="flex-none">
                    <ProfileDropdown />
                </div>
            </div>

            {/* CONTENT */}
            <div className="p-8 max-w-7xl mx-auto">

                <div className="card bg-white shadow-lg rounded-xl">
                    <div className="card-body p-8">

                        {/* TOOLBAR */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">

                            {/* LEFT SIDE - FILTERS */}
                            <div className="flex gap-4 flex-wrap">
                                <div className="form-control">
                                    <input
                                        type="text"
                                        placeholder="Search company or contact..."
                                        className="input input-bordered w-72 focus:input-primary focus:outline-none"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                <div className="form-control">
                                    <select
                                        className="select select-bordered w-56 focus:select-primary focus:outline-none"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="">All Status</option>
                                        <option value="received">Received</option>
                                        <option value="not_received">Not Received</option>
                                        <option value="switch_off">Switch Off</option>
                                        <option value="callback">Callback</option>
                                        <option value="required">Required</option>
                                        <option value="not_required">Not Required</option>
                                    </select>
                                </div>

                            </div>

                            {/* RIGHT SIDE - ACTIONS */}
                            <div className="flex gap-3">
                                <button
                                    className="btn btn-outline btn-md gap-2 hover:btn-primary"
                                    onClick={() => setBulkOpen(true)}
                                >
                                    📥 Bulk Upload
                                </button>

                                <button
                                    className="btn btn-primary btn-md gap-2"
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
         <Footer />
        </div>
       
    );
}

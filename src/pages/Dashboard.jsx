import { useState } from "react";
import UserTable from "../components/UserTable";
import UserFormModal from "../components/UserFormModal";
import BulkUploadModal from "../components/BulkUploadModal";
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
        <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">

            {/* CONTENT */}
            <div className="p-4 md:p-5 max-w-[1600px] mx-auto w-full flex-1">

                <div className="card bg-white shadow-md rounded-2xl border border-slate-200">
                    <div className="card-body p-4 md:p-5">

                        {/* TOOLBAR */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">

                            {/* LEFT SIDE - FILTERS */}
                            <div className="flex gap-3 flex-wrap">
                                <div className="form-control">
                                    <input
                                        type="text"
                                        placeholder="Search name, company or contact..."
                                        className="input input-bordered h-11 w-64 md:w-72 focus:input-primary focus:outline-none"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                <div className="form-control">
                                    <select
                                        className="select select-bordered h-11 w-44 md:w-52 focus:select-primary focus:outline-none"
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
                            <div className="flex gap-2">
                                <button
                                    className="btn btn-outline btn-sm md:btn-md gap-2 hover:btn-primary"
                                    onClick={() => setBulkOpen(true)}
                                >
                                    📥 Bulk Upload
                                </button>

                                <button
                                    className="btn btn-primary btn-sm md:btn-md gap-2"
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

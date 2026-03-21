import { useState } from "react";
import UserTable from "../components/UserTableEnhanced";
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
    const [followUpFilter, setFollowUpFilter] = useState("");
    const [followUpStateFilter, setFollowUpStateFilter] = useState("");
    const [customFollowUpStart, setCustomFollowUpStart] = useState("");
    const [customFollowUpEnd, setCustomFollowUpEnd] = useState("");

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

                                <div className="form-control">
                                    <select
                                        className="select select-bordered h-11 w-44 md:w-52 focus:select-primary focus:outline-none"
                                        value={followUpFilter}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFollowUpFilter(value);
                                            if (value !== "custom") {
                                                setCustomFollowUpStart("");
                                                setCustomFollowUpEnd("");
                                            }
                                        }}
                                    >
                                        <option value="">All Follow Up</option>
                                        <option value="5m">5 mins</option>
                                        <option value="15m">15 mins</option>
                                        <option value="30m">30 mins</option>
                                        <option value="1h">1 hour</option>
                                        <option value="3h">3 hours</option>
                                        <option value="6h">6 hours</option>
                                        <option value="1d">1 day</option>
                                        <option value="2d">2 days</option>
                                        <option value="7d">7 days</option>
                                        <option value="15d">15 days</option>
                                        <option value="30d">30 days</option>
                                        <option value="custom">Custom date</option>
                                    </select>
                                </div>

                                <div className="form-control">
                                    <select
                                        className="select select-bordered h-11 w-44 md:w-52 focus:select-primary focus:outline-none"
                                        value={followUpStateFilter}
                                        onChange={(e) => setFollowUpStateFilter(e.target.value)}
                                    >
                                        <option value="">All Follow Up State</option>
                                        <option value="pending">Pending</option>
                                        <option value="missed">Missed</option>
                                        <option value="done">Done</option>
                                    </select>
                                </div>

                                {followUpFilter === "custom" && (
                                    <>
                                        <div className="form-control">
                                            <label className="label py-1">
                                                <span className="label-text text-xs font-medium text-slate-600">From</span>
                                            </label>
                                            <input
                                                type="datetime-local"
                                                className="input input-bordered h-11 w-56 md:w-64 focus:input-primary focus:outline-none"
                                                value={customFollowUpStart}
                                                onChange={(e) => setCustomFollowUpStart(e.target.value)}
                                            />
                                        </div>

                                        <div className="form-control">
                                            <label className="label py-1">
                                                <span className="label-text text-xs font-medium text-slate-600">To </span>
                                            </label>
                                            <input
                                                type="datetime-local"
                                                className="input input-bordered h-11 w-56 md:w-64 focus:input-primary focus:outline-none"
                                                value={customFollowUpEnd}
                                                onChange={(e) => setCustomFollowUpEnd(e.target.value)}
                                            />
                                        </div>
                                    </>
                                )}

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
                            followUpFilter={followUpFilter}
                            followUpStateFilter={followUpStateFilter}
                            customFollowUpStart={customFollowUpStart}
                            customFollowUpEnd={customFollowUpEnd}
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

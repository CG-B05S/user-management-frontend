import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import ProfileModal from "./ProfileModal";
import PasswordModal from "./PasswordModal";

export default function ProfileDropdown() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/auth/profile");
      setUser(res.data.user);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading) {
    return <div className="skeleton w-12 h-12 rounded-full"></div>;
  }

  // Get initials from name
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <>
      <div className="dropdown dropdown-end">
        <button tabIndex={0} className="btn btn-ghost btn-circle avatar">
          <div className="w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.name} />
            ) : (
              initials
            )}
          </div>
        </button>

        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
          <li className="menu-title">
            <span>{user?.name}</span>
          </li>
          <li>
            <a role="button" tabIndex={0} onClick={(e) => {
              e.preventDefault();
              setShowProfileModal(true);
            }}>
              👤 View Profile
            </a>
          </li>
          <li>
            <a role="button" tabIndex={0} onClick={(e) => {
              e.preventDefault();
              setShowPasswordModal(true);
            }}>
              🔐 Update Password
            </a>
          </li>
          <li>
            <a role="button" tabIndex={0} onClick={(e) => {
              e.preventDefault();
              logout();
            }} className="text-error">
              🚪 Logout
            </a>
          </li>
        </ul>
      </div>

      {showProfileModal && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onSuccess={(updatedUser) => {
            setUser(updatedUser);
            setShowProfileModal(false);
          }}
        />
      )}

      {showPasswordModal && (
        <PasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={() => {
            setShowPasswordModal(false);
          }}
        />
      )}
    </>
  );
}

import { useNavigate } from "react-router-dom";
import ProfileDropdown from "../components/ProfileDropdown";
import logo from "../assets/logo.svg";

export default function Navbar() {
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="navbar bg-white shadow-md sticky top-0 z-50 px-4">

      <div
        className="flex-1 flex items-center cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img src={logo} alt="Logo" className="h-8 w-8 mr-2" />
        <span className="text-2xl font-bold text-slate-800">
          User Management System
        </span>
      </div>

      <div className="flex-none">
        {isLoggedIn && <ProfileDropdown />}
      </div>

    </div>
  );
}

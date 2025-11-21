import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiBox, FiFileText, FiLogOut } from "react-icons/fi";

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const linkStyle = (path: string) =>
    `flex items-center gap-3 px-5 py-3 rounded-lg transition ${
      pathname.includes(path)
        ? "bg-orange-500 text-white"
        : "text-gray-700 hover:bg-gray-200"
    }`;

  const handleLogout = () => {        
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-white border-r shadow-sm hidden md:block fixed top-0 left-0 h-screen flex flex-col justify-between">
      <div className="p-5">
        <h2 className="text-xl font-bold text-orange-600">Admin Dashboard</h2>
        <Link
          to="/"
          className="mt-3 ml-8 inline-flex items-center text-sm px-3 py-1 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 gap-2"
          aria-label="Ke Beranda"
        >
          <FiHome />
          <span className="hidden sm:inline">Beranda</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto flex flex-col gap-2 px-3">
        <Link to="/admin/reservations" className={linkStyle("reservations")}>
          <FiFileText /> Reservasi
        </Link>

        <Link to="/admin/rooms" className={linkStyle("rooms")}>
          <FiBox /> Data Ruangan
        </Link>
      </nav>

      {/* BUTTON LOGOUT FIXED BOTTOM */}
      <div className="absolute bottom-8 left-0 w-[250px] p-12">
        <button
          onClick={handleLogout}
          className="cursor-pointer w-full flex items-center justify-start gap-3 px-5 py-3 rounded-lg text-gray-700 hover:bg-gray-200"
        >
          <FiLogOut /> Logout
        </button>
      </div>
    </aside>
  );
}

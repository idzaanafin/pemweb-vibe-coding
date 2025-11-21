import { useState, useEffect } from "react";
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiHome,
  FiMap,
  FiUser,
  FiLogIn,
  FiLogOut,
  FiCalendar
} from "react-icons/fi";

export default function MainLayout() {
  const [open, setOpen] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // Disable body scroll if sidebar open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  useEffect(() => {
    const raw = sessionStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    } else setUser(null);
  }, []);

  const handleLogout = () => {    
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-orange-50">

      {/* FLOATING NAVBAR */}
      <div className="fixed top-4 left-0 w-full z-[100] px-4">
        <div className="max-w-5xl mx-auto px-6 py-3 bg-orange-500 text-white rounded-full shadow-xl border border-orange-300/40 flex items-center justify-between">
          
          {/* LOGO */}
          <Link to="/" className="text-xl font-bold tracking-wide">
            ITSbooking
          </Link>

          {/* DESKTOP MENU */}
          <nav className="hidden md:flex items-center gap-8 font-medium">
            <NavItem to="/" label="Beranda" />
            <NavItem to="/rooms" label="Ruangan" />
            <NavItem to="/reservations" label="Reservasi" />
          </nav>

          {/* DESKTOP LOGIN / USER */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-white font-semibold">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="cursor-pointer bg-white text-orange-600 px-4 py-2 rounded-full font-semibold hover:bg-orange-100 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-white text-orange-600 px-4 py-2 rounded-full font-semibold hover:bg-orange-100 transition"
              >
                Masuk
              </Link>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-2xl"
          >
            <FiMenu />
          </button>
        </div>
      </div>

      {/* MOBILE SIDEBAR */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute top-0 right-0 h-full w-72 bg-white shadow-2xl p-6 flex flex-col gap-6 animate-slideLeft"
            onClick={(e) => e.stopPropagation()}
          >
            {/* SIDEBAR HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-orange-600">Menu</h2>
              <button onClick={() => setOpen(false)}>
                <FiX className="text-2xl text-orange-600" />
              </button>
            </div>

            {/* SIDEBAR ITEMS */}
            <SidebarItem to="/" icon={<FiHome />} label="Beranda" close={setOpen} />
            <SidebarItem to="/rooms" icon={<FiMap />} label="Ruangan" close={setOpen} />
            <SidebarItem to="/reservations" icon={<FiCalendar />} label="Reservation" close={setOpen} />

            <div className="border-t pt-4">
              {user ? (
                <button
                  onClick={() => { setOpen(false); handleLogout(); }}
                  className="w-full text-left flex items-center gap-3 text-gray-700 text-lg py-2 cursor-pointer"
                >
                  <FiLogOut /> Logout
                </button>
              ) : (
                <SidebarItem to="/login" icon={<FiLogIn />} label="Masuk" close={setOpen} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="pt-0 pb-0 w-full h-full">

        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-orange-600 text-white text-center py-4 mt-auto">
        <p className="font-medium text-sm">
          © {new Date().getFullYear()} ITSbooking — Sistem Peminjaman Ruangan
        </p>
      </footer>
    </div>
  );
}

/* ----------- COMPONENTS ----------- */

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  close: (value: boolean) => void;
}


function SidebarItem({ to, icon, label, close }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      className="flex items-center gap-3 text-gray-700 text-lg py-2"
      onClick={() => close(false)}
    >
      {icon}
      {label}
    </NavLink>
  );
}

interface NavItemProps {
  to: string;
  label: string;
}

function NavItem({ to, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive
          ? "bg-white text-orange-600 px-4 py-1 rounded-full"
          : "hover:opacity-80"
      }
    >
      {label}
    </NavLink>
  );
}

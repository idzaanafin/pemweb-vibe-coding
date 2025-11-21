import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<null | { type: "success" | "error"; message: string }>(null);
  const toastTimer = useRef<number | null>(null);
  const navigate = useNavigate();

  const showToast = (message: string, type: "success" | "error" = "error", duration = 3500) => {
    setToast({ message, type });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), duration);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      showToast("Semua field wajib diisi", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "Registrasi gagal", "error");
        setLoading(false);
        return;
      }

      // If API returns token and user, store in session and redirect
      if (data.token) sessionStorage.setItem("token", data.token);
      if (data.user) sessionStorage.setItem("user", JSON.stringify(data.user));

      showToast(data.message || "Registrasi berhasil", "success");
      setLoading(false);
      const role = data.user?.role;
      setTimeout(() => {
        if (role === "admin") navigate("/admin/rooms");
        else navigate("/");
      }, 800);
    } catch (err) {
      showToast("Terjadi kesalahan jaringan", "error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-orange-600 text-center mb-6">Register</h1>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nama</label>
            <input
              type="text"
              className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
              placeholder="Nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl font-semibold transition cursor-pointer disabled:opacity-60">
            {loading ? "Memproses..." : "Register"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Sudah punya akun?{' '}
            <a href="/login" className="text-orange-600 font-medium hover:underline">Login</a>
          </p>
        </form>
      </div>

      {toast && (
        <div className="fixed top-6 right-6 z-50">
          <div className={`max-w-sm w-full px-4 py-3 rounded shadow-lg text-white flex items-start gap-3 ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
            <div className="flex-1">
              <div className="font-medium">{toast.type === "success" ? "Berhasil" : "Error"}</div>
              <div className="text-sm mt-1">{toast.message}</div>
            </div>
            <button className="opacity-90 text-xl leading-none" onClick={() => setToast(null)} aria-label="Tutup">×</button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BASE_URL, API_URL } from "../../config/api";

interface Room {
  _id: string;
  name: string;
  code: string;
  location: string;
  capacity: number;
  imageUrl?: string;
}

export default function RoomsAdmin() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [toast, setToast] = useState<null | { type: "success" | "error"; message: string }>(null);
  const toastTimer = useRef<number | null>(null);

  // editing handled in separate route (/admin/rooms/:id/edit)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const showToast = (message: string, type: "success" | "error" = "error", duration = 3000) => {
    setToast({ message, type });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), duration);
  };

  useEffect(() => {
    fetch(`${API_URL}/rooms`)
      .then((res) => res.json())
      .then((data) => setRooms(data.data));
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  // edit image preview is handled in the edit route component

  const token = sessionStorage.getItem("token") || localStorage.getItem("token");

  const handleDelete = async (id: string) => {
    // open confirm modal instead
    setConfirmDeleteId(id);
  };

  const performDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/rooms/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "Gagal menghapus ruangan", "error");
        return;
      }
      showToast("Ruangan berhasil dihapus", "success");
      setRooms((prev) => prev.filter((r) => r._id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      showToast("Terjadi kesalahan", "error");
      setConfirmDeleteId(null);
    }
  };

  // editing is handled in a separate route: /admin/rooms/:id/edit

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kelola Ruangan</h1>
        <Link
          to="/admin/rooms/create"
          className="px-4 py-2 bg-orange-600 text-white rounded shadow hover:bg-orange-700 transition"
        >
          + Tambah Ruangan
        </Link>
      </div>


      {rooms.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          belum ada ruangan yang ditambahkan
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((r) => (
            <div
              key={r._id}
              className="bg-white border rounded-xl shadow-sm overflow-hidden"
            >
              <img
                src={`${BASE_URL}${r.imageUrl ?? "/uploads/room.png"}`}
                alt={r.name}
                className="h-40 w-full object-cover"
              />

              <div className="p-4">
                <h2 className="text-lg font-semibold">{r.name}</h2>
                <p className="text-sm text-gray-500">{r.location}</p>
                <p className="text-sm">Kode: {r.code}</p>

                <div className="flex gap-3 mt-3">
                  <Link to={`/admin/rooms/${r._id}/edit`} className="px-3 py-1 bg-orange-500 text-white rounded">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(r._id)} className="px-3 py-1 bg-red-500 text-white rounded">
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit handled on separate route */}

      {/* Delete Confirm Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">Konfirmasi Hapus</h3>
            <p className="text-sm text-gray-600">Apakah Anda yakin ingin menghapus ruangan ini? Tindakan ini tidak dapat dibatalkan.</p>

            <div className="mt-4 flex justify-end gap-3">
              <button className="px-4 py-2 border rounded" onClick={() => setConfirmDeleteId(null)}>Batal</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={() => performDelete(confirmDeleteId)}>Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50">
          <div className={`max-w-sm w-full px-4 py-3 rounded shadow-lg text-white flex items-start gap-3 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            <div className="flex-1">
              <div className="font-medium">{toast.type === 'success' ? 'Berhasil' : 'Error'}</div>
              <div className="text-sm mt-1">{toast.message}</div>
            </div>
            <button className="opacity-90 text-xl leading-none" onClick={() => setToast(null)} aria-label="Tutup">×</button>
          </div>
        </div>
      )}
    </div>
  );
}

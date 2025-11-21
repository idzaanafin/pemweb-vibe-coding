import { useEffect, useState } from "react";
import { API_URL, BASE_URL } from "../../config/api.tsx";

interface Reservation {
  _id: string;
  title: string;
  status: string;
  startTime: string;
  endTime: string;
  room: {
    name: string;
  };
  user: {
    name: string;
    email: string;
  };
}

export default function ReservationsAdmin() {
  const [list, setList] = useState<Reservation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [toast, setToast] = useState<null | { type: "success" | "error"; message: string }>(null);

  useEffect(() => {
    fetch(`${API_URL}/reservation`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setList(data.data));    
  }, []);

  const openDetail = async (id: string) => {
    setSelectedId(id);
    setModalLoading(true);
    try {
      const res = await fetch(`${API_URL}/reservation/${id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      const data = await res.json();
      setDetail(data.data || null);
      // if reservation already has a rejectReason, show it in notes
      if (data?.data?.rejectReason) setNotes(data.data.rejectReason);
    } catch (err) {
      setDetail(null);
    }
    setModalLoading(false);
  };

  const closeDetail = () => {
    setSelectedId(null);
    setDetail(null);
    setNotes("");
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const performAction = async (status: "approved" | "rejected") => {
    if (!selectedId) return;
    // prevent changing status if already processed
    if (detail && detail.status && detail.status !== "pending") {
      showToast("Reservasi sudah diproses", "error");
      return;
    }
    setActionLoading(true);
    try {
      const body: any = { status };
      if (status === "rejected" && notes.trim()) body.rejectReason = notes.trim();
      const res = await fetch(`${API_URL}/reservation/${selectedId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "Gagal mengubah status", "error");
        setActionLoading(false);
        return;
      }
      // update list locally
      setList((prev) => prev.map((r) => (r._id === selectedId ? { ...r, status: data.data.status, rejectReason: data.data.rejectReason } : r)));
      showToast("Status berhasil diperbarui", "success");
      setActionLoading(false);
      closeDetail();
    } catch (err) {
      showToast("Terjadi kesalahan", "error");
      setActionLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Data Reservasi</h1>      

      {!list ? (
        <div className="py-12 text-center text-gray-500">
          belum ada reservasi yang ditambahkan
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((r) => (
            <div
              key={r._id}
              className="bg-white border p-4 rounded-lg shadow-sm"
            >
              <h2 className="text-lg font-semibold">{r.title}</h2>
              <p className="text-sm text-gray-500">{r.room.name}</p>

              <p className="text-sm mt-1">
                {new Date(r.startTime).toLocaleString()} →{" "}
                {new Date(r.endTime).toLocaleString()}
              </p>

              <p className="text-sm mt-1">
                User: <span className="font-medium">{r.user.name}</span>
              </p>

              <span
                className={`inline-block px-3 py-1 rounded text-white text-xs mt-2
                  ${
                    r.status === "pending"
                      ? "bg-yellow-500"
                      : r.status === "approved"
                      ? "bg-green-600"
                      : "bg-red-600"
                  }
                `}
              >
                {r.status}
              </span>
              <div className="mt-3 flex gap-2">
                <button onClick={() => openDetail(r._id)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Detail</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-3xl rounded shadow-lg p-6">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">Detail Reservasi</h3>
              <button onClick={closeDetail} className="text-gray-500 hover:text-gray-700">×</button>
            </div>

            {modalLoading ? (
              <div className="py-12 text-center">Memuat...</div>
            ) : detail ? (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Judul: <span className="font-medium">{detail.title}</span></p>
                <p className="text-sm text-gray-600">Pemesan: <span className="font-medium">{detail.user?.name}</span></p>
                <p className="text-sm text-gray-600">Ruangan: <span className="font-medium">{detail.room?.name}</span></p>
                <p className="text-sm text-gray-600">Waktu: <span className="font-medium">{new Date(detail.startTime).toLocaleString()} — {new Date(detail.endTime).toLocaleString()}</span></p>

                {/* PDF preview if available */}
                <div className="mt-4">
                  {detail.documentUrl ? (
                    <iframe src={`${BASE_URL}${detail.documentUrl}`} className="w-full h-96 border" title="dokumen-reservasi" />
                  ) : (
                    <div className="text-sm text-gray-500">Tidak ada dokumen terlampir.</div>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium">Catatan (untuk reject)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={`w-full border px-3 py-2 rounded ${detail && detail.status && detail.status !== 'pending' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    disabled={detail && detail.status && detail.status !== 'pending'}
                  />
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={() => performAction('rejected')}
                    disabled={actionLoading || (detail && detail.status && detail.status !== "pending")}
                    className={`px-4 py-2 text-white rounded ${actionLoading || (detail && detail.status && detail.status !== "pending") ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    {actionLoading ? 'Memproses...' : 'Reject'}
                  </button>
                  <button
                    onClick={() => performAction('approved')}
                    disabled={actionLoading || (detail && detail.status && detail.status !== "pending")}
                    className={`px-4 py-2 text-white rounded ${actionLoading || (detail && detail.status && detail.status !== "pending") ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {actionLoading ? 'Memproses...' : 'Approve'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">Tidak dapat memuat detail.</div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded shadow text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          <div className="font-medium">{toast.type === 'success' ? 'Berhasil' : 'Error'}</div>
          <div className="text-sm mt-1">{toast.message}</div>
        </div>
      )}
    </div>
  );
}

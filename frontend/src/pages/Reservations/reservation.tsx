import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL, BASE_URL } from "../../config/api";

interface Reservation {
  _id: string;
  title: string;
  status: string;
  rejectReason?: string;
  startTime: string;
  endTime: string;
  room: {
    _id?: string;
    name: string;
  };
}

export default function UserReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [toast, setToast] = useState<null | { type: "success" | "error"; message: string }>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const performCancel = async (id: string) => {
    setCancellingId(id);
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${API_URL}/reservation/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: data.message || "Gagal membatalkan reservasi" });
      } else {
        setReservations((prev) => prev.filter((r) => r._id !== id));
        setToast({ type: "success", message: "Reservasi berhasil dibatalkan" });
      }
    } catch (err) {
      setToast({ type: "error", message: "Terjadi kesalahan" });
    }
    setCancellingId(null);
    setConfirmCancelId(null);
  };
  const token = sessionStorage.getItem("token");

  const openDetail = async (id: string) => {
    setSelectedId(id);
    setModalLoading(true);
    try {
      const res = await fetch(`${API_URL}/reservation/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDetail(data.data || null);
    } catch (err) {
      setDetail(null);
    }
    setModalLoading(false);
  };

  const closeDetail = () => {
    setSelectedId(null);
    setDetail(null);
  };

  useEffect(() => {
    fetch(`${API_URL}/reservation`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setReservations(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="pt-32 text-center text-gray-600"> 
        Memuat reservasi Anda...
      </div>
    );
  }

  if (!loading && reservations.length === 0) {
    return (
      <div className="pt-32 text-center max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800">
          Tidak Ada Reservasi
        </h2>
        <p className="text-gray-500 mt-2">
          Anda belum memiliki reservasi apa pun.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Reservasi Saya</h1>
        <Link to="/rooms" className="text-sm text-gray-600 hover:underline">← Kembali ke Daftar Ruangan</Link>
      </div>

      <div className="space-y-5">
        {reservations.map((resv) => (
          <div
            key={resv._id}
            className="bg-white border rounded-xl shadow-sm p-5"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{resv.title}</h2>

              <span
                className={`px-3 py-1 rounded text-sm text-white ${
                  resv.status === "pending"
                    ? "bg-yellow-500"
                    : resv.status === "approved"
                    ? "bg-green-600"
                    : "bg-red-600"
                }`}
              >
                {resv.status.toUpperCase()}
              </span>
            </div>

            <p className="text-gray-600 mt-1">
              Ruangan: <span className="font-medium">{resv.room.name}</span>
            </p>

            <p className="text-gray-600 mt-1">
              Waktu:{" "}
              <span className="font-medium">
                {new Date(resv.startTime).toLocaleString()} —{" "}
                {new Date(resv.endTime).toLocaleString()}
              </span>
            </p>           

            <div className="mt-4 flex gap-3">
              {resv.status === "pending" && (
                <button
                  onClick={() => setConfirmCancelId(resv._id)}
                  disabled={cancellingId === resv._id}
                  className={`px-4 py-2 text-white rounded ${cancellingId === resv._id ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'}`}
                >
                  {cancellingId === resv._id ? "Membatalkan..." : "Batalkan Reservasi"}
                </button>
              )}
              <button onClick={() => openDetail(resv._id)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Detail</button>

              {/* Update button: redirect to reserve form with editId (disabled when processed) */}
              {resv.room?._id && resv.status === 'pending' ? (
                <Link
                  to={`/rooms/${resv.room._id}/reserve?editId=${resv._id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Update
                </Link>
              ) : (
                <button disabled className="px-4 py-2 bg-gray-300 text-gray-600 rounded">Update</button>
              )}
            </div>
          </div>
        ))}
      </div>

          {/* Confirm Cancel Modal */}
          {/* Detail Modal for user */}
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
                    <p className="text-sm text-gray-600">Ruangan: <span className="font-medium">{detail.room?.name}</span></p>
                    <p className="text-sm text-gray-600">Waktu: <span className="font-medium">{new Date(detail.startTime).toLocaleString()} — {new Date(detail.endTime).toLocaleString()}</span></p>
                    <p className="text-sm text-gray-600">Status: <span className="font-medium">{detail.status}</span></p>

                    {detail.rejectReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded">
                        <div className="text-sm text-red-700 font-medium">Alasan Ditolak</div>
                        <div className="text-sm text-red-600 mt-1">{detail.rejectReason}</div>
                      </div>
                    )}

                    <div className="mt-4">
                      {detail.documentUrl ? (
                        <iframe src={`${BASE_URL}${detail.documentUrl}`} className="w-full h-96 border" title="dokumen-reservasi" />
                      ) : (
                        <div className="text-sm text-gray-500">Tidak ada dokumen terlampir.</div>
                      )}
                    </div>

                    <div className="mt-4 flex justify-end gap-3">
                      {detail.status === 'pending' ? (
                        detail.room?._id ? (
                          <Link to={`/rooms/${detail.room._id}/reserve?editId=${detail._id}`} className="px-4 py-2 bg-blue-600 text-white rounded">Update</Link>
                        ) : (
                          <button disabled className="px-4 py-2 bg-gray-300 text-gray-600 rounded">Update</button>
                        )
                      ) : (
                        <button disabled className="px-4 py-2 bg-gray-300 text-gray-600 rounded">Update</button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">Tidak dapat memuat detail.</div>
                )}
              </div>
            </div>
          )}
          {confirmCancelId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <h3 className="text-lg font-semibold mb-2">Konfirmasi Pembatalan</h3>
                <p className="text-sm text-gray-600">Apakah Anda yakin ingin membatalkan reservasi ini? Tindakan ini tidak dapat dibatalkan.</p>

                <div className="mt-4 flex justify-end gap-3">
                  <button onClick={() => setConfirmCancelId(null)} className="px-4 py-2 border rounded">Batal</button>
                  <button onClick={() => performCancel(confirmCancelId)} className="px-4 py-2 bg-red-600 text-white rounded">Ya, Batalkan</button>
                </div>
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

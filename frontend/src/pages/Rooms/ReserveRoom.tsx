import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { API_URL } from "../../config/api";

export default function ReserveRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const editId = search.get("editId");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("10:00");
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<null | { type: "success" | "error"; message: string }>(null);
  const [isEdit, setIsEdit] = useState<boolean>(!!editId);

  const showToast = (message: string, type: "success" | "error" = "error", duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return showToast("ID ruangan tidak ditemukan", "error");
    if (!title.trim()) return showToast("Judul reservasi wajib", "error");
    if (!documentFile && !isEdit) return showToast("Silakan unggah dokumen pendukung", "error");

    const startIso = new Date(`${date}T${startTime}:00`).toISOString();
    const endIso = new Date(`${date}T${endTime}:00`).toISOString();
    if (new Date(startIso) >= new Date(endIso)) return showToast("Waktu mulai harus sebelum waktu selesai", "error");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("room", String(id));
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("startTime", startIso);
      formData.append("endTime", endIso);
      if (documentFile) formData.append("document", documentFile);

      const token = sessionStorage.getItem("token");

      const url = editId ? `${API_URL}/reservation/${editId}` : `${API_URL}/reservation`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || (editId ? "Gagal memperbarui reservasi" : "Gagal membuat reservasi"), "error");
        setLoading(false);
        return;
      }

      showToast(editId ? "Reservasi berhasil diperbarui" : "Reservasi berhasil dibuat", "success");
      setLoading(false);
      navigate("/reservations");
    } catch (err) {
      showToast("Terjadi kesalahan saat mengirim reservasi", "error");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!editId) return;
    setIsEdit(true);
    fetch(`${API_URL}/reservation/${editId}`,
        {
         headers: {
              Authorization: sessionStorage.getItem("token") ? `Bearer ${sessionStorage.getItem("token")}` : "",
         }   
        }
    )
      .then((res) => res.json())
      .then((data) => {
        const r = data.data;
        if (!r) return;
        setTitle(r.title || "");
        setDescription(r.description || "");
        if (r.startTime) setDate(new Date(r.startTime).toISOString().slice(0, 10));
        if (r.startTime) setStartTime(new Date(r.startTime).toISOString().slice(11, 16));
        if (r.endTime) setEndTime(new Date(r.endTime).toISOString().slice(11, 16));
      })
      .catch(() => {});
  }, [editId]);

  return (
    <div className="pt-32 px-6 max-w-2xl mx-auto">
      <div className="mb-4">
        <Link to={`/rooms/${id}`} className="text-sm text-gray-600 font-bold hover:underline">← Kembali ke Ruangan</Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">{isEdit ? 'Perbarui Reservasi' : 'Ajukan Reservasi'}</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium">Judul</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium">Deskripsi (opsional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium">Tanggal</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Mulai</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Selesai</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Dokumen (wajib)</label>
          <input type="file" accept="application/pdf,image/*" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <Link to={`/rooms/${id}`} className="text-sm text-gray-600 hover:underline">← Kembali</Link>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded">Batal</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-orange-600 text-white rounded">{loading ? (isEdit ? 'Memperbarui...' : 'Mengirim...') : (isEdit ? 'Perbarui Permintaan' : 'Kirim Permintaan')}</button>
          </div>
        </div>
      </form>

      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded shadow text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          <div className="font-medium">{toast.type === 'success' ? 'Berhasil' : 'Error'}</div>
          <div className="text-sm mt-1">{toast.message}</div>
        </div>
      )}
    </div>
  );
}

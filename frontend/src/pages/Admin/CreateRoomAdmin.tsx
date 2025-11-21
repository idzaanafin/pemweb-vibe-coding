import { useEffect, useRef, useState } from "react";
import { API_URL, BASE_URL } from "../../config/api";
import { useNavigate, useParams } from "react-router-dom";
interface Room {
  _id: string;
  name: string;
  code: string;
  description: string;
  capacity: number;
  location: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

export default function CreateRoomAdmin() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState<number | "">("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | "">("");
  const [longitude, setLongitude] = useState<number | "">("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [existing, setExisting] = useState<null | Room | null>(null);

  const { id } = useParams();

  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const toastTimer = useRef<number | null>(null);

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

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // simple client-side validation
    const newErrors: { [k: string]: string } = {};
    // if creating (no id), name is required. if editing, name can be left empty to keep old.
    if (!id && !name.trim()) newErrors.name = "Nama ruangan wajib diisi";
    if (capacity !== "" && (Number(capacity) <= 0 || isNaN(Number(capacity)))) {
      newErrors.capacity = "Masukkan kapasitas valid"
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      // If editing, only append fields that user provided (non-empty), otherwise append all for create
      if (!id) {
        formData.append("name", name);
      } else if (name.trim() !== "") {
        formData.append("name", name);
      }

      if (code) formData.append("code", code);
      if (description) formData.append("description", description);
      if (capacity !== "") formData.append("capacity", String(capacity));
      if (location) formData.append("location", location);
      if (latitude !== "") formData.append("latitude", String(latitude));
      if (longitude !== "") formData.append("longitude", String(longitude));
      if (image) formData.append("image", image);

      const token = sessionStorage.getItem("token") || localStorage.getItem("token");

      const url = id ? `${API_URL}/rooms/${id}` : `${API_URL}/rooms`;
      const method = id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || (id ? "Gagal mengupdate ruangan" : "Gagal menambah ruangan"), "error");
        setLoading(false);
        return;
      }

      showToast(id ? "Ruangan berhasil diperbarui" : "Ruangan berhasil ditambahkan", "success");
      setLoading(false);
      // wait a moment so user sees toast, then navigate
      setTimeout(() => navigate("/admin/rooms"), 900);

    } catch (err) {
      showToast("Terjadi kesalahan", "error");
      setLoading(false);
    }
  };

  useEffect(() => {
    // create preview when image changes
    if (!image) {
      // if editing and no new image selected, show existing image
      if (existing && existing.imageUrl) {
        setPreview(`${BASE_URL}${existing.imageUrl}`);
      } else {
        setPreview(null);
      }
      return;
    }

    const url = URL.createObjectURL(image);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  // fetch existing room when id param present
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/rooms/${id}`);
        const data = await res.json();
        if (res.ok && data.data) {
          setExisting(data.data);
          // set preview to existing image
          if (data.data.imageUrl) setPreview(`${BASE_URL}${data.data.imageUrl}`);
        } else {
          showToast(data.message || "Data ruangan tidak ditemukan", "error");
        }
      } catch (err) {
        showToast("Gagal mengambil data ruangan", "error");
      }
    })();
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto px-4">
      <h1 className="text-4xl font-bold mb-3">{id ? "Edit Ruangan" : "Tambah Ruangan"}</h1>

      <form onSubmit={submitHandler} className="space-y-5 bg-white p-6 rounded-xl shadow border border-gray-200">

        <div>
          <label className="font-medium block">Nama Ruangan *</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
            value={name}
            placeholder={existing?.name ?? ""}
            onChange={(e) => { setName(e.target.value); setErrors(prev => ({...prev, name: ""})); }}
          />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="font-medium block">Kode Ruangan</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
            value={code}
            placeholder={existing?.code ?? ""}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        <div>
          <label className="font-medium block">Deskripsi</label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
            value={description}
            placeholder={existing?.description ?? ""}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="font-medium block">Kapasitas</label>
          <input
            type="number"
            min={0}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
            value={capacity}
            placeholder={existing?.capacity ? String(existing.capacity) : ""}
            onChange={(e) => setCapacity(e.target.value === "" ? "" : Number(e.target.value))}
          />
          {errors.capacity && <p className="text-sm text-red-500 mt-1">{errors.capacity}</p>}
        </div>

        <div>
          <label className="font-medium block">Lokasi</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
            value={location}
            placeholder={existing?.location ?? ""}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium block">Latitude</label>
            <input
              type="number"
              step="any"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
              value={latitude}
              placeholder={existing?.latitude ? String(existing.latitude) : ""}
              onChange={(e) => setLatitude(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
          <div>
            <label className="font-medium block">Longitude</label>
            <input
              type="number"
              step="any"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
              value={longitude}
              placeholder={existing?.longitude ? String(existing.longitude) : ""}
              onChange={(e) => setLongitude(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <label className="font-medium block mb-1">Foto Ruangan</label>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded shadow-sm cursor-pointer">
              <span className="text-sm text-gray-700">Pilih Foto</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </label>

            <div className="text-sm text-gray-600">
              {image?.name ?? "Belum ada file dipilih"}
            </div>

            <div className="w-32 h-24 bg-gray-100 rounded overflow-hidden border border-gray-300">
              <img
                src={preview ?? `${BASE_URL}${existing?.imageUrl ?? "/uploads/empty.jpeg"}`}
                alt="preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
      {/* Toast / Popup */}
      {toast && (
        <div className="fixed top-6 right-6 z-50">
          <div
            className={`max-w-sm w-full px-4 py-3 rounded shadow-lg text-white flex items-start gap-3 ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            <div className="flex-1">
              <div className="font-medium">{toast.type === "success" ? "Berhasil" : "Error"}</div>
              <div className="text-sm mt-1">{toast.message}</div>
            </div>
            <button
              className="opacity-90 text-xl leading-none"
              onClick={() => setToast(null)}
              aria-label="Tutup"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

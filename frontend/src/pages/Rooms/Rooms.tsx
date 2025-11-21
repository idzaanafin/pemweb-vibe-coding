import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = import.meta.env.VITE_BASE_URL;

interface Room {
  _id: string;
  name: string;
  location: string;
  capacity: number;
  imageUrl?: string;
}

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/rooms`)
      .then((res) => res.json())
      .then((data) => {
        setRooms(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="pt-32 text-center text-gray-700 text-lg">
        Memuat daftar ruangan...
      </div>
    );

  if (!loading && rooms.length === 0)
    return (
      <div className="pt-32 px-6 text-center max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Belum ada ruangan
        </h2>
        <p className="text-gray-500 mb-6">
          Admin belum menambahkan ruangan apa pun.
        </p>
        <img
          src={`${BASE_URL}/uploads/empty.jpeg`}
          alt="empty"
          className="w-52 mx-auto opacity-70"
        />
      </div>
    );

  return (
    <div className="pt-32 pb-10 px-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Daftar Ruangan</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((r) => (
          <Link
            to={`/rooms/${r._id}`}
            key={r._id}
            className="bg-white shadow-lg border rounded-xl overflow-hidden hover:shadow-xl transition"
          >
            <img
              src={`${BASE_URL}${r.imageUrl ?? `${BASE_URL}/uploads/room.png`}`}
              alt={r.name}
              className="h-40 w-full object-cover"
            />

            <div className="p-4">
              <h2 className="text-lg font-semibold">{r.name}</h2>
              <p className="text-sm text-gray-500">{r.location}</p>
              <p className="text-sm mt-1 text-orange-600 font-medium">
                Kapasitas: {r.capacity} orang
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

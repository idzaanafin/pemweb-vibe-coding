import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { BASE_URL, API_URL } from "../../config/api";

interface Room {
  _id: string;
  name: string;
  location: string;
  capacity: number;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

interface EventItem {
  _id?: string;
  name?: string;
  title?: string;
  start?: string; // ISO
  end?: string; // ISO
  user?: { name?: string } | null;
  reserverName?: string;
}

export default function RoomDetail() {
  const { id } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const weekStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date>(weekStart);
  const DAY_MS = 24 * 60 * 60 * 1000;
  const selectedDateIndex = Math.round((selectedDate.getTime() - weekStart.getTime()) / DAY_MS);

  useEffect(() => {
    fetch(`${API_URL}/rooms/${id}`)
      .then((res) => res.json())
      .then((data) => setRoom(data.data));
  }, [id]);

  // fetch events for this room for the next 7 days
  useEffect(() => {
    if (!id) return;
    setEventsLoading(true);

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7); // exclusive end

    const qs = `roomId=${encodeURIComponent(String(id))}&start=${encodeURIComponent(
      startDate.toISOString()
    )}&end=${encodeURIComponent(endDate.toISOString())}`;

    fetch(`${API_URL}/events?${qs}`)
      .then((res) => res.json())
      .then((data) => setEvents(Array.isArray(data.data) ? data.data : []))
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
  }, [id]);

  if (!room)
    return <div className="pt-32 text-center text-gray-700">Loading...</div>;

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <Link to="/rooms" className="text-sm text-gray-600 font-bold hover:underline">
          ← Kembali
        </Link>
      </div>
      <img
        src={`${BASE_URL}${room.imageUrl ?? "/uploads/room.png"}`}
        className="w-full h-64 object-cover rounded-xl shadow"
      />

      <h1 className="text-3xl font-bold text-gray-900 mt-6">{room.name}</h1>
      <div className="text-gray-600">
        {/* Location: clickable to open Google Maps search for the address */}
        <div>
          <span>{room.location}</span>
        </div>

        {/* Coordinates: if available, link directly to the lat,lng on Google Maps */}
        <div className="text-sm text-gray-500 mt-1">
          {typeof room.latitude === "number" && typeof room.longitude === "number" ? (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${room.latitude},${room.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Click to view on Google Maps
            </a>
          ) : (
            <span>Google maps URL: -</span>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2 text-gray-700">
        <p><strong>Kapasitas:</strong> {room.capacity} orang</p>
        <p><strong>Deskripsi:</strong> {room.description || "-"}</p>
      </div>

      {/* Single-day hourly view with pagination (prev/next within the fetched week) */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Jadwal (per jam)</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDate((prev) => {
                const nd = new Date(prev);
                nd.setDate(prev.getDate() - 1);
                nd.setHours(0,0,0,0);
                return nd;
              })}
              disabled={selectedDateIndex <= 0}
              className={`px-3 py-1 rounded border ${selectedDateIndex <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            >
              Sebelumnya
            </button>
            <div className="text-sm text-gray-600">{selectedDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}</div>
            <button
              onClick={() => setSelectedDate((prev) => {
                const nd = new Date(prev);
                nd.setDate(prev.getDate() + 1);
                nd.setHours(0,0,0,0);
                return nd;
              })}
              disabled={selectedDateIndex >= 6}
              className={`px-3 py-1 rounded border ${selectedDateIndex >= 6 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            >
              Berikutnya
            </button>
          </div>
        </div>

        {eventsLoading ? (
          <div className="text-sm text-gray-500">Memuat jadwal...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Array.from({ length: 24 }).map((_, hour) => {
              const slotStart = new Date(selectedDate);
              slotStart.setHours(hour, 0, 0, 0);
              const slotEnd = new Date(slotStart);
              slotEnd.setHours(hour + 1);

              const occupying = events.find((ev) => {
                if (!ev.start || !ev.end) return false;
                const s = new Date(ev.start);
                const e = new Date(ev.end);
                return s < slotEnd && e > slotStart;
              });

              const label = `${String(hour).padStart(2, "0")}:00 - ${String(hour + 1).padStart(2, "0")}:00`;
              const title = occupying?.name ?? occupying?.title ?? "Available";
              const reserver = occupying?.user?.name ?? occupying?.reserverName ?? null;

              return (
                <div key={hour} className="flex items-center justify-between p-3 bg-white border rounded">
                  <div className="text-sm text-gray-700">{label}</div>
                  <div className="text-sm">
                    {title === "Available" ? (
                      <span className="text-green-600 font-medium">Available</span>
                    ) : (
                      <div className="text-right">
                        <div className="font-medium">{title}</div>
                        {reserver && <div className="text-xs text-gray-500">oleh {reserver}</div>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Link
        to={`/rooms/${room._id}/reserve`}
        className="inline-block mt-6 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium"
      >
        Ajukan Reservasi
      </Link>
    </div>
  );
}

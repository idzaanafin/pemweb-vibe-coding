import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
} from "react-leaflet";
import L, { LatLngExpression, Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { API_URL } from "../../config/api";

type EventItem = {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  room?: {
    latitude: number;
    longitude: number;
    name: string;
  };
};

export default function Home() {
  const center = [-7.2793, 112.7975] as LatLngExpression;
  const [events, setEvents] = useState<EventItem[]>([]);
  const [routeCoords, setRouteCoords] = useState<LatLngExpression[]>([]);
  const [loading, setLoading] = useState(true);

  const mapRef = useRef<LeafletMap | null>(null);
  const markerRefs = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    fetch(`${API_URL}/events`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // open marker popup and center map
  const handleCardClick = (ev: EventItem) => {
    const lat = ev.room?.latitude;
    const lng = ev.room?.longitude;
    if (!lat || !lng) return;

    const map = mapRef.current;
    if (map) {
      map.setView([lat, lng], 17, { animate: true });
    }

    const marker = markerRefs.current[ev._id];
    if (marker) marker.openPopup();
  };

  // Calculate route using OSRM API (no API key)
  const handleRoute = async (lat: number, lng: number) => {
    if (!navigator.geolocation) return alert("GPS tidak tersedia.");

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const userLat = pos.coords.latitude;
      const userLng = pos.coords.longitude;

      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${lng},${lat}?overview=full&geometries=geojson`;

        const res = await fetch(url);
        const data = await res.json();

        const coords = data.routes[0].geometry.coordinates.map(
          (c: number[]) => [c[1], c[0]]
        );

        setRouteCoords(coords);
        mapRef.current?.fitBounds(coords);
      } catch (err) {
        alert("Gagal mengambil rute");
      }
    });
  };

  return (
    <div className="fixed top-0 bottom-[50px] left-0 right-0 z-0">
      <MapContainer
        className="w-full h-full"
        center={center}
        zoom={16}
        whenReady={(e) => (mapRef.current = e.target)}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Draw route if exists */}
        {routeCoords.length > 0 && (
          <Polyline positions={routeCoords} color="orange" weight={5} />
        )}

        {/* markers */}
        {events
          .filter((ev) => ev.room?.latitude && ev.room?.longitude)
          .map((ev) => {
            const lat = ev.room!.latitude;
            const lng = ev.room!.longitude;

            return (
              <Marker
                key={ev._id}
                position={[lat, lng]}
                ref={(ref) => {
                  if (ref) markerRefs.current[ev._id] = ref;
                }}
              >
                <Popup>
                  <div className="max-w-xs">
                    <div className="font-bold">{ev.title}</div>
                    <div className="text-xs">
                      {new Date(ev.startTime).toLocaleString()} –{" "}
                      {new Date(ev.endTime).toLocaleString()}
                    </div>

                    <button
                      onClick={() => handleRoute(lat, lng)}
                      className="mt-2 px-3 py-1 bg-orange-500 text-white rounded text-sm"
                    >
                      Rute ke sini
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* event list floating card */}
      <div className="fixed top-24 left-6 z-[9999] w-80 max-h-[60vh] overflow-hidden bg-white/95 backdrop-blur rounded-xl shadow-2xl">
        <div className="p-3 border-b text-lg font-semibold">Acara Hari Ini</div>

        <div className="p-3 overflow-y-auto max-h-[48vh] space-y-3">
          {loading ? (
            <div className="text-sm text-gray-500">Memuat...</div>
          ) : events.length === 0 ? (
            <div className="text-sm text-gray-500">Tidak ada acara.</div>
          ) : (
            events.map((e) => (
              <div
                key={e._id}
                className="p-3 bg-white rounded-xl shadow hover:shadow-md cursor-pointer"
                onClick={() => handleCardClick(e)}
              >
                <div className="text-sm font-bold">{e.title}</div>
                <div className="text-xs text-gray-600">
                  {new Date(e.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </div>
                {e.room && (
                  <div className="text-xs text-gray-400 mt-1">
                    {e.room.latitude.toFixed(4)}, {e.room.longitude.toFixed(4)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

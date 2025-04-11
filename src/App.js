import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function App() {
  const [activities, setActivities] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    fetch("/activities")
      .then((res) => res.json())
      .then((data) => setActivities(data));
  }, []);

  return (
    <div className="w-full h-screen grid grid-cols-2">
      <div className="relative">
        <MapContainer center={[55.0, 23.0]} zoom={7} className="w-full h-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {selectedRoute && (
            <Polyline positions={selectedRoute} color="blue" />
          )}
        </MapContainer>

        <select
          className="absolute top-4 left-4 z-[1000] p-2 bg-white rounded"
          onChange={(e) => {
            const idx = e.target.value;
            setSelectedRoute(activities[idx]?.coords);
          }}
        >
          <option>Pasirink maršrutą</option>
          {activities.map((act, i) => (
            <option key={i} value={i}>
              {act.name}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full h-full">
        <iframe
          width="100%"
          height="100%"
          src="https://embed.windy.com/embed2.html?lat=55.0&lon=23.0&zoom=6&level=surface&overlay=wind&menu=&message=&marker=&calendar=&pressure=&type=map&location=coordinates&detail=&detailLat=55.0&detailLon=23.0&metricWind=default&metricTemp=default&radarRange=-1"
          frameBorder="0"
        ></iframe>
      </div>
    </div>
  );
}
"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export function PlantMap({
  latitude,
  longitude,
  label,
}: {
  latitude: number;
  longitude: number;
  label: string;
}) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={12}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      boxZoom={false}
      keyboard={false}
      touchZoom={false}
      zoomControl={false}
      attributionControl={true}
      style={{ height: "144px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker center={[latitude, longitude]} pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.8 }} radius={8}>
        <Tooltip direction="top" offset={[0, -8]} permanent>
          {label}
        </Tooltip>
      </CircleMarker>
    </MapContainer>
  );
}

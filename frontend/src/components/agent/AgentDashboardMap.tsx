"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type * as L from "leaflet";
import "leaflet/dist/leaflet.css";

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);

interface AgentDashboardMapProps {
  currentLocation: { lat: number; lng: number } | null;
  assignments: Array<{
    id: string;
    location: {
      address: string;
      coordinates: { lat: number; lng: number };
    };
    title: string;
    status: string;
  }>;
}

const AgentDashboardMap = ({
  currentLocation,
  assignments,
}: AgentDashboardMapProps) => {
  const [mounted, setMounted] = useState(false);
  const [customIcon, setCustomIcon] = useState<L.Icon | null>(null);
  const [currentLocationIcon, setCurrentLocationIcon] = useState<L.Icon | null>(null);
  const [completedIcon, setCompletedIcon] = useState<L.Icon | null>(null);

  useEffect(() => {
    setMounted(true);

    // Initialize Leaflet icons after component mounts
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const L = require("leaflet");

      // Fix for default marker icon
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      // Custom icon for assignments
      const assignmentIcon = new L.Icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // Custom icon for current location
      const currentIcon = new L.Icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // Custom icon for completed assignments
      const doneIcon = new L.Icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      setCustomIcon(assignmentIcon);
      setCurrentLocationIcon(currentIcon);
      setCompletedIcon(doneIcon);
    }
  }, []);

  // Default center (Colombo, Sri Lanka)
  const defaultCenter: [number, number] = [6.9271, 79.8612];
  const center: [number, number] = currentLocation
    ? [currentLocation.lat, currentLocation.lng]
    : defaultCenter;

  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Current Location Marker with Circle */}
        {currentLocation && currentLocationIcon && (
          <>
            <Marker
              position={[currentLocation.lat, currentLocation.lng]}
              icon={currentLocationIcon}
            >
              <Popup>
                <div className="text-sm">
                  <strong>Your Current Location</strong>
                  <br />
                  Lat: {currentLocation.lat.toFixed(4)}
                  <br />
                  Lng: {currentLocation.lng.toFixed(4)}
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[currentLocation.lat, currentLocation.lng]}
              radius={500}
              pathOptions={{
                fillColor: "blue",
                fillOpacity: 0.1,
                color: "blue",
                weight: 2,
              }}
            />
          </>
        )}

        {/* Assignment Markers */}
        {assignments.map((assignment) => {
          const isCompleted = assignment.status === "completed";
          const icon = isCompleted ? completedIcon : customIcon;

          return (
            icon && (
              <Marker
                key={assignment.id}
                position={[
                  assignment.location.coordinates.lat,
                  assignment.location.coordinates.lng,
                ]}
                icon={icon}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{assignment.title}</strong>
                    <br />
                    {assignment.location.address}
                    <br />
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
                        isCompleted
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {assignment.status}
                    </span>
                  </div>
                </Popup>
              </Marker>
            )
          );
        })}
      </MapContainer>
    </div>
  );
};

export default AgentDashboardMap;

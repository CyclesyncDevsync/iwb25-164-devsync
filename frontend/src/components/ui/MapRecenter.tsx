import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface MapRecenterProps {
  center: [number, number];
}

/**
 * Component to recenter the map when center prop changes
 * This fixes the issue where map doesn't update when data loads
 */
export function MapRecenter({ center }: MapRecenterProps) {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] && center[1] && map) {
      // Add a small delay to ensure the map is fully initialized
      const timer = setTimeout(() => {
        try {
          map.setView(center, map.getZoom());
        } catch (error) {
          console.error("Error setting map view:", error);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [center, map]);

  return null;
}

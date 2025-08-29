'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';

interface InteractiveLocationMapProps {
  center: { lat: number; lng: number };
  markerPosition: { lat: number; lng: number } | null;
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function InteractiveLocationMap({ 
  center, 
  markerPosition, 
  onLocationSelect 
}: InteractiveLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localMarker, setLocalMarker] = useState(markerPosition);

  useEffect(() => {
    setLocalMarker(markerPosition);
  }, [markerPosition]);

  // Convert lat/lng to pixel coordinates
  const latLngToPixel = (lat: number, lng: number, mapWidth: number, mapHeight: number) => {
    // Calculate the bounds shown in the map
    const bounds = {
      north: center.lat + 0.02,
      south: center.lat - 0.02,
      east: center.lng + 0.02,
      west: center.lng - 0.02
    };
    
    // Convert to pixel coordinates
    const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * mapWidth;
    const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * mapHeight;
    
    return { x, y };
  };

  // Convert pixel to lat/lng coordinates
  const pixelToLatLng = (x: number, y: number, mapWidth: number, mapHeight: number) => {
    // Calculate the bounds shown in the map
    const bounds = {
      north: center.lat + 0.02,
      south: center.lat - 0.02,
      east: center.lng + 0.02,
      west: center.lng - 0.02
    };
    
    // Convert pixel to lat/lng
    const lng = bounds.west + (x / mapWidth) * (bounds.east - bounds.west);
    const lat = bounds.north - (y / mapHeight) * (bounds.north - bounds.south);
    
    return { lat, lng };
  };

  // Handle map click to place marker
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;

    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const { lat, lng } = pixelToLatLng(x, y, rect.width, rect.height);
    setLocalMarker({ lat, lng });
    onLocationSelect(lat, lng);
  };

  // Create map URL WITHOUT marker (we'll use our custom one)
  const getMapUrl = () => {
    const baseUrl = 'https://www.openstreetmap.org/export/embed.html';
    const bbox = [
      center.lng - 0.02,
      center.lat - 0.02,
      center.lng + 0.02,
      center.lat + 0.02
    ].join(',');

    // Don't include marker in URL - we'll overlay our own
    return `${baseUrl}?bbox=${bbox}&layer=mapnik`;
  };

  return (
    <div className="relative rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
      {/* Map Container */}
      <div 
        ref={mapRef}
        className="relative cursor-crosshair"
        onClick={handleMapClick}
        style={{ height: '400px' }}
      >
        {/* OpenStreetMap iframe */}
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={getMapUrl()}
          style={{ pointerEvents: 'none' }}
          className="absolute inset-0"
        />

        {/* Custom Marker Overlay */}
        {localMarker && mapRef.current && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-full cursor-move z-10"
            style={{
              left: `${latLngToPixel(
                localMarker.lat, 
                localMarker.lng, 
                mapRef.current.offsetWidth, 
                mapRef.current.offsetHeight
              ).x}px`,
              top: `${latLngToPixel(
                localMarker.lat, 
                localMarker.lng, 
                mapRef.current.offsetWidth, 
                mapRef.current.offsetHeight
              ).y}px`
            }}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move';
              setIsDragging(true);
            }}
            onDragEnd={(e) => {
              e.preventDefault();
              const rect = mapRef.current?.getBoundingClientRect();
              if (!rect) return;

              // Get the final position
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              
              const { lat, lng } = pixelToLatLng(x, y, rect.width, rect.height);
              setLocalMarker({ lat, lng });
              onLocationSelect(lat, lng);
              setIsDragging(false);
            }}
            onDrag={(e) => {
              e.preventDefault();
              if (!mapRef.current) return;
              
              const rect = mapRef.current.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              
              // Update visual position during drag
              const marker = e.target as HTMLElement;
              if (marker && marker.parentElement) {
                marker.parentElement.style.left = `${x}px`;
                marker.parentElement.style.top = `${y}px`;
              }
            }}
          >
            <div className="relative pointer-events-none">
              <MapPinIcon className="w-8 h-8 text-red-600 drop-shadow-lg" />
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-600 rounded-full shadow-lg" />
            </div>
          </div>
        )}

        {/* Click instruction overlay */}
        {!localMarker && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
              Click on the map to place a marker
            </div>
          </div>
        )}
      </div>


      {/* Instructions */}
      <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 p-2 rounded text-xs">
        <p className="text-gray-700 dark:text-gray-300">
          • Click anywhere on the map to place a marker
          • Drag the marker to adjust the location
        </p>
      </div>
    </div>
  );
}
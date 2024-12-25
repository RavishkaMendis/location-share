import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LocationMap = ({ myLocation, otherLocation }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({
    me: null,
    other: null
  });

  useEffect(() => {
    // Initialize map if it doesn't exist
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([0, 0], 2);
      
      // Add dark theme map tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);

      // Create custom markers
      const createMarkerIcon = (color) => {
        return L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background-color: ${color};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 10px rgba(0,0,0,0.5)
          "></div>`,
        });
      };

      // Initialize markers
      markersRef.current.me = L.marker([0, 0], {
        icon: createMarkerIcon('#00ff9d')
      }).addTo(mapInstanceRef.current);
      
      markersRef.current.other = L.marker([0, 0], {
        icon: createMarkerIcon('#ff3b3b')
      }).addTo(mapInstanceRef.current);
    }

    // Update markers when locations change
    if (mapInstanceRef.current) {
      if (myLocation?.latitude && myLocation?.longitude) {
        markersRef.current.me.setLatLng([myLocation.latitude, myLocation.longitude]);
      }
      
      if (otherLocation?.latitude && otherLocation?.longitude) {
        markersRef.current.other.setLatLng([otherLocation.latitude, otherLocation.longitude]);
      }

      // Fit bounds to show both markers
      if (myLocation && otherLocation) {
        const bounds = L.latLngBounds(
          [myLocation.latitude, myLocation.longitude],
          [otherLocation.latitude, otherLocation.longitude]
        );
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [myLocation, otherLocation]);

  return <div ref={mapRef} style={{ height: '100vh', width: '100%' }} />;
};

export default LocationMap;
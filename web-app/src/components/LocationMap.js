import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LocationMap = ({ myLocation, otherLocation }) => {
  console.log('LocationMap render:', { myLocation, otherLocation });

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({
    me: null,
    other: null
  });

  // Initialize map
  useEffect(() => {
    console.log('Map initialization');
    if (!mapInstanceRef.current && mapRef.current) {
      // Set initial view to a default location
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [0, 0],
        zoom: 2,
        zoomControl: true,
        attributionControl: true
      });

      // Add dark theme map tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
        subdomains: 'abcd'
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
            border: 3px solid white;
            box-shadow: 0 0 10px rgba(0,0,0,0.5)
          "></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
      };

      // Initialize markers with default positions
      markersRef.current.me = L.marker([0, 0], {
        icon: createMarkerIcon('#00ff9d')
      }).addTo(mapInstanceRef.current);
      
      markersRef.current.other = L.marker([0, 0], {
        icon: createMarkerIcon('#ff3b3b')
      }).addTo(mapInstanceRef.current);
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array for initialization

  // Update markers and view when locations change
  useEffect(() => {
    console.log('Location update:', { myLocation, otherLocation });
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    
    if (myLocation?.latitude && myLocation?.longitude) {
      markersRef.current.me.setLatLng([myLocation.latitude, myLocation.longitude]);
      markersRef.current.me.bindPopup('You are here').openPopup();
    }
    
    if (otherLocation?.latitude && otherLocation?.longitude) {
      markersRef.current.other.setLatLng([otherLocation.latitude, otherLocation.longitude]);
      markersRef.current.other.bindPopup('Other user').openPopup();
    }

    // Fit bounds if both locations are available
    if (myLocation && otherLocation) {
      const bounds = L.latLngBounds(
        [myLocation.latitude, myLocation.longitude],
        [otherLocation.latitude, otherLocation.longitude]
      ).pad(0.1); // Add 10% padding around the bounds
      map.fitBounds(bounds);
    } else if (myLocation) {
      // If only my location is available, center on it
      map.setView([myLocation.latitude, myLocation.longitude], 15);
    }

  }, [myLocation, otherLocation]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height: '100%', 
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: '#242424'
      }} 
    />
  );
};

export default LocationMap;
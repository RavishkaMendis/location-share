import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Add this color generation function
function generateColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF)
    .toString(16)
    .toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
}

const LocationMap = ({ myLocation, users, selectedUser }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef(new Map());
  const initialBoundsSet = useRef(false);
  const lastSelectedUser = useRef(null);

  // Initialize map
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [0, 0],
        zoom: 2,
        zoomControl: true,
        attributionControl: true
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle zoom and bounds separately from marker updates
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Only update view when selected user changes
    if (selectedUser?.location && selectedUser !== lastSelectedUser.current) {
      map.setView(
        [selectedUser.location.latitude, selectedUser.location.longitude],
        15,
        { animate: true }
      );
      lastSelectedUser.current = selectedUser;
    } else if (!initialBoundsSet.current) {
      const allLocations = [
        myLocation,
        ...users.filter(u => u.location).map(u => u.location)
      ].filter(Boolean);

      if (allLocations.length > 0) {
        const bounds = L.latLngBounds(
          allLocations.map(loc => [loc.latitude, loc.longitude])
        ).pad(0.1);
        map.fitBounds(bounds);
        initialBoundsSet.current = true;
      }
    }
  }, [myLocation, users, selectedUser]);

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const currentMarkers = new Set();

    // Update or create marker for current user
    if (myLocation) {
      const myMarker = markersRef.current.get('currentUser') || createMarker('You', '#00ff9d');
      myMarker.setLatLng([myLocation.latitude, myLocation.longitude]);
      currentMarkers.add('currentUser');
    }

    // Update or create markers for other users
    users.forEach(user => {
      if (user.location) {
        const userColor = user.color || generateColor(user.username);
        const marker = markersRef.current.get(user.username) || createMarker(user.username, userColor);
        marker.setLatLng([user.location.latitude, user.location.longitude]);
        currentMarkers.add(user.username);
      }
    });

    // Remove old markers
    markersRef.current.forEach((marker, key) => {
      if (!currentMarkers.has(key)) {
        map.removeLayer(marker);
        markersRef.current.delete(key);
      }
    });

    function createMarker(username, color) {
      const marker = L.marker([0, 0], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${color};
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 0 10px rgba(0,0,0,0.5)
            "></div>
            <div style="
              color: white;
              background-color: rgba(0,0,0,0.7);
              padding: 2px 6px;
              border-radius: 10px;
              font-size: 12px;
              margin-top: 4px;
              text-align: center;
            ">${username}</div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        })
      }).addTo(map);

      markersRef.current.set(username, marker);
      return marker;
    }

  }, [myLocation, users]);

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
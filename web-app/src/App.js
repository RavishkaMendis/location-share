import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const LocationMap = ({ myLocation, partnerLocation }) => {
  const [distance, setDistance] = useState(null);

  // Calculate center position between two points
  const calculateMapCenter = () => {
    if (!myLocation?.latitude || !partnerLocation?.latitude) {
      return [0, 0];
    }
    return [
      (myLocation.latitude + partnerLocation.latitude) / 2,
      (myLocation.longitude + partnerLocation.longitude) / 2
    ];
  };

  // Calculate distance between points
  useEffect(() => {
    if (myLocation && partnerLocation) {
      const R = 6371; // Earth's radius in km
      const dLat = (partnerLocation.latitude - myLocation.latitude) * Math.PI / 180;
      const dLon = (partnerLocation.longitude - myLocation.longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(myLocation.latitude * Math.PI / 180) * Math.cos(partnerLocation.latitude * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const d = R * c;
      setDistance(d.toFixed(1));
    }
  }, [myLocation, partnerLocation]);

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Distance Display */}
      <div className="bg-gray-800 text-white p-4 text-center">
        {distance ? (
          <p className="text-xl">Distance apart: {distance} km</p>
        ) : (
          <p className="text-xl">Waiting for locations...</p>
        )}
      </div>

      {/* Map Container */}
      <div className="flex-1">
        <MapContainer
          center={calculateMapCenter()}
          zoom={12}
          className="w-full h-full"
          style={{ background: '#2e2e2e' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* My Location Dot */}
          {myLocation && (
            <Circle
              center={[myLocation.latitude, myLocation.longitude]}
              radius={100}
              pathOptions={{ color: 'black', fillColor: 'black', fillOpacity: 0.7 }}
            >
              <Popup>Your Location</Popup>
            </Circle>
          )}

          {/* Partner Location Dot */}
          {partnerLocation && (
            <Circle
              center={[partnerLocation.latitude, partnerLocation.longitude]}
              radius={100}
              pathOptions={{ color: 'pink', fillColor: 'pink', fillOpacity: 0.7 }}
            >
              <Popup>Partner's Location</Popup>
            </Circle>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default LocationMap;
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Component to handle map center updates
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

const LocationMap = ({ myLocation, partnerLocation }) => {
  const mapRef = useRef(null);
  const defaultCenter = [0, 0];
  const defaultZoom = 13;

  // Calculate center based on available locations
  const getMapCenter = () => {
    if (myLocation) {
      return [myLocation.latitude, myLocation.longitude];
    }
    return defaultCenter;
  };

  return (
    <div className="map-container">
      <MapContainer
        center={getMapCenter()}
        zoom={defaultZoom}
        className="map"
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark-map"
        />
        
        <MapUpdater center={myLocation ? [myLocation.latitude, myLocation.longitude] : null} />
        
        {myLocation && (
          <Circle
            center={[myLocation.latitude, myLocation.longitude]}
            radius={100}
            pathOptions={{ 
              color: '#00ff9d',
              fillColor: '#00ff9d',
              fillOpacity: 0.7 
            }}
          >
            <Popup className="custom-popup">You</Popup>
          </Circle>
        )}

        {partnerLocation && (
          <Circle
            center={[partnerLocation.latitude, partnerLocation.longitude]}
            radius={100}
            pathOptions={{ 
              color: '#ff00ff',
              fillColor: '#ff00ff',
              fillOpacity: 0.7 
            }}
          >
            <Popup className="custom-popup">Partner</Popup>
          </Circle>
        )}
      </MapContainer>
    </div>
  );
};

export default LocationMap;
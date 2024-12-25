import React from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const LocationMap = ({ myLocation, partnerLocation }) => {
  const defaultCenter = [0, 0];
  const defaultZoom = 12;

  return (
    <div className="map-container">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="map"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark-map"
        />
        
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
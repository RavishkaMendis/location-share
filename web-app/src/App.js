import React, { useState, useEffect } from 'react';
import LocationMap from './components/LocationMap';
import StatusBar from './components/StatusBar';
import DistanceDisplay from './components/DistanceDisplay';
import './styles/index.css';

function App() {
  const [myLocation, setMyLocation] = useState(null);
  const [partnerLocation, setPartnerLocation] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    // First, get initial location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        console.log('Initial location:', location);
        setMyLocation(location);
      },
      (error) => {
        console.error('Location error:', error);
        alert('Please enable location access in your browser settings to use this app.');
      },
      { enableHighAccuracy: true }
    );

    // Then set up WebSocket
    const ws = new WebSocket('wss://location-share-ww81.onrender.com');
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnectionStatus('connected');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnectionStatus('disconnected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'location' && data.sender !== 'me') {
          console.log('Received partner location:', data.location);
          setPartnerLocation(data.location);
        }
      } catch (e) {
        console.error('Message parsing error:', e);
      }
    };

    // Set up continuous location watching
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        console.log('Location update:', location);
        setMyLocation(location);
        
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'location',
            sender: 'me',
            location
          }));
        }
      },
      (error) => {
        console.error('Watch position error:', error);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      ws.close();
    };
  }, []);

  return (
    <div className="app-container">
      <StatusBar status={connectionStatus} />
      <DistanceDisplay 
        myLocation={myLocation}
        partnerLocation={partnerLocation}
      />
      <div className="map-wrapper">
        <LocationMap
          myLocation={myLocation}
          partnerLocation={partnerLocation}
        />
      </div>
    </div>
  );
}

export default App;
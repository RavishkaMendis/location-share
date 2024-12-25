import React, { useState, useEffect } from 'react';
import LocationMap from './components/LocationMap';
import DistanceDisplay from './components/DistanceDisplay';
import './App.css';

function App() {
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const [myLocation, setMyLocation] = useState(null);
  const [otherLocation, setOtherLocation] = useState(null);

  useEffect(() => {
    // Connect to WebSocket
    const websocket = new WebSocket('wss://location-share-ww81.onrender.com');
    
    websocket.onopen = () => {
      setConnected(true);
      console.log('Connected to server');
    };

    websocket.onclose = () => {
      setConnected(false);
      console.log('Disconnected from server');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'location' && data.sender !== 'self') {
        setOtherLocation(data.location);
      }
    };

    setWs(websocket);

    // Start watching location
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setMyLocation(newLocation);
        
        if (websocket.readyState === WebSocket.OPEN) {
          websocket.send(JSON.stringify({
            type: 'location',
            location: newLocation,
            sender: 'self'
          }));
        }
      },
      (error) => console.error('Error getting location:', error),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      websocket.close();
    };
  }, []);

  return (
    <div className="app">
      <div className="status-bar">
        <span className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? 'CONNECTED' : 'DISCONNECTED'}
        </span>
      </div>
      
      <LocationMap myLocation={myLocation} otherLocation={otherLocation} />
      
      <div className="distance-container">
        <DistanceDisplay myLocation={myLocation} otherLocation={otherLocation} />
      </div>
    </div>
  );
}

export default App;
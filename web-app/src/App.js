import React, { useState, useEffect } from 'react';
import LocationMap from './components/LocationMap';
import './App.css';

function App() {
  const [socket, setSocket] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [partnerLocation, setPartnerLocation] = useState(null);

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket('wss://location-share-ww81.onrender.com');
    
    ws.onopen = () => {
      // Check if connection is actually working with a ping
      try {
        ws.send(JSON.stringify({ type: 'ping' }));
      } catch (e) {
        alert('WebSocket connection blocked. Please disable Brave Shields for this site or set them to "Basic" mode.');
      }
      console.log('Connected to WebSocket');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'location' && data.sender !== 'me') {
        setPartnerLocation(data.location);
      }
    };

    // Get and send location updates
    const watchId = navigator.geolocation ? 
      navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
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
          if (error.code === error.PERMISSION_DENIED) {
            alert('Please enable location permissions in your Brave browser settings to use this app.');
          } else {
            console.error('Error getting location:', error);
          }
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      )
      : (() => {
          alert('Geolocation is not supported by your browser');
          return null;
        })();

    return () => {
      navigator.geolocation.clearWatch(watchId);
      ws.close();
    };
  }, []);

  return (
    <div className="App bg-gray-900 min-h-screen">
      <LocationMap
        myLocation={myLocation}
        partnerLocation={partnerLocation}
      />
    </div>
  );
}

export default App;
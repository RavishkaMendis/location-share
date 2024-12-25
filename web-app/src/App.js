// web-app/src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { useLocationPermission } from './hooks/useLocationPermission';

function App() {
  const [location, setLocation] = useState(null);
  const [partnerLocation, setPartnerLocation] = useState(null);
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const ws = useRef(null);
  const userId = useRef(`web-${Math.random().toString(36).substr(2, 9)}`);
  const { hasPermission, requestPermission } = useLocationPermission();
  
  useEffect(() => {
    if (hasPermission) {
      setupLocationTracking();
    }
  }, [hasPermission]);

  useEffect(() => {
    setupWebSocket();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const setupWebSocket = () => {
    ws.current = new WebSocket('wss://location-share-ww81.onrender.com');
    
    ws.current.onopen = () => {
      setIsConnected(true);
      ws.current.send(JSON.stringify({
        type: 'register',
        userId: userId.current
      }));
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      setTimeout(setupWebSocket, 3000); // Reconnect attempt
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'location') {
        setPartnerLocation(data.location);
      }
    };
  };

  const setupLocationTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setLocation(newLocation);
        
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
            type: 'location',
            userId: userId.current,
            location: newLocation
          }));
        }
      },
      (error) => {
        setError(`Error getting location: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );
  };

  const sendMessage = () => {
    if (message.trim() && ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'message',
        userId: userId.current,
        text: message
      }));
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto space-y-4">
        {!hasPermission ? (
          <button
            onClick={requestPermission}
            className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
          >
            Enable Location Sharing
          </button>
        ) : (
          <>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Status</h2>
              <p className="text-sm">
                Connection: {isConnected ? (
                  <span className="text-green-500">Connected</span>
                ) : (
                  <span className="text-red-500">Disconnected</span>
                )}
              </p>
              {location && (
                <p className="text-sm">
                  Your location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              )}
              {partnerLocation && (
                <p className="text-sm">
                  Partner location: {partnerLocation.latitude.toFixed(6)}, {partnerLocation.longitude.toFixed(6)}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg"
                placeholder="Type emergency message..."
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
              >
                Send
              </button>
            </div>
          </>
        )}
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
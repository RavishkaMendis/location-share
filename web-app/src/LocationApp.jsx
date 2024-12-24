import React, { useState, useEffect, useRef } from 'react';

// Update this with your Render.com URL
const WEBSOCKET_URL = 'wss://your-render-app.onrender.com';

export default function LocationApp() {
  const [location, setLocation] = useState(null);
  const [partnerLocation, setPartnerLocation] = useState(null);
  const [message, setMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [installPrompt, setInstallPrompt] = useState(false);
  const ws = useRef(null);
  const userId = useRef(`ios-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // Check if running as standalone PWA
    if (window.navigator.standalone) {
      console.log('Running as PWA');
    } else {
      setInstallPrompt(true);
    }

    // Request location permission
    if ('geolocation' in navigator) {
      navigator.geolocation.requestPermission?.()
        .then(permission => {
          if (permission === 'granted') {
            startLocationTracking();
          }
        })
        .catch(error => console.log('Permission request error:', error));
    }

    setupWebSocket();
    return () => ws.current?.close();
  }, []);

  const setupWebSocket = () => {
    ws.current = new WebSocket(WEBSOCKET_URL);
    
    ws.current.onopen = () => {
      setConnectionStatus('connected');
      ws.current.send(JSON.stringify({
        type: 'register',
        userId: userId.current
      }));
    };

    ws.current.onclose = () => {
      setConnectionStatus('disconnected');
      setTimeout(setupWebSocket, 3000);
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'location') {
        setPartnerLocation(data.location);
      }
    };
  };

  const startLocationTracking = () => {
    navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        setLocation(newLocation);
        sendLocation(newLocation);
      },
      (error) => console.error('Location error:', error),
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
      }
    );
  };

  const sendLocation = (locationData) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'location',
        userId: userId.current,
        location: locationData
      }));
    }
  };

  const sendMessage = () => {
    if (message.trim() && ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'message',
        userId: userId.current,
        text: message.trim()
      }));
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {installPrompt && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 p-4 text-center">
          Install this app: tap ⎘ then "Add to Home Screen" →
        </div>
      )}
      
      <div className="p-4 max-w-xl mx-auto space-y-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h1 className="text-xl font-bold mb-2">Location Sharing</h1>
          <div className="space-y-2">
            <div className={`text-sm ${connectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
              Status: {connectionStatus}
            </div>
            {location && (
              <div className="text-sm">
                Your location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </div>
            )}
            {partnerLocation && (
              <div className="text-sm">
                Partner's location: {partnerLocation.latitude.toFixed(6)}, {partnerLocation.longitude.toFixed(6)}
              </div>
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-800">
          <div className="max-w-xl mx-auto flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Emergency message..."
              className="flex-1 bg-gray-700 rounded-lg px-4 py-2"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 px-4 py-2 rounded-lg"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import LocationMap from './components/LocationMap';
import DistanceDisplay from './components/DistanceDisplay';
import './App.css';

function App() {
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const [myLocation, setMyLocation] = useState(null);
  const [otherLocation, setOtherLocation] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [showJoinDialog, setShowJoinDialog] = useState(true);
  const [inputSessionId, setInputSessionId] = useState('');

  useEffect(() => {
    const websocket = new WebSocket('wss://location-share-ww81.onrender.com');
    
    websocket.onopen = () => {
      setConnected(true);
      console.log('Connected to server');
    };

    websocket.onclose = () => {
      setConnected(false);
      setSessionId(null);
      console.log('Disconnected from server');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'session_created':
        case 'session_joined':
          setSessionId(data.sessionId);
          setShowJoinDialog(false);
          break;
        case 'location':
          if (data.sender !== 'self') {
            setOtherLocation(data.location);
          }
          break;
        default:
          break;
      }
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setMyLocation(newLocation);
        
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'location',
            location: newLocation,
            sender: 'self',
            sessionId: sessionId
          }));
        }
      },
      (error) => {
        console.error('Location error:', error);
        alert('Please enable location access to use this app.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [ws, sessionId]);

  const handleCreateSession = () => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'create_session' }));
    }
  };

  const handleJoinSession = () => {
    if (ws?.readyState === WebSocket.OPEN && inputSessionId) {
      ws.send(JSON.stringify({ 
        type: 'join_session', 
        sessionId: inputSessionId 
      }));
    }
  };

  return (
    <div className="app">
      {showJoinDialog ? (
        <div className="session-dialog">
          <div className="session-container">
            <h2>Location Sharing</h2>
            <button className="create-button" onClick={handleCreateSession}>
              Create New Session
            </button>
            <div className="join-section">
              <input
                type="text"
                placeholder="Enter 6-digit session code"
                value={inputSessionId}
                onChange={(e) => setInputSessionId(e.target.value.toUpperCase())}
                maxLength={6}
              />
              <button onClick={handleJoinSession}>Join Session</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="status-bar">
            <span className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
              {connected ? `CONNECTED - Session: ${sessionId}` : 'DISCONNECTED'}
            </span>
          </div>
          
          <div className="map-container">
            <LocationMap myLocation={myLocation} otherLocation={otherLocation} />
          </div>
          
          <div className="distance-container">
            <DistanceDisplay myLocation={myLocation} otherLocation={otherLocation} />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
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
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
          if (data.users) {
            setUsers(data.users);
          }
          setShowJoinDialog(false);
          break;
        case 'users_update':
          setUsers(data.users);
          break;
        case 'location_update':
          setUsers(prev => prev.map(user => 
            user.username === data.username 
              ? { ...user, location: data.location, online: data.online }
              : user
          ));
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
    if (ws?.readyState === WebSocket.OPEN && username) {
      ws.send(JSON.stringify({ 
        type: 'create_session',
        username: username
      }));
    }
  };

  const handleJoinSession = () => {
    if (ws?.readyState === WebSocket.OPEN && inputSessionId && username) {
      ws.send(JSON.stringify({ 
        type: 'join_session',
        sessionId: inputSessionId,
        username: username
      }));
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app">
      {showJoinDialog ? (
        <div className="session-dialog">
          <div className="session-container">
            <h2>Location Sharing</h2>
            <input
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="username-input"
            />
            <button 
              className="create-button" 
              onClick={handleCreateSession}
              disabled={!username}
            >
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
              <button 
                onClick={handleJoinSession}
                disabled={!username || !inputSessionId}
              >
                Join Session
              </button>
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
          
          <button 
            className="sidebar-toggle" 
            onClick={toggleSidebar}
            aria-label="Toggle users sidebar"
          >
            <div className={`hamburger ${sidebarOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
          
          <div className={`users-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
            <h3>Users in Session</h3>
            <div className="users-list">
              {users.map(user => (
                <div 
                  key={user.username}
                  className={`user-item ${user.online ? 'online' : 'offline'} ${selectedUser?.username === user.username ? 'selected' : ''}`}
                  onClick={() => handleUserSelect(user)}
                >
                  <span className="user-name">{user.username}</span>
                  <span className="user-status">{user.online ? 'Online' : 'Last seen'}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="map-container">
            <LocationMap 
              myLocation={myLocation}
              users={users}
              selectedUser={selectedUser}
            />
          </div>
          
          <div className="distance-container">
            {selectedUser ? (
              <DistanceDisplay 
                myLocation={myLocation}
                otherLocation={selectedUser.location}
                username={selectedUser.username}
              />
            ) : (
              <span className="select-user-prompt">
                Select a user to see distance
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
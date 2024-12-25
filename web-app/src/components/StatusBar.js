import React from 'react';

const StatusBar = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'disconnected':
        return 'bg-red-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <div className="status-bar">
      <div className="status-indicator">
        <span className={`status-dot ${getStatusColor()}`} />
        <span className="status-text">{status.toUpperCase()}</span>
      </div>
    </div>
  );
};

export default StatusBar;
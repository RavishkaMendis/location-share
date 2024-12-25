import React from 'react';

const DistanceDisplay = ({ myLocation, otherLocation, username }) => {
  const calculateDistance = () => {
    if (!myLocation || !otherLocation) return null;

    // Haversine formula to calculate distance between two points
    const R = 6371; // Earth's radius in km
    const lat1 = myLocation.latitude * Math.PI / 180;
    const lat2 = otherLocation.latitude * Math.PI / 180;
    const dLat = (otherLocation.latitude - myLocation.latitude) * Math.PI / 180;
    const dLon = (otherLocation.longitude - myLocation.longitude) * Math.PI / 180;

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
             Math.cos(lat1) * Math.cos(lat2) *
             Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return distance.toFixed(2);
  };

  const distance = calculateDistance();

  return (
    <div className="distance-display">
      {distance ? (
        <span className="distance-text">
          {distance} km from {username}
        </span>
      ) : (
        <span className="waiting-text">
          {username ? `Waiting for ${username}'s location...` : 'Select a user to see distance'}
        </span>
      )}
    </div>
  );
};

export default DistanceDisplay;
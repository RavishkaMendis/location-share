import React, { useEffect, useState } from 'react';

const DistanceDisplay = ({ myLocation, partnerLocation }) => {
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    if (myLocation && partnerLocation) {
      const R = 6371; // Earth's radius in km
      const dLat = (partnerLocation.latitude - myLocation.latitude) * Math.PI / 180;
      const dLon = (partnerLocation.longitude - myLocation.longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(myLocation.latitude * Math.PI / 180) * Math.cos(partnerLocation.latitude * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const d = R * c;
      setDistance(d.toFixed(1));
    }
  }, [myLocation, partnerLocation]);

  return (
    <div className="distance-display">
      <div className="distance-container">
        <div className="distance-value">
          {distance ? `${distance} km` : '-- km'}
        </div>
        <div className="distance-label">DISTANCE</div>
      </div>
    </div>
  );
};

export default DistanceDisplay;
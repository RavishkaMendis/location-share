// web-app/src/hooks/useLocationPermission.js
import { useState, useEffect } from 'react';

export const useLocationPermission = () => {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      setHasPermission(result.state === 'granted');
      
      result.addEventListener('change', () => {
        setHasPermission(result.state === 'granted');
      });
    } catch (error) {
      console.error('Error checking permission:', error);
    }
  };

  const requestPermission = () => {
    navigator.geolocation.getCurrentPosition(
      () => setHasPermission(true),
      () => setHasPermission(false),
      { enableHighAccuracy: true }
    );
  };

  return { hasPermission, requestPermission };
};
useEffect(() => {
    console.log('Checking browser environment...');
    console.log('UserAgent:', navigator.userAgent);
    console.log('Geolocation available:', !!navigator.geolocation);
    console.log('WebSocket available:', !!window.WebSocket);
  }, []);

const LocationMap = ({ myLocation, partnerLocation }) => {
    const [map, setMap] = useState(null);
  
    useEffect(() => {
      if (map) {
        map.invalidateSize();
      }
    }, [map]);
  
    const calculateMapCenter = () => {
      if (!myLocation?.latitude || !partnerLocation?.latitude) {
        return [0, 0];
      }
      return [
        (myLocation.latitude + partnerLocation.latitude) / 2,
        (myLocation.longitude + partnerLocation.longitude) / 2
      ];
    };
  
    return (
      <div className="map-container">
        <MapContainer
          center={calculateMapCenter()}
          zoom={12}
          className="map"
          whenCreated={setMap}
          attributionControl={false}
          zoomControl={false}
        >
          {/* ... rest of your map code ... */}
        </MapContainer>
      </div>
    );
  };
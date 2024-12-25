// App.js
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, AppState } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { darkMapStyle } from './styles';

const LOCATION_TASK_NAME = 'background-location-task';
const SERVER_URL = 'wss://location-share-ww81.onrender.com';

// Background location task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data: { locations }, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  
  if (locations && locations.length > 0) {
    const location = locations[locations.length - 1];
    sendLocationUpdate(location.coords);
  }
});

const App = () => {
  const [message, setMessage] = useState('');
  const [otherUserLocation, setOtherUserLocation] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const ws = useRef(null);
  const userId = useRef(Math.random().toString(36).substring(7));

  useEffect(() => {
    setupWebSocket();
    setupLocation();
    
    // Handle app state changes
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        setupWebSocket();
      }
    });

    return () => {
      subscription.remove();
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const setupWebSocket = () => {
    ws.current = new WebSocket(SERVER_URL);

    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({
        type: 'register',
        userId: userId.current
      }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'location':
          setOtherUserLocation(data.location);
          break;
        case 'message':
          // Handle incoming message
          break;
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const setupLocation = async () => {
    try {
      const { status } = await Location.requestBackgroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission denied');
        return;
      }

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 10,
        foregroundService: {
          notificationTitle: 'Location Sharing Active',
          notificationBody: 'Sharing your location with your contact'
        }
      });

      const location = await Location.getCurrentPositionAsync({});
      setMyLocation(location.coords);
      sendLocationUpdate(location.coords);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendMessage = () => {
    if (message.trim() && ws.current) {
      ws.current.send(JSON.stringify({
        type: 'message',
        userId: userId.current,
        text: message
      }));
      setMessage('');
    }
  };

  const sendLocationUpdate = (coords) => {
    if (ws.current) {
      ws.current.send(JSON.stringify({
        type: 'location',
        userId: userId.current,
        location: coords
      }));
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        customMapStyle={darkMapStyle}
        initialRegion={{
          latitude: myLocation?.latitude || 0,
          longitude: myLocation?.longitude || 0,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {myLocation && (
          <Marker
            coordinate={{
              latitude: myLocation.latitude,
              longitude: myLocation.longitude
            }}
            title="Me"
            pinColor="blue"
          />
        )}
        {otherUserLocation && (
          <Marker
            coordinate={{
              latitude: otherUserLocation.latitude,
              longitude: otherUserLocation.longitude
            }}
            title="Other User"
            pinColor="red"
          />
        )}
      </MapView>
      <View style={styles.messageContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#666"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  map: {
    flex: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#1E1E1E',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#2E2E2E',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    color: '#FFFFFF',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default App;
# Location Sharing App

A secure, real-time location sharing application with both Android native app and iOS web app support. Built for emergency contact and location sharing between two users.

## Features

- Real-time location sharing
- Cross-platform support (Android & iOS)
- Emergency messaging capability
- Dark theme UI
- Background location tracking
- Privacy-focused design
- Self-hosted WebSocket server

## Architecture

- **Server**: Node.js WebSocket server
- **Android App**: React Native application
- **iOS**: Progressive Web App (PWA)
- **Real-time Updates**: WebSocket communication
- **Map Integration**: Google Maps API

## Project Structure

```
location-sharing/
├── server/
│   ├── websocket-server.js    # WebSocket server implementation
│   └── package.json           # Server dependencies
├── react-native-app/
│   ├── App.js                 # Main Android application
│   └── styles.js              # Dark theme styles
├── web-app/
│   ├── secure-web-app.js      # iOS web application
│   └── hooks/
│       └── useLocationPermission.js
```

## Setup

### Server Setup
1. Navigate to server directory:
```bash
cd server
npm install
node websocket-server.js
```

### Android App Setup
1. Install dependencies:
```bash
cd react-native-app
npm install
```

2. Run the app:
```bash
npx react-native run-android
```

### Web App Setup (for iOS)
1. Open in Safari on iOS device
2. Navigate to the deployed web app URL
3. Add to Home Screen for PWA functionality

## Security Features

- WebSocket secure connection
- Location data encryption
- Minimal data storage
- Background location permissions
- No third-party trackers

## Deployment

1. Server: Deployed using Render.com
2. Android App: Direct APK installation
3. iOS: Access through secure web browser

## Prerequisites

- Node.js v14 or higher
- React Native development environment
- Android Studio (for Android build)
- Git

## Development

To start development:

1. Clone the repository
```bash
git clone https://github.com/YourUsername/location-share.git
cd location-share
```

2. Install dependencies in each directory (server, react-native-app, web-app)
```bash
npm install
```

3. Start the development servers

## License

MIT License

## Security Considerations

- Only share the app with trusted contacts
- Review permissions regularly
- Keep the server URL private
- Update dependencies regularly
# Location Sharing App

A privacy-focused, real-time location sharing application with web and mobile components. This application allows two users to share their location securely using WebSocket communication.

## Deployment Status

- **Web App**: ✅ Deployed at [location-share-web.onrender.com](https://location-share-web.onrender.com)
- **WebSocket Server**: ✅ Running at `wss://location-share-ww81.onrender.com`
- **Android App**: 🚧 In Development

## Features

- Real-time location tracking
- Distance calculation between users
- Dark theme interface
- Map visualization using OpenStreetMap
- Privacy-focused design
- WebSocket secure communication
- Connection status monitoring
- Mobile-responsive web interface

## Project Structure

```
Location-Share/
├── react-native-app/   # Android app (pending)
├── server/             # WebSocket server
│   ├── node_modules/
│   ├── package.json
│   └── websocket-server.js
└── web-app/           # React web application
    ├── public/
    │   ├── index.html
    │   └── manifest.json
    └── src/
        ├── components/
        │   ├── LocationMap.js
        │   ├── StatusBar.js
        │   └── DistanceDisplay.js
        ├── styles/
        │   └── index.css
        └── App.js
```

## Technical Stack

### Web Application
- React
- Leaflet for maps
- WebSocket client
- Dark theme UI

### Server
- Node.js
- WebSocket server
- Deployed on Render.com
- Auto-deployment via GitHub

## Server Details

- **URL**: `https://location-share-ww81.onrender.com`
- **WebSocket**: `wss://location-share-ww81.onrender.com`
- **Port**: 10000
- **Health Endpoint**: `/health`

## Development Setup

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install dependencies for web app:
```bash
cd web-app
npm install
```

3. Install dependencies for server:
```bash
cd server
npm install
```

4. Run development server:
```bash
cd web-app
npm start
```

## Deployment

### Web App
- Deployed on Render.com
- Auto-deploys from main branch
- Build command: `cd web-app && npm install && cross-env NODE_OPTIONS='--openssl-legacy-provider' npm run build`
- Output directory: `web-app/build`

### Server
- Deployed on Render.com
- Auto-deploys from main branch
- Environment variables are configured in Render dashboard

## Browser Support

### iOS (Web App)
- Tested on Brave browser
- Location permissions must be enabled
- Brave shields should be set to "Basic" for proper functionality

## Security Features

- WSS (WebSocket Secure) encryption
- No data storage (real-time only)
- Two-user system
- Health monitoring endpoint

## Future Development

- [ ] Complete Android native app
- [ ] Implement background location tracking
- [ ] Add additional UI features
- [ ] Optimize performance
- [ ] Add offline support

## Notes

- Privacy-focused implementation
- No data persistence
- Built for emergency location sharing
- Works best with location permissions enabled
- Requires active internet connection

## License

Private project - All rights reserved
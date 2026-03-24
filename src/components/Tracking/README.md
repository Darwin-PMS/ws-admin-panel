# 🛡️ Real-Time Tracking Map - Women Safety Portal

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Features](#features)
4. [Documentation](#documentation)
5. [Component Structure](#component-structure)
6. [API Integration](#api-integration)
7. [Demo Mode](#demo-mode)
8. [Production Deployment](#production-deployment)
9. [Troubleshooting](#troubleshooting)
10. [Support](#support)

---

## Overview

The **Real-Time Tracking Map** is a comprehensive safety monitoring solution for the Women Safety Portal. It provides:

- 🗺️ **Interactive Map** with live user tracking
- 🚨 **SOS Alert Handling** with sound notifications
- 👨‍👩‍👧‍👦 **Multiple Tracking Modes** (Individual, Family, Group)
- 🏥 **Emergency Services** locator
- 📍 **Movement History** visualization
- 🛡️ **Geofencing** support

---

## Quick Start

### 1. Start Development Server

```bash
cd "c:\React Apps\Anshuman\women-safety\admin_panel"
npm start
```

### 2. Login

**Demo Credentials:**
- Email: `admin@aiml.app`
- Password: `admin123`

### 3. Access Tracking Map

Navigate to **Tracking Map** from the sidebar.

---

## Features

### ✅ Core Features

| Feature | Status | Description |
|---------|--------|-------------|
| Interactive Map | ✅ | Leaflet.js with multiple tile layers |
| User Tracking | ✅ | Real-time location with status markers |
| SOS Alerts | ✅ | Sound alerts, auto-zoom, emergency dialog |
| Emergency Services | ✅ | Police, hospitals, safe zones nearby |
| Movement History | ✅ | Last 30 minutes trail |
| Tracking Modes | ✅ | All/Individual/Family/Selected |
| Filters | ✅ | Status-based filtering |
| User Details | ✅ | Complete profile with emergency contacts |
| Geofencing | ✅ | Safe/unsafe zone visualization |
| Auto-Refresh | ✅ | 30-second update interval |

### 🔮 Advanced Features

| Feature | Status | Description |
|---------|--------|-------------|
| Heatmap | 🟡 | Component ready, optional activation |
| WebSocket | ⏳ | Framework ready, backend needed |
| AI Risk Detection | ⏳ | Future enhancement |
| Route Prediction | ⏳ | Future enhancement |
| Offline Mode | ⏳ | Future enhancement |

**Legend:** ✅ Complete | 🟡 Partial | ⏳ Pending

---

## Documentation

### Detailed Guides

1. **[Quick Start Guide](TRACKING_QUICK_START.md)**
   - Getting started
   - Common tasks
   - Keyboard shortcuts
   - Tips & tricks

2. **[Feature Documentation](TRACKING_FEATURE_DOCUMENTATION.md)**
   - Complete feature list
   - Architecture overview
   - API integration
   - Configuration
   - Troubleshooting

3. **[Architecture Diagram](TRACKING_ARCHITECTURE.md)**
   - Component hierarchy
   - Data flow
   - State management
   - API integration

4. **[Implementation Summary](TRACKING_IMPLEMENTATION_SUMMARY.md)**
   - Files created/modified
   - Implementation statistics
   - Testing checklist
   - Next steps

---

## Component Structure

```
src/components/Tracking/
├── TrackingMap.js          # Main map component
├── UserDetailPanel.js      # User information drawer
├── TrackingControlPanel.js # Filters and mode selection
├── SOSAlertHandler.js      # SOS alert dialog with sound
├── TrackingHeatmap.js      # Heatmap visualization
└── index.js                # Component exports
```

### Component Descriptions

#### TrackingMap.js
The main map component with:
- Leaflet map integration
- User markers with custom icons
- Emergency services display
- Geofencing visualization
- Auto-refresh functionality

#### UserDetailPanel.js
Drawer showing:
- User profile and photo
- Contact information
- Family details
- Emergency contacts
- Safety score
- Quick actions

#### TrackingControlPanel.js
Control panel with:
- Tracking mode selector
- Status filters
- User/family lists
- Selection checkboxes

#### SOSAlertHandler.js
Emergency dialog with:
- Alert details
- Sound notifications
- Emergency services
- Quick action buttons

#### TrackingHeatmap.js
Heatmap overlay showing:
- Risk levels
- Incident density
- Hotspot statistics

---

## API Integration

### Required Endpoints

```javascript
GET  /admin/tracking/locations
GET  /admin/tracking/family/:id
GET  /admin/tracking/user/:id
GET  /admin/tracking/user/:id/history
GET  /admin/tracking/nearby
POST /admin/tracking/user/:id/location
GET  /admin/tracking/geofences
POST /admin/tracking/geofences
GET  /admin/sos-alerts
POST /admin/sos-alerts/:id/notify
```

### Response Format

```json
{
  "success": true,
  "locations": [
    {
      "user_id": 1,
      "name": "John Doe",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "status": "safe",
      "last_updated": "2024-01-01T12:00:00Z"
    }
  ]
}
```

---

## Demo Mode

The application includes a **demo data service** for testing without a backend:

**File:** `src/services/trackingDemoService.js`

### Features:
- Generates random user locations across India
- Simulates SOS alerts
- Creates emergency services
- Generates location history
- Simulates real-time updates

### Usage:

Currently integrated in the TrackingMap component. The demo data is used when the backend API is not available.

---

## Production Deployment

### Steps:

1. **Backend Setup**
   - Deploy backend API with tracking endpoints
   - Configure database for location storage
   - Set up WebSocket server (optional)

2. **Frontend Configuration**
   - Update `.env` with production API URL
   - Set `REACT_APP_DEMO_MODE=false`
   - Build production bundle

3. **Build Command**
   ```bash
   npm run build
   ```

4. **Deploy**
   - Upload `build/` folder to web server
   - Configure web server for React Router
   - Test all features

### Environment Variables

```env
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_DEMO_MODE=false
```

---

## Troubleshooting

### Common Issues

#### Map Not Loading
**Solution:** Check browser console for errors, ensure Leaflet CSS is loaded

#### Markers Not Showing
**Solution:** Verify API endpoint is responding, check network tab

#### Sound Not Playing
**Solution:** Check browser sound permissions, ensure volume is up

#### Auto-Refresh Not Working
**Solution:** Verify "Auto: ON" button is active, check network

### Get Help

1. Check [TRACKING_FEATURE_DOCUMENTATION.md](TRACKING_FEATURE_DOCUMENTATION.md#troubleshooting)
2. Check [TRACKING_QUICK_START.md](TRACKING_QUICK_START.md#troubleshooting)
3. Review browser console
4. Contact development team

---

## Support

### Documentation
- [Quick Start](TRACKING_QUICK_START.md)
- [Feature Documentation](TRACKING_FEATURE_DOCUMENTATION.md)
- [Architecture](TRACKING_ARCHITECTURE.md)
- [Implementation Summary](TRACKING_IMPLEMENTATION_SUMMARY.md)

### Contact
For questions or issues, please contact the development team.

---

## Version Information

- **Version:** 1.0.0
- **Created:** March 19, 2026
- **Status:** Development Complete ✅
- **Backend Integration:** Pending ⏳

---

## License

Internal use only - Women Safety Project

---

**Stay Safe! 🛡️**

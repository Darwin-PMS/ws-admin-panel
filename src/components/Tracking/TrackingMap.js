import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, Circle } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    IconButton,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    Divider,
    Avatar,
    Badge,
    Skeleton,
    Alert,
    Tooltip,
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Refresh as RefreshIcon,
    FilterList as FilterIcon,
    Layers as LayersIcon,
    MyLocation as MyLocationIcon,
    PlusOne as PlusOneIcon,
    FamilyRestroom as FamilyIcon,
    People as PeopleIcon,
    EmergencyShare as EmergencyIcon,
    Wifi as WifiIcon,
    WifiOff as WifiOffIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAllLocations,
    fetchFamilyLocations,
    fetchUserLocation,
    fetchUserHistory,
    fetchSOSAlerts,
    fetchNearbyEmergencyServices,
    setSelectedUser,
    setSelectedFamily,
    setSelectedUsers,
    toggleUserSelection,
    setTrackingMode,
    updateFilters,
    clearSelection,
    updateLocation,
} from '../../store/slices/trackingSlice';
import { adminApi } from '../../services/api';
import { useWebSocket } from '../../hooks/useWebSocket';
import UserDetailPanel from './UserDetailPanel';
import TrackingControlPanel from './TrackingControlPanel';
import SOSAlertHandler from './SOSAlertHandler';

// Custom marker icons
const createMarkerIcon = (status, isSOS = false) => {
    const colors = {
        safe: '#10b981',
        danger: '#f59e0b',
        sos: '#ef4444',
    };

    const color = colors[status] || colors.safe;

    return new DivIcon({
        className: 'custom-marker',
        html: `
            <div style="
                background-color: ${color};
                width: ${isSOS ? '50px' : '40px'};
                height: ${isSOS ? '50px' : '40px'};
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                ${isSOS ? 'animation: blink 1s infinite;' : ''}
            ">
                ${status === 'sos' ? '🚨' : status === 'danger' ? '⚠️' : '✓'}
            </div>
        `,
        iconSize: [isSOS ? 50 : 40, isSOS ? 50 : 40],
        iconAnchor: [isSOS ? 25 : 20, isSOS ? 25 : 20],
        popupAnchor: [0, -isSOS ? 25 : 20],
    });
};

// Emergency service icons
const emergencyServiceIcons = {
    police: new DivIcon({
        className: 'emergency-marker',
        html: '<div style="font-size: 24px;">👮</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
    }),
    hospital: new DivIcon({
        className: 'emergency-marker',
        html: '<div style="font-size: 24px;">🏥</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
    }),
    safe_zone: new DivIcon({
        className: 'emergency-marker',
        html: '<div style="font-size: 24px;">🛡️</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
    }),
};

const TrackingMap = () => {
    const dispatch = useDispatch();
    const mapRef = useRef(null);
    const [userDetail, setUserDetail] = useState({ open: false, user: null });
    const [sosAlertOpen, setSosAlertOpen] = useState(false);
    const [sosUser, setSosUser] = useState(null);
    const [emergencyServices, setEmergencyServices] = useState([]);
    const [users, setUsers] = useState([]);
    const [families, setFamilies] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [viewMode, setViewMode] = useState('standard'); // standard, satellite, terrain
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval] = useState(30000); // 30 seconds
    const [wsConnected, setWsConnected] = useState(false);

    const {
        locations,
        selectedUser,
        selectedFamily,
        selectedUsers,
        sosAlerts,
        loading,
        error,
        lastUpdated,
        trackingMode,
        filters,
    } = useSelector((state) => state.tracking);

    // WebSocket real-time updates
    const handleLocationUpdate = useCallback((payload) => {
        dispatch(updateLocation({
            userId: payload.userId,
            latitude: payload.latitude,
            longitude: payload.longitude,
        }));
    }, [dispatch]);

    const handleSOSAlert = useCallback((payload) => {
        setSosUser(payload);
        setSosAlertOpen(true);

        if (mapRef.current) {
            mapRef.current.setView([payload.latitude, payload.longitude], 15);
        }

        dispatch(fetchNearbyEmergencyServices({
            lat: payload.latitude,
            lng: payload.longitude,
        })).then((action) => {
            if (action.payload) {
                setEmergencyServices(action.payload.services || []);
            }
        });
    }, [dispatch]);

    const { isConnected } = useWebSocket({
        autoConnect: true,
        channels: ['admin', 'tracking'],
        onLocationUpdate: handleLocationUpdate,
        onSOSAlert: handleSOSAlert,
        onConnectionChange: setWsConnected,
    });

    // Filter locations based on current filters and mode
    const filteredLocations = React.useMemo(() => {
        let filtered = locations || [];

        // Apply status filters
        if (!filters.showSafe) {
            filtered = filtered.filter(loc => loc.status !== 'safe');
        }
        if (!filters.showDanger) {
            filtered = filtered.filter(loc => loc.status !== 'danger');
        }
        if (!filters.showSOS) {
            filtered = filtered.filter(loc => loc.status !== 'sos');
        }

        // Apply tracking mode filters
        if (trackingMode === 'individual' && selectedUser) {
            filtered = filtered.filter(loc => loc.user_id === selectedUser.user_id);
        } else if (trackingMode === 'family' && selectedFamily) {
            const familyMemberIds = selectedFamily.members?.map(m => m.user_id) || [];
            filtered = filtered.filter(loc => familyMemberIds.includes(loc.user_id));
        } else if (trackingMode === 'selected' && selectedUsers.length > 0) {
            filtered = filtered.filter(loc => selectedUsers.includes(loc.user_id));
        }

        return filtered;
    }, [locations, filters, trackingMode, selectedUser, selectedFamily, selectedUsers]);

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoadingData(true);
            try {
                await dispatch(fetchAllLocations()).unwrap();
                await dispatch(fetchSOSAlerts()).unwrap();

                // Fetch users and families for filters
                const [usersRes, familiesRes] = await Promise.all([
                    adminApi.getUsers(),
                    adminApi.getFamilies(),
                ]);

                if (usersRes.data.success) {
                    setUsers(usersRes.data.users || []);
                }
                if (familiesRes.data.success) {
                    setFamilies(familiesRes.data.families || []);
                }
            } catch (err) {
                console.error('Error fetching initial data:', err);
            } finally {
                setLoadingData(false);
            }
        };

        fetchInitialData();
    }, [dispatch]);

    // Auto-refresh locations
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            dispatch(fetchAllLocations());
            dispatch(fetchSOSAlerts());
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [dispatch, autoRefresh, refreshInterval]);

    // Handle SOS alerts
    useEffect(() => {
        if (sosAlerts && sosAlerts.length > 0) {
            const activeSOS = sosAlerts.filter(alert => alert.status === 'active');
            if (activeSOS.length > 0 && !sosAlertOpen) {
                const latestSOS = activeSOS[0];
                setSosUser(latestSOS);
                setSosAlertOpen(true);

                // Auto-zoom to SOS location
                if (mapRef.current) {
                    mapRef.current.setView([latestSOS.latitude, latestSOS.longitude], 15);
                }

                // Fetch nearby emergency services
                dispatch(fetchNearbyEmergencyServices({
                    lat: latestSOS.latitude,
                    lng: latestSOS.longitude,
                })).then((action) => {
                    if (action.payload) {
                        setEmergencyServices(action.payload.services || []);
                    }
                });
            }
        }
    }, [sosAlerts, dispatch, sosAlertOpen]);

    // Handle user detail panel
    const handleUserClick = async (userLocation) => {
        setUserDetail({ open: true, user: userLocation });

        // Fetch user history (last 30 minutes)
        try {
            await dispatch(fetchUserHistory({
                userId: userLocation.user_id,
                minutes: 30,
            })).unwrap();
        } catch (err) {
            console.error('Error fetching user history:', err);
        }
    };

    const handleCloseUserDetail = () => {
        setUserDetail({ open: false, user: null });
    };

    const handleRefresh = () => {
        dispatch(fetchAllLocations());
        dispatch(fetchSOSAlerts());
    };

    const handleTrackingModeChange = (mode, data = null) => {
        dispatch(clearSelection());
        dispatch(setTrackingMode(mode));

        if (mode === 'family' && data) {
            dispatch(fetchFamilyLocations(data.id));
        } else if (mode === 'individual' && data) {
            dispatch(fetchUserLocation(data.user_id));
        } else if (mode === 'all') {
            dispatch(fetchAllLocations());
        }
    };

    const handleUserToggle = (userId) => {
        dispatch(toggleUserSelection(userId));
    };

    const centerOnUser = (lat, lng) => {
        if (mapRef.current) {
            mapRef.current.setView([lat, lng], 16);
        }
    };

    const tileLayers = {
        standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    };

    return (
        <Box sx={{ height: 'calc(100vh - 120px)', position: 'relative' }}>
            {/* CSS for blinking animation */}
            <style>
                {`
                    @keyframes blink {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.5; transform: scale(1.1); }
                    }
                    .custom-marker {
                        background: transparent !important;
                        border: none !important;
                    }
                    .emergency-marker {
                        background: transparent !important;
                        border: none !important;
                    }
                    .leaflet-popup-content-wrapper {
                        border-radius: 12px !important;
                    }
                `}
            </style>

            {/* Top Control Bar */}
            <Card sx={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 1000, maxWidth: 'calc(100% - 32px)' }}>
                <CardContent sx={{ py: 2, px: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Real-Time Tracking
                            </Typography>
                            <Chip
                                size="small"
                                icon={isConnected ? <WifiIcon sx={{ fontSize: 16 }} /> : <WifiOffIcon sx={{ fontSize: 16 }} />}
                                label={isConnected ? 'Live' : 'Reconnecting...'}
                                color={isConnected ? 'success' : 'warning'}
                                sx={{ animation: isConnected ? 'none' : 'pulse 1.5s infinite' }}
                            />
                            <Chip
                                icon={<RefreshIcon />}
                                label={`Updated: ${lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}`}
                                size="small"
                                color={autoRefresh ? 'success' : 'default'}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Tooltip title="Toggle Auto-Refresh">
                                <Button
                                    size="small"
                                    variant={autoRefresh ? 'contained' : 'outlined'}
                                    onClick={() => setAutoRefresh(!autoRefresh)}
                                    color={autoRefresh ? 'success' : 'inherit'}
                                >
                                    Auto: {autoRefresh ? 'ON' : 'OFF'}
                                </Button>
                            </Tooltip>

                            <Tooltip title="Refresh Now">
                                <IconButton onClick={handleRefresh} size="small" disabled={loading}>
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>

                            <Divider orientation="vertical" flexItem />

                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Map View</InputLabel>
                                <Select
                                    value={viewMode}
                                    label="Map View"
                                    onChange={(e) => setViewMode(e.target.value)}
                                    startIcon={<LayersIcon />}
                                >
                                    <MenuItem value="standard">Standard</MenuItem>
                                    <MenuItem value="satellite">Satellite</MenuItem>
                                    <MenuItem value="terrain">Terrain</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Tracking Control Panel */}
            <TrackingControlPanel
                users={users}
                families={families}
                trackingMode={trackingMode}
                selectedUser={selectedUser}
                selectedFamily={selectedFamily}
                selectedUsers={selectedUsers}
                filters={filters}
                onModeChange={handleTrackingModeChange}
                onUserToggle={handleUserToggle}
                onFiltersChange={(newFilters) => dispatch(updateFilters(newFilters))}
            />

            {/* Map */}
            <Box sx={{ height: '100%', width: '100%' }}>
                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            position: 'absolute',
                            top: 100,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 1001,
                            minWidth: 400,
                        }}
                    >
                        {error}
                    </Alert>
                )}

                <MapContainer
                    center={[20.5937, 78.9629]} // Center of India
                    zoom={5}
                    style={{ height: '100%', width: '100%' }}
                    ref={mapRef}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url={tileLayers[viewMode]}
                    />

                    {/* User Markers */}
                    {filteredLocations.map((location) => (
                        <Marker
                            key={location.user_id}
                            position={[location.latitude, location.longitude]}
                            icon={createMarkerIcon(location.status, location.status === 'sos')}
                            eventHandlers={{
                                click: () => handleUserClick(location),
                            }}
                        >
                            <Popup>
                                <Box sx={{ minWidth: 200 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Avatar
                                            src={location.profile_photo}
                                            sx={{ width: 40, height: 40 }}
                                        >
                                            {location.name?.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                {location.name}
                                            </Typography>
                                            <Chip
                                                label={location.status?.toUpperCase()}
                                                size="small"
                                                color={
                                                    location.status === 'sos' ? 'error' :
                                                    location.status === 'danger' ? 'warning' : 'success'
                                                }
                                            />
                                        </Box>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Last updated: {new Date(location.last_updated).toLocaleString()}
                                    </Typography>
                                    <Button
                                        size="small"
                                        fullWidth
                                        variant="outlined"
                                        sx={{ mt: 1 }}
                                        onClick={() => handleUserClick(location)}
                                    >
                                        View Details
                                    </Button>
                                </Box>
                            </Popup>
                        </Marker>
                    ))}

                    {/* User History Trail */}
                    {selectedUser?.history && selectedUser.history.length > 1 && (
                        <Polyline
                            positions={selectedUser.history.map(h => [h.latitude, h.longitude])}
                            color="#6366f1"
                            weight={3}
                            opacity={0.7}
                            dashArray="5, 10"
                        />
                    )}

                    {/* Emergency Services */}
                    {emergencyServices.map((service) => (
                        <Marker
                            key={service.id}
                            position={[service.latitude, service.longitude]}
                            icon={emergencyServiceIcons[service.type]}
                        >
                            <Popup>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        {service.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {service.type.replace('_', ' ').toUpperCase()}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="text.secondary">
                                        Distance: {service.distance?.toFixed(1)} km
                                    </Typography>
                                </Box>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Safe/Unsafe Zones (Geofencing) */}
                    {locations
                        .filter(loc => loc.geofence)
                        .map((loc) => (
                            <Circle
                                key={`geofence-${loc.user_id}`}
                                center={[loc.latitude, loc.longitude]}
                                radius={loc.geofence.radius || 500}
                                pathOptions={{
                                    color: loc.geofence.type === 'safe' ? '#10b981' : '#ef4444',
                                    fillColor: loc.geofence.type === 'safe' ? '#10b981' : '#ef4444',
                                    fillOpacity: 0.2,
                                }}
                            />
                        ))}
                </MapContainer>
            </Box>

            {/* User Detail Panel */}
            <UserDetailPanel
                open={userDetail.open}
                user={userDetail.user}
                onClose={handleCloseUserDetail}
                onCenterUser={centerOnUser}
            />

            {/* SOS Alert Handler */}
            <SOSAlertHandler
                open={sosAlertOpen}
                sosUser={sosUser}
                emergencyServices={emergencyServices}
                onClose={() => setSosAlertOpen(false)}
                onCenterUser={centerOnUser}
            />

            {/* Legend */}
            <Card
                sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    zIndex: 1000,
                    minWidth: 150,
                }}
            >
                <CardContent sx={{ py: 1.5, px: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Legend
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10b981' }} />
                            <Typography variant="caption">Safe</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                            <Typography variant="caption">Danger</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef4444' }} />
                            <Typography variant="caption">SOS Alert</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption">👮</Typography>
                            <Typography variant="caption">Police</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption">🏥</Typography>
                            <Typography variant="caption">Hospital</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption">🛡️</Typography>
                            <Typography variant="caption">Safe Zone</Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default TrackingMap;

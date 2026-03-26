import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import {
    Box,
    Typography,
    InputBase,
    Avatar,
    Tab,
    Tabs,
    Paper,
    useTheme,
    ButtonBase,
} from '@mui/material';
import {
    Phone as PhoneIcon,
    FlashOn as BoltIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllLocations, updateLocation } from '../../store/slices/trackingSlice';
import { useWebSocket } from '../../hooks/useWebSocket';
import 'leaflet/dist/leaflet.css';

// Custom Map Marker Icon (Truck)
const createTruckIcon = (isActive = false) => {
    return L.divIcon({
        className: 'custom-truck-marker',
        html: `
            <div style="
                background: white;
                padding: 4px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                justify-content: center;
                border: ${isActive ? '2px solid #6366f1' : 'none'};
                width: 40px;
                height: 30px;
                position: relative;
            ">
                <div style="
                    position: absolute;
                    top: -10px; right: -10px;
                    background: ${isActive ? '#111' : '#f50057'};
                    color: white;
                    font-size: 10px;
                    font-weight: bold;
                    padding: 2px 6px;
                    border-radius: 4px;
                ">${isActive ? '2938' : '2934'}</div>
                <img src="https://cdn-icons-png.flaticon.com/512/2830/2830305.png" alt="truck" style="width: 100%; height: 100%; object-fit: contain; opacity: 0.8;" />
                <div style="
                    position: absolute;
                    bottom: -6px; left: 50%; transform: translateX(-50%);
                    width: 0; height: 0; 
                    border-left: 6px solid transparent;
                    border-right: 6px solid transparent;
                    border-top: 6px solid white;
                "></div>
            </div>
        `,
        iconSize: [40, 30],
        iconAnchor: [20, 30],
        popupAnchor: [0, -35],
    });
};

const UserPopover = ({ location }) => (
    <Box sx={{ p: 0.5, minWidth: 160, textAlign: 'center' }}>
        <Avatar
            src={location?.profile_photo || `https://i.pravatar.cc/150?u=${location?.user_id}`}
            sx={{ width: 64, height: 64, mx: 'auto', mb: 1, border: '3px solid #f3f4f6' }}
        />
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1f2937' }}>
            {location?.name || 'Unknown Driver'}
        </Typography>
        <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
            <span style={{ color: '#f59e0b', marginRight: '4px' }}>★</span> 4.9
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
            <ButtonBase sx={{
                flex: 1, bgcolor: '#10b981', color: 'white', py: 0.75, borderRadius: 1.5,
                '&:hover': { bgcolor: '#059669' }
            }}>
                <PhoneIcon fontSize="small" />
            </ButtonBase>
            <ButtonBase sx={{
                flex: 1, bgcolor: '#10b981', color: 'white', py: 0.75, borderRadius: 1.5,
                '&:hover': { bgcolor: '#059669' }
            }}>
                <BoltIcon fontSize="small" />
            </ButtonBase>
        </Box>
    </Box>
);

const DriverCard = ({ location, isActive, onClick }) => {
    const isDelayed = location?.status === 'sos' || location?.status === 'danger';

    return (
        <Paper
            elevation={isActive ? 3 : 0}
            onClick={onClick}
            sx={{
                minWidth: 260,
                maxWidth: 260,
                height: 180,
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: isActive ? 'transparent' : 'divider',
                bgcolor: isActive ? 'white' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Avatar
                        src={location?.profile_photo || `https://i.pravatar.cc/150?u=${location?.user_id}`}
                        sx={{ width: 36, height: 36 }}
                    />
                    <Box>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1f2937', lineHeight: 1 }}>
                            {location?.name || 'Driver Name'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
                            {location?.user_id || 'ID-100'}
                        </Typography>
                    </Box>
                </Box>
                <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{
                        color: isDelayed ? '#ef4444' : '#10b981',
                        fontSize: '0.65rem',
                        letterSpacing: 0.5
                    }}
                >
                    {isDelayed ? 'DELAYED' : 'ON TIME'}
                </Typography>
            </Box>

            <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Box sx={{ mt: 0.5, width: 8, height: 8, bgcolor: '#6366f1', borderRadius: '50%' }} />
                    <Typography variant="body2" sx={{ color: '#4b5563', fontWeight: 500, fontSize: '0.8rem' }}>
                        Current Location
                        <Typography variant="caption" display="block" color="text.secondary">
                            Lat: {location?.latitude?.toFixed(4)}, Lng: {location?.longitude?.toFixed(4)}
                        </Typography>
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ width: 6, height: 6, bgcolor: '#d1d5db', borderRadius: '50%' }} />
                </Box>
                <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600 }}>
                    2H 20M ONLINE
                </Typography>
            </Box>
        </Paper>
    );
};

const LiveTrackingMap = () => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const mapRef = useRef(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [mainTab, setMainTab] = useState(0); // 0: Drivers, 1: Tasks
    const [filterTab, setFilterTab] = useState(0); // 0: All, 1: On time, 2: Delayed
    const [selectedUserId, setSelectedUserId] = useState(null);

    const { locations } = useSelector((state) => state.tracking);

    useWebSocket({
        autoConnect: true,
        channels: ['admin', 'tracking'],
        onLocationUpdate: useCallback((payload) => {
            dispatch(updateLocation(payload));
        }, [dispatch]),
    });

    useEffect(() => {
        dispatch(fetchAllLocations());
    }, [dispatch]);

    // Derived states
    const filteredLocations = useMemo(() => {
        let result = locations || [];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(loc =>
                loc.name?.toLowerCase().includes(query) ||
                loc.user_id?.toString().includes(query)
            );
        }

        if (filterTab === 1) {
            result = result.filter(loc => loc.status !== 'sos' && loc.status !== 'danger');
        } else if (filterTab === 2) {
            result = result.filter(loc => loc.status === 'sos' || loc.status === 'danger');
        }

        return result;
    }, [locations, searchQuery, filterTab]);

    const activeUser = useMemo(() =>
        locations.find(l => l.user_id === selectedUserId),
        [locations, selectedUserId]);

    return (
        <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f4f4f5' }}>
            <style>{`
                .leaflet-popup-content-wrapper { border-radius: 16px !important; padding: 0 !important; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important; }
                .leaflet-popup-content { margin: 12px 16px !important; }
                .leaflet-popup-tip { background: white; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <Box sx={{ flexGrow: 1, position: 'relative', zIndex: 1 }}>
                <MapContainer
                    center={[34.0522, -118.2437]} // LA coordinates like in the image
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                    ref={mapRef}
                    zoomControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    />

                    {/* Example active route polyline */}
                    {activeUser && (
                        <Polyline
                            positions={[
                                [activeUser.latitude, activeUser.longitude],
                                [activeUser.latitude + 0.02, activeUser.longitude + 0.05]
                            ]}
                            color="#111827"
                            weight={3}
                        />
                    )}

                    {locations.map((loc) => (
                        <Marker
                            key={loc.user_id}
                            position={[loc.latitude, loc.longitude]}
                            icon={createTruckIcon(selectedUserId === loc.user_id)}
                            eventHandlers={{
                                click: () => {
                                    setSelectedUserId(loc.user_id);
                                    mapRef.current?.flyTo([loc.latitude, loc.longitude], 14, { duration: 0.8 });
                                }
                            }}
                        >
                            <Popup closeButton={false} autoPanPadding={[50, 50]}>
                                <UserPopover location={loc} />
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </Box>

            {/* Floating Bottom Panel */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 24,
                    left: 24,
                    right: 24,
                    zIndex: 1000,
                    bgcolor: 'white',
                    borderRadius: 4,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Header Controls */}
                <Box sx={{
                    px: 3, py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    borderBottom: '1px solid',
                    borderColor: 'grey.100'
                }}>

                    {/* Main Tabs */}
                    <Box sx={{ display: 'flex', bgcolor: '#f3f4f6', borderRadius: 2, p: 0.5 }}>
                        <ButtonBase
                            onClick={() => setMainTab(0)}
                            sx={{
                                px: 3, py: 1, borderRadius: 1.5,
                                bgcolor: mainTab === 0 ? '#6366f1' : 'transparent',
                                color: mainTab === 0 ? 'white' : '#6b7280',
                                fontWeight: 600, fontSize: '0.85rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            Drivers <Box component="span" sx={{ ml: 1, bgcolor: mainTab === 0 ? 'rgba(255,255,255,0.2)' : '#e5e7eb', px: 1, py: 0.25, borderRadius: 1, fontSize: '0.7rem' }}>{locations.length}</Box>
                        </ButtonBase>
                        <ButtonBase
                            onClick={() => setMainTab(1)}
                            sx={{
                                px: 3, py: 1, borderRadius: 1.5,
                                bgcolor: mainTab === 1 ? '#6366f1' : 'transparent',
                                color: mainTab === 1 ? 'white' : '#6b7280',
                                fontWeight: 600, fontSize: '0.85rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            Tasks <Box component="span" sx={{ ml: 1, bgcolor: mainTab === 1 ? 'rgba(255,255,255,0.2)' : '#e5e7eb', px: 1, py: 0.25, borderRadius: 1, fontSize: '0.7rem' }}>54</Box>
                        </ButtonBase>
                    </Box>

                    {/* Filter Tabs */}
                    <Tabs
                        value={filterTab}
                        onChange={(_, v) => setFilterTab(v)}
                        TabIndicatorProps={{ style: { display: 'none' } }}
                        sx={{
                            minHeight: 0,
                            '& .MuiTab-root': {
                                minHeight: 0, py: 1, px: 3,
                                borderRadius: 8,
                                textTransform: 'none',
                                fontWeight: 600,
                                color: '#9ca3af',
                                margin: '0 4px',
                                border: '1px solid transparent',
                                '&.Mui-selected': {
                                    color: '#6366f1',
                                    borderColor: '#e0e7ff',
                                    bgcolor: '#eef2ff'
                                }
                            }
                        }}
                    >
                        <Tab label="All" />
                        <Tab label="On time" />
                        <Tab label="Delayed" />
                    </Tabs>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Search */}
                    <Box sx={{
                        display: 'flex', alignItems: 'center',
                        bgcolor: 'white', borderRadius: 8, px: 2, py: 1,
                        border: '1px solid #e5e7eb', width: 280
                    }}>
                        <SearchIcon sx={{ color: '#9ca3af', fontSize: 20, mr: 1 }} />
                        <InputBase
                            placeholder="Search tasks or drivers"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}
                        />
                    </Box>
                </Box>

                {/* Cards Container */}
                <Box
                    className="hide-scrollbar"
                    sx={{
                        p: 3,
                        display: 'flex',
                        gap: 2,
                        overflowX: 'auto',
                        bgcolor: '#fafafa'
                    }}
                >
                    {filteredLocations.map(loc => (
                        <DriverCard
                            key={loc.user_id}
                            location={loc}
                            isActive={selectedUserId === loc.user_id}
                            onClick={() => {
                                setSelectedUserId(loc.user_id);
                                mapRef.current?.flyTo([loc.latitude, loc.longitude], 14, { duration: 0.8 });
                            }}
                        />
                    ))}

                    {filteredLocations.length === 0 && (
                        <Typography sx={{ color: 'text.secondary', py: 4, px: 2 }}>
                            {searchQuery ? 'No tracking data matches your search.' : 'No locations available.'}
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Map UI Overlays (like zoom buttons in the image) */}
            <Paper sx={{
                position: 'absolute', top: 24, right: 24, zIndex: 1000,
                display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
                <ButtonBase sx={{ p: 1.5, borderBottom: '1px solid #f3f4f6', bgcolor: 'white', '&:hover': { bgcolor: '#f9fafb' } }} onClick={() => mapRef.current?.zoomIn()}>
                    <Typography variant="h6" sx={{ lineHeight: 0.5, color: '#374151' }}>+</Typography>
                </ButtonBase>
                <ButtonBase sx={{ p: 1.5, bgcolor: 'white', '&:hover': { bgcolor: '#f9fafb' } }} onClick={() => mapRef.current?.zoomOut()}>
                    <Typography variant="h6" sx={{ lineHeight: 0.5, color: '#374151' }}>-</Typography>
                </ButtonBase>
            </Paper>

        </Box>
    );
};

export default LiveTrackingMap;
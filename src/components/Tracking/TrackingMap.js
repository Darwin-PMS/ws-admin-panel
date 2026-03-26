import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Chip,
} from '@mui/material';
import {
    Phone as PhoneIcon,
    Message as MessageIcon,
    Search as SearchIcon,
    AccessTime as TimeIcon,
    LocationOn as LocationIcon,
    Warning as WarningIcon,
    CheckCircle as CheckIcon,
    Group as GroupIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllLocations, updateLocation, fetchSOSAlerts, setLocations, setSOSAlerts, clearSelection } from '../../store/slices/trackingSlice';
import { useWebSocket } from '../../hooks/useWebSocket';
import { adminApi } from '../../services/api';
import { demoTrackingData } from '../../services/trackingDemoService';
import UserDetailDrawer from './UserDetailDrawer';
import 'leaflet/dist/leaflet.css';

const createLocationIcon = (isActive = false, status = 'active') => {
    const statusColors = {
        active: '#10b981',
        sos: '#ef4444',
        danger: '#ef4444',
        offline: '#6b7280',
        moving: '#6366f1',
    };
    const color = statusColors[status] || statusColors.active;
    
    return L.divIcon({
        className: 'custom-location-marker',
        html: `
            <div style="
                background: white;
                padding: 6px;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                justify-content: center;
                border: ${isActive ? '2px solid #6366f1' : `2px solid ${color}`};
                width: 36px;
                height: 36px;
                position: relative;
            ">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="${color}">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                ${status === 'sos' || status === 'danger' ? '<div style="position:absolute;top:-8px;right:-8px;background:#ef4444;width:14px;height:14px;border-radius:50%;border:2px solid white;"></div>' : ''}
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -40],
    });
};

const UserPopover = ({ location, onCall, onMessage, onDoubleClick }) => (
    <Box sx={{ p: 1, minWidth: 180, cursor: 'pointer' }} onDoubleClick={onDoubleClick}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Avatar
                src={location?.profile_photo || location?.avatar || `https://i.pravatar.cc/150?u=${location?.user_id}`}
                sx={{ width: 48, height: 48, border: '2px solid #f3f4f6' }}
            />
            <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1f2937' }}>
                    {location?.name || location?.user_name || 'Unknown User'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    {location?.user_id || location?.id || 'ID-N/A'}
                </Typography>
            </Box>
        </Box>
        {location?.status && (
            <Chip
                size="small"
                label={location.status.toUpperCase()}
                sx={{
                    mb: 1.5,
                    bgcolor: location.status === 'sos' || location.status === 'danger' ? '#fef2f2' : '#ecfdf5',
                    color: location.status === 'sos' || location.status === 'danger' ? '#dc2626' : '#059669',
                    fontWeight: 600,
                    fontSize: '0.65rem',
                }}
            />
        )}
        <Box sx={{ display: 'flex', gap: 1 }}>
            <ButtonBase
                onClick={onCall}
                sx={{
                    flex: 1, bgcolor: '#10b981', color: 'white', py: 0.75, borderRadius: 1.5,
                    '&:hover': { bgcolor: '#059669' }
                }}
            >
                <PhoneIcon fontSize="small" />
            </ButtonBase>
            <ButtonBase
                onClick={onMessage}
                sx={{
                    flex: 1, bgcolor: '#6366f1', color: 'white', py: 0.75, borderRadius: 1.5,
                    '&:hover': { bgcolor: '#4f46e5' }
                }}
            >
                <MessageIcon fontSize="small" />
            </ButtonBase>
        </Box>
    </Box>
);

const DriverCard = ({ location, isActive, onClick, onDoubleClick }) => {
    const isDelayed = location?.status === 'sos' || location?.status === 'danger';
    const isOnline = location?.is_online !== false;
    
    const formatLastUpdated = (timestamp) => {
        if (!timestamp) return 'Unknown';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <Paper
            elevation={isActive ? 3 : 0}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
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
                        src={location?.profile_photo || location?.avatar || `https://i.pravatar.cc/150?u=${location?.user_id}`}
                        sx={{ width: 36, height: 36 }}
                    />
                    <Box>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1f2937', lineHeight: 1 }}>
                            {location?.name || location?.user_name || 'User Name'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
                            {location?.user_id || location?.id || 'ID-000'}
                        </Typography>
                    </Box>
                </Box>
                <Chip
                    size="small"
                    label={isDelayed ? 'SOS' : 'ACTIVE'}
                    sx={{
                        bgcolor: isDelayed ? '#fef2f2' : '#ecfdf5',
                        color: isDelayed ? '#dc2626' : '#059669',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        height: 20,
                    }}
                />
            </Box>

            <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Box sx={{ mt: 0.5, width: 8, height: 8, bgcolor: isDelayed ? '#ef4444' : '#6366f1', borderRadius: '50%' }} />
                    <Typography variant="body2" sx={{ color: '#4b5563', fontWeight: 500, fontSize: '0.8rem' }}>
                        Current Location
                        <Typography variant="caption" display="block" color="text.secondary">
                            {location?.address || `Lat: ${location?.latitude?.toFixed(4)}, Lng: ${location?.longitude?.toFixed(4)}`}
                        </Typography>
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ width: 6, height: 6, bgcolor: isOnline ? '#10b981' : '#9ca3af', borderRadius: '50%' }} />
                </Box>
                <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600 }}>
                    {formatLastUpdated(location?.last_updated)}
                </Typography>
            </Box>
        </Paper>
    );
};

const TaskCard = ({ task, isActive, onClick }) => {
    const statusColors = {
        pending: '#f59e0b',
        in_progress: '#6366f1',
        completed: '#10b981',
        cancelled: '#ef4444',
    };
    const color = statusColors[task?.status] || statusColors.pending;

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
                <Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1f2937', lineHeight: 1 }}>
                        {task?.title || task?.name || 'Task'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
                        {task?.id || 'TASK-000'}
                    </Typography>
                </Box>
                <Chip
                    size="small"
                    label={task?.status?.replace('_', ' ') || 'pending'}
                    sx={{
                        bgcolor: `${color}15`,
                        color: color,
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        textTransform: 'capitalize',
                    }}
                />
            </Box>

            <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: '#4b5563', fontSize: '0.8rem', mb: 1 }}>
                    {task?.description || 'No description'}
                </Typography>
                {task?.assigned_to && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Avatar
                            src={task.assigned_to.profile_photo || `https://i.pravatar.cc/150?u=${task.assigned_to.id}`}
                            sx={{ width: 20, height: 20 }}
                        />
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            {task.assigned_to.name || 'Assigned User'}
                        </Typography>
                    </Box>
                )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
                <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600 }}>
                    {task?.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                </Typography>
            </Box>
        </Paper>
    );
};

const LiveTrackingMap = () => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const mapRef = useRef(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [mainTab, setMainTab] = useState(0); // 0: Locations, 1: Tasks
    const [filterTab, setFilterTab] = useState(0); // 0: All, 1: Active, 2: SOS/Danger
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerUserId, setDrawerUserId] = useState(null);

    const { locations, loading: locationsLoading, selectedFamily } = useSelector((state) => state.tracking);
    const { sosAlerts } = useSelector((state) => state.tracking);

    useWebSocket({
        autoConnect: true,
        channels: ['admin', 'tracking'],
        onLocationUpdate: useCallback((payload) => {
            dispatch(updateLocation(payload));
        }, [dispatch]),
    });

    useEffect(() => {
        dispatch(fetchAllLocations())
            .unwrap()
            .catch((err) => {
                console.warn('Using demo locations:', err.message);
                // Use demo data as fallback - first clear any existing data
                dispatch(clearSelection());
                const demoLocations = demoTrackingData.getLocations();
                dispatch(setLocations(demoLocations));
            });
        dispatch(fetchSOSAlerts())
            .unwrap()
            .catch((err) => {
                console.warn('Using demo SOS alerts:', err.message);
                const demoAlerts = demoTrackingData.getSOSAlerts();
                dispatch(setSOSAlerts(demoAlerts));
            });
    }, [dispatch]);

    // Fetch family members when family is selected
    useEffect(() => {
        if (selectedFamily && selectedFamily.id) {
            adminApi.getFamilyLocations(selectedFamily.id)
                .then(res => {
                    if (res.data?.success && (res.data.locations || res.data.members)) {
                        const familyLocs = res.data.locations || res.data.members;
                        // Update locations with family member data
                        dispatch(setLocations(familyLocs));
                    }
                })
                .catch(err => {
                    console.warn('Using family member data:', err.message);
                    // Use family members from selectedFamily
                    if (selectedFamily.members) {
                        dispatch(setLocations(selectedFamily.members));
                    }
                });
        }
    }, [selectedFamily?.id, dispatch]);

    useEffect(() => {
        if (mainTab === 1) {
            setTasksLoading(true);
            adminApi.getTasks?.()
                .then(res => {
                    if (res.data?.success && res.data?.tasks) {
                        setTasks(res.data.tasks);
                    } else {
                        // Use demo tasks as fallback
                        setTasks(demoTrackingData.getTasks ? demoTrackingData.getTasks() : []);
                    }
                })
                .catch(() => {
                    // Use demo tasks as fallback
                    setTasks(demoTrackingData.getTasks ? demoTrackingData.getTasks() : []);
                })
                .finally(() => setTasksLoading(false));
        }
    }, [mainTab]);

    // Derived states
    const filteredLocations = useMemo(() => {
        let result = locations || [];

        // If a family is selected, filter to only show family members
        if (selectedFamily && selectedFamily.members && selectedFamily.members.length > 0) {
            const familyMemberIds = selectedFamily.members.map(m => m.user_id || m.id);
            result = result.filter(loc => 
                familyMemberIds.includes(loc.user_id) || 
                familyMemberIds.includes(loc.id)
            );
            // If no live locations match, use family members directly
            if (result.length === 0) {
                result = selectedFamily.members.map(member => ({
                    ...member,
                    status: member.is_online ? 'active' : 'offline',
                }));
            }
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(loc =>
                loc.name?.toLowerCase().includes(query) ||
                loc.user_name?.toLowerCase().includes(query) ||
                loc.user_id?.toString().includes(query)
            );
        }

        if (filterTab === 1) {
            result = result.filter(loc => loc.status !== 'sos' && loc.status !== 'danger');
        } else if (filterTab === 2) {
            result = result.filter(loc => loc.status === 'sos' || loc.status === 'danger');
        }

        return result;
    }, [locations, selectedFamily, searchQuery, filterTab]);

    const filteredTasks = useMemo(() => {
        let result = tasks || [];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(task =>
                task.title?.toLowerCase().includes(query) ||
                task.name?.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query) ||
                task.id?.toString().includes(query)
            );
        }

        if (filterTab === 1) {
            result = result.filter(task => task.status === 'in_progress' || task.status === 'active');
        } else if (filterTab === 2) {
            result = result.filter(task => task.status === 'pending' || task.status === 'cancelled');
        }

        return result;
    }, [tasks, searchQuery, filterTab]);

    const activeUser = useMemo(() =>
        locations.find(l => l.user_id === selectedUserId),
        [locations, selectedUserId]);

    const activeSOSCount = sosAlerts?.filter(a => a.status === 'active').length || 0;

    const handleCall = (location) => {
        if (location?.phone) {
            window.open(`tel:${location.phone}`);
        }
    };

    const handleMessage = (location) => {
        if (location?.user_id) {
            console.log('Message user:', location.user_id);
        }
    };

    const handleOpenDrawer = (userId) => {
        setDrawerUserId(userId);
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setDrawerUserId(null);
    };

    return (
        <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f4f4f5' }}>
            <style>{`
                .leaflet-popup-content-wrapper { border-radius: 16px !important; padding: 0 !important; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important; }
                .leaflet-popup-content { margin: 12px 16px !important; }
                .leaflet-popup-tip { background: white; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* SOS Alert Banner */}
            {activeSOSCount > 0 && (
                <Box sx={{
                    position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 1001, bgcolor: '#fef2f2', border: '1px solid #fecaca',
                    borderRadius: 2, px: 3, py: 1.5, display: 'flex', alignItems: 'center', gap: 2,
                    animation: 'pulse 2s infinite'
                }}>
                    <WarningIcon sx={{ color: '#dc2626' }} />
                    <Typography variant="body2" sx={{ color: '#dc2626', fontWeight: 600 }}>
                        {activeSOSCount} Active SOS Alert{activeSOSCount > 1 ? 's' : ''} - Requires Attention
                    </Typography>
                </Box>
            )}

            {/* Selected Family Header */}
            {selectedFamily && (
                <Box sx={{
                    position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 1001, bgcolor: 'white', border: '1px solid',
                    borderColor: 'divider', borderRadius: 2, px: 3, py: 1.5, display: 'flex', 
                    alignItems: 'center', gap: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupIcon sx={{ color: 'primary.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {selectedFamily.name || 'Family'} - {selectedFamily.members?.length || 0} Members
                        </Typography>
                    </Box>
                    <ButtonBase 
                        onClick={() => dispatch(clearSelection())}
                        sx={{ 
                            color: 'error.main', 
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            '&:hover': { bgcolor: 'error.light', color: 'white', borderRadius: 1 }
                        }}
                    >
                        Clear
                    </ButtonBase>
                </Box>
            )}

            <Box sx={{ flexGrow: 1, position: 'relative', zIndex: 1 }}>
                <MapContainer
                    center={[34.0522, -118.2437]}
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                    ref={mapRef}
                    zoomControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    />

                    {/* Route polyline for active user */}
                    {activeUser && activeUser.history && activeUser.history.length > 1 && (
                        <Polyline
                            positions={activeUser.history.map(h => [h.latitude, h.longitude])}
                            color="#6366f1"
                            weight={3}
                            opacity={0.7}
                        />
                    )}

                    {filteredLocations.map((loc) => (
                        <Marker
                            key={loc.user_id || loc.id}
                            position={[loc.latitude, loc.longitude]}
                            icon={createLocationIcon(selectedUserId === (loc.user_id || loc.id), loc.status)}
                            eventHandlers={{
                                click: () => {
                                    setSelectedUserId(loc.user_id || loc.id);
                                    mapRef.current?.flyTo([loc.latitude, loc.longitude], 14, { duration: 0.8 });
                                }
                            }}
                        >
                            <Popup closeButton={false} autoPanPadding={[50, 50]}>
                                <UserPopover 
                                    location={loc} 
                                    onCall={() => handleCall(loc)}
                                    onMessage={() => handleMessage(loc)}
                                    onDoubleClick={() => handleOpenDrawer(loc.user_id || loc.id)}
                                />
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
                            Locations <Box component="span" sx={{ ml: 1, bgcolor: mainTab === 0 ? 'rgba(255,255,255,0.2)' : '#e5e7eb', px: 1, py: 0.25, borderRadius: 1, fontSize: '0.7rem' }}>{filteredLocations.length}</Box>
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
                            Tasks <Box component="span" sx={{ ml: 1, bgcolor: mainTab === 1 ? 'rgba(255,255,255,0.2)' : '#e5e7eb', px: 1, py: 0.25, borderRadius: 1, fontSize: '0.7rem' }}>{tasks.length || 0}</Box>
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
                        <Tab label="Active" />
                        <Tab label="SOS" />
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
                            placeholder={mainTab === 0 ? "Search locations..." : "Search tasks..."}
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
                        bgcolor: '#fafafa',
                        minHeight: mainTab === 0 ? 'auto' : 200,
                    }}
                >
                    {mainTab === 0 ? (
                        filteredLocations.length > 0 ? (
                            filteredLocations.map(loc => (
                                <DriverCard
                                    key={loc.user_id || loc.id}
                                    location={loc}
                                    isActive={selectedUserId === (loc.user_id || loc.id)}
                                    onClick={() => {
                                        setSelectedUserId(loc.user_id || loc.id);
                                        mapRef.current?.flyTo([loc.latitude, loc.longitude], 14, { duration: 0.8 });
                                    }}
                                    onDoubleClick={() => handleOpenDrawer(loc.user_id || loc.id)}
                                />
                            ))
                        ) : (
                            <Typography sx={{ color: 'text.secondary', py: 4, px: 2 }}>
                                {searchQuery ? 'No locations match your search.' : 'No locations available.'}
                            </Typography>
                        )
                    ) : tasksLoading ? (
                        <Typography sx={{ color: 'text.secondary', py: 4, px: 2 }}>Loading tasks...</Typography>
                    ) : filteredTasks.length > 0 ? (
                        filteredTasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                isActive={false}
                                onClick={() => console.log('View task:', task.id)}
                            />
                        ))
                    ) : (
                        <Typography sx={{ color: 'text.secondary', py: 4, px: 2 }}>
                            {searchQuery ? 'No tasks match your search.' : 'No tasks available.'}
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

            <UserDetailDrawer
                open={drawerOpen}
                onClose={handleCloseDrawer}
                userId={drawerUserId}
            />

        </Box>
    );
};

export default LiveTrackingMap;
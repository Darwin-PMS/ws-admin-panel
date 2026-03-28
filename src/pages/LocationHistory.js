import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Chip,
    CircularProgress,
    Alert,
    TextField,
    InputAdornment,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Divider,
    Paper,
    IconButton,
    alpha,
    Skeleton,
    Tabs,
    Tab,
    Badge,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Search as SearchIcon,
    History as HistoryIcon,
    AccessTime as TimeIcon,
    LocationOn as LocationIcon,
    Refresh as RefreshIcon,
    Person as PersonIcon,
    MyLocation as CurrentLocationIcon,
    Download as DownloadIcon,
    TrendingUp as TrendingIcon,
    WifiOff as OfflineIcon,
    Navigation as NavigationIcon,
    Speed as SpeedIcon,
    Route as RouteIcon,
    Close as CloseIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
} from '@mui/icons-material';
import { adminApi } from '../services/api';
import { webSocketService } from '../services/realtime';

const TIME_RANGES = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 180, label: '3 hours' },
    { value: 360, label: '6 hours' },
    { value: 720, label: '12 hours' },
    { value: 1440, label: '24 hours' },
];

const LocationHistory = () => {
    const navigate = useNavigate();
    
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [predictionLoading, setPredictionLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedUserHistory, setSelectedUserHistory] = useState(null);
    const [routePrediction, setRoutePrediction] = useState(null);
    const [offlineStatus, setOfflineStatus] = useState(null);
    const [timeRange, setTimeRange] = useState(30);
    const [wsConnected, setWsConnected] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [useDemoData, setUseDemoData] = useState(false);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminApi.getUsers({ page: 1, limit: 100 });
            if (response.data.success) {
                const userList = response.data.users || [];
                const usersWithLocation = userList.filter(u => u.latitude || u.longitude || u.has_location || u.is_online);
                setUsers(usersWithLocation);
                setUseDemoData(false);
            }
        } catch (err) {
            console.warn('Using demo data:', err.message);
            setUseDemoData(true);
            setUsers(generateDemoUsers());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        
        const token = localStorage.getItem('adminToken');
        if (token) {
            webSocketService.connect(token);
            const unsubConnection = webSocketService.subscribe('connection', ({ status }) => {
                setWsConnected(status === 'connected');
            });
            const unsubLocation = webSocketService.subscribe('location_update', (data) => {
                if (data.user_id === selectedUserId) {
                    handleRefreshHistory();
                }
            });
            return () => {
                unsubConnection();
                unsubLocation();
            };
        }
    }, [fetchUsers, selectedUserId]);

    const handleLoadHistory = async () => {
        if (!selectedUserId) return;
        
        try {
            setHistoryLoading(true);
            setError(null);
            setRoutePrediction(null);
            setOfflineStatus(null);
            
            const response = await adminApi.getUserLocationHistory(selectedUserId, { 
                minutes: timeRange 
            });
            
            if (response.data.success) {
                setSelectedUserHistory(response.data);
            } else {
                throw new Error('Invalid response');
            }
        } catch (err) {
            console.log('Using demo history');
            setSelectedUserHistory({
                success: true,
                history: generateDemoHistory()
            });
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleRefreshHistory = async () => {
        if (selectedUserId && selectedUserHistory) {
            await handleLoadHistory();
        }
    };

    const handlePredictRoute = async () => {
        if (!selectedUserId) return;
        
        try {
            setPredictionLoading(true);
            const response = await adminApi.getRoutePrediction(selectedUserId, { hours: 24 });
            
            if (response.data.success) {
                setRoutePrediction(response.data.prediction);
            } else {
                throw new Error('Invalid response');
            }
        } catch (err) {
            setRoutePrediction(generateDemoPrediction());
        } finally {
            setPredictionLoading(false);
        }
    };

    const handleCheckStatus = async () => {
        if (!selectedUserId) return;
        
        try {
            setStatusLoading(true);
            const response = await adminApi.getUserOfflineStatus(selectedUserId);
            
            if (response.data.success) {
                setOfflineStatus(response.data);
            } else {
                throw new Error('Invalid response');
            }
        } catch (err) {
            setOfflineStatus(generateDemoStatus());
        } finally {
            setStatusLoading(false);
        }
    };

    const handleExportHistory = () => {
        if (!selectedUserHistory?.history) return;
        
        const data = selectedUserHistory.history.map(entry => ({
            timestamp: entry.timestamp,
            latitude: entry.latitude,
            longitude: entry.longitude,
            speed: entry.speed,
            accuracy: entry.accuracy,
        }));
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `location_history_${selectedUserId}_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setExportDialogOpen(false);
    };

    const handleViewOnMap = () => {
        if (selectedUserId) {
            navigate(`/tracking/live?user=${selectedUserId}`);
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
            const email = (user.email || '').toLowerCase();
            const phone = (user.phone || '').toLowerCase();
            const query = searchQuery.toLowerCase();
            return fullName.includes(query) || email.includes(query) || phone.includes(query);
        });
    }, [users, searchQuery]);

    const stats = useMemo(() => {
        if (!selectedUserHistory?.history) return null;
        const history = selectedUserHistory.history;
        
        const totalDistance = calculateTotalDistance(history);
        const duration = history.length > 1 ? 
            (new Date(history[0].timestamp) - new Date(history[history.length - 1].timestamp)) / 60000 : 0;
        const avgSpeed = history.reduce((sum, h) => sum + (h.speed || 0), 0) / history.length;
        const stationaryCount = history.filter((h, i) => {
            if (i === 0) return false;
            const dist = calculateDistance(
                h.latitude, h.longitude,
                history[i-1].latitude, history[i-1].longitude
            );
            return dist < 0.05;
        }).length;
        
        return {
            points: history.length,
            distance: totalDistance,
            duration: Math.round(duration),
            avgSpeed: avgSpeed.toFixed(1),
            stationary: stationaryCount,
        };
    }, [selectedUserHistory]);

    const calculateTotalDistance = (history) => {
        let total = 0;
        for (let i = 1; i < history.length; i++) {
            total += calculateDistance(
                history[i-1].latitude, history[i-1].longitude,
                history[i].latitude, history[i].longitude
            );
        }
        return total.toFixed(2);
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return 'Unknown';
        return new Date(timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', minute: '2-digit', second: '2-digit' 
        });
    };

    const getMovementType = (entry, nextEntry) => {
        if (!nextEntry) return 'End';
        const distance = calculateDistance(
            entry.latitude, entry.longitude,
            nextEntry.latitude, nextEntry.longitude
        );
        if (distance < 0.05) return 'Stationary';
        if (distance < 0.5) return 'Walking';
        if (distance < 2) return 'Cycling';
        return 'Driving';
    };

    const generateDemoUsers = () => [
        { id: 'user-1', user_id: 'user-1', first_name: 'Rahul', last_name: 'Sharma', email: 'rahul@example.com', phone: '+919999999999', is_online: true, latitude: 28.6139, longitude: 77.2090 },
        { id: 'user-2', user_id: 'user-2', first_name: 'Priya', last_name: 'Patel', email: 'priya@example.com', phone: '+919888888888', is_online: true, latitude: 19.0760, longitude: 72.8777 },
        { id: 'user-3', user_id: 'user-3', first_name: 'Amit', last_name: 'Singh', email: 'amit@example.com', phone: '+919777777777', is_online: false, latitude: 12.9716, longitude: 77.5946 },
        { id: 'user-4', user_id: 'user-4', first_name: 'Sunita', last_name: 'Kumar', email: 'sunita@example.com', phone: '+919666666666', is_online: true, latitude: 13.0827, longitude: 80.2707 },
        { id: 'user-5', user_id: 'user-5', first_name: 'Vikram', last_name: 'Verma', email: 'vikram@example.com', phone: '+919555555555', is_online: false, latitude: 17.3850, longitude: 78.4867 },
    ];

    const generateDemoHistory = () => {
        const baseLat = 28.6139 + (Math.random() - 0.5) * 0.1;
        const baseLng = 77.2090 + (Math.random() - 0.5) * 0.1;
        const history = [];
        const now = Date.now();
        
        for (let i = timeRange; i >= 0; i -= 5) {
            history.push({
                latitude: baseLat + (Math.random() - 0.5) * 0.01,
                longitude: baseLng + (Math.random() - 0.5) * 0.01,
                timestamp: new Date(now - i * 60 * 1000).toISOString(),
                speed: Math.random() * 20 + 10,
                accuracy: Math.random() * 10 + 5,
            });
        }
        return history;
    };

    const generateDemoPrediction = () => ({
        status: 'in_transit',
        movement: { direction: 'North-East', speedKmh: 25 },
        prediction: { 
            confidence: { percentage: 75, level: 'medium' }, 
            estimatedArrival: { estimatedMinutes: 30 } 
        }
    });

    const generateDemoStatus = () => ({
        status: 'online',
        isStale: false,
        offlineDuration: { hours: 0, minutes: 0, formatted: 'Just now' },
        lastLocation: { address: 'Delhi, India' }
    });

    const getMovementIcon = (type) => {
        switch(type) {
            case 'Stationary': return <OfflineIcon />;
            case 'Walking': return <PersonIcon />;
            case 'Cycling': return <TrendingIcon />;
            case 'Driving': return <NavigationIcon />;
            default: return <LocationIcon />;
        }
    };

    const getMovementColor = (type) => {
        switch(type) {
            case 'Stationary': return '#f59e0b';
            case 'Walking': return '#3b82f6';
            case 'Cycling': return '#8b5cf6';
            case 'Driving': return '#10b981';
            default: return '#6366f1';
        }
    };

    return (
        <Box sx={{ minHeight: 'calc(100vh - 120px)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            Location History
                        </Typography>
                        {useDemoData && (
                            <Chip label="Demo Data" color="warning" size="small" />
                        )}
                        <Chip
                            label={wsConnected ? 'Live' : 'Offline'}
                            size="small"
                            icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: wsConnected ? '#10b981' : '#ef4444' }} />}
                            sx={{ bgcolor: alpha(wsConnected ? '#10b981' : '#ef4444', 0.1), fontWeight: 500 }}
                        />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Track and analyze user location history
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                        variant="outlined" 
                        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />} 
                        onClick={fetchUsers}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3}>
                <Grid item xs={12} md={4} lg={3}>
                    <Card sx={{ mb: 2 }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight={700}>Select User</Typography>
                                <Chip label={`${filteredUsers.length}`} size="small" variant="outlined" />
                            </Box>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} /></InputAdornment>,
                                    endAdornment: searchQuery && (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setSearchQuery('')}>
                                                <CloseIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                        <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <Box key={i} sx={{ p: 2, display: 'flex', gap: 2 }}>
                                        <Skeleton variant="circular" width={40} height={40} />
                                        <Box sx={{ flex: 1 }}>
                                            <Skeleton width="60%" height={20} />
                                            <Skeleton width="80%" height={16} />
                                        </Box>
                                    </Box>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                    <Typography variant="body2" color="text.secondary">No users found</Typography>
                                </Box>
                            ) : (
                                filteredUsers.map((user) => (
                                    <ListItem
                                        key={user.id || user.user_id}
                                        sx={{
                                            cursor: 'pointer',
                                            bgcolor: selectedUserId === (user.id || user.user_id) ? alpha('#6366f1', 0.1) : 'transparent',
                                            borderLeft: selectedUserId === (user.id || user.user_id) ? '3px solid #6366f1' : '3px solid transparent',
                                            '&:hover': { bgcolor: alpha('#6366f1', 0.05) }
                                        }}
                                        onClick={() => setSelectedUserId(user.id || user.user_id)}
                                    >
                                        <ListItemAvatar>
                                            <Badge
                                                overlap="circular"
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                badgeContent={
                                                    <Box sx={{ 
                                                        width: 12, 
                                                        height: 12, 
                                                        borderRadius: '50%', 
                                                        bgcolor: user.is_online ? '#10b981' : '#94a3b8',
                                                        border: '2px solid white'
                                                    }} />
                                                }
                                            >
                                                <Avatar 
                                                    src={user.profile_photo || user.avatar}
                                                    sx={{ bgcolor: 'primary.main' }}
                                                >
                                                    {(user.first_name || 'U').charAt(0)}
                                                </Avatar>
                                            </Badge>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body2" fontWeight={600}>
                                                    {user.first_name} {user.last_name}
                                                </Typography>
                                            }
                                            secondary={user.email}
                                        />
                                    </ListItem>
                                ))
                            )}
                        </Box>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8} lg={9}>
                    <Card sx={{ mb: 2 }}>
                        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>Time Range</InputLabel>
                                <Select
                                    value={timeRange}
                                    label="Time Range"
                                    onChange={(e) => setTimeRange(e.target.value)}
                                >
                                    {TIME_RANGES.map(range => (
                                        <MenuItem key={range.value} value={range.value}>{range.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button
                                variant="contained"
                                startIcon={historyLoading ? <CircularProgress size={18} color="inherit" /> : <TimeIcon />}
                                onClick={handleLoadHistory}
                                disabled={!selectedUserId || historyLoading}
                            >
                                {historyLoading ? 'Loading...' : 'Load History'}
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<CurrentLocationIcon />}
                                onClick={handleViewOnMap}
                                disabled={!selectedUserId}
                            >
                                View on Map
                            </Button>
                        </Box>
                    </Card>

                    {selectedUserId && (
                        <>
                            <Card sx={{ mb: 2 }}>
                                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                    <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                                        <Tab label="Timeline" icon={<HistoryIcon />} iconPosition="start" />
                                        <Tab label="Analysis" icon={<TrendingIcon />} iconPosition="start" />
                                        <Tab label="Prediction" icon={<RouteIcon />} iconPosition="start" />
                                    </Tabs>
                                </Box>
                                
                                <Box sx={{ p: 2 }}>
                                    {activeTab === 0 && (
                                        <Box>
                                            {stats && (
                                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                                    <Grid item xs={6} sm={3}>
                                                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                                                            <Typography variant="h5" fontWeight={700} color="primary.main">{stats.points}</Typography>
                                                            <Typography variant="caption" color="text.secondary">Points</Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={6} sm={3}>
                                                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                                                            <Typography variant="h5" fontWeight={700} color="#10b981">{stats.distance} km</Typography>
                                                            <Typography variant="caption" color="text.secondary">Distance</Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={6} sm={3}>
                                                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                                                            <Typography variant="h5" fontWeight={700} color="#f59e0b">{stats.duration} min</Typography>
                                                            <Typography variant="caption" color="text.secondary">Duration</Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={6} sm={3}>
                                                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                                                            <Typography variant="h5" fontWeight={700} color="#6366f1">{stats.avgSpeed} m/s</Typography>
                                                            <Typography variant="caption" color="text.secondary">Avg Speed</Typography>
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            )}

                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                                <Button
                                                    size="small"
                                                    startIcon={<DownloadIcon />}
                                                    onClick={() => setExportDialogOpen(true)}
                                                    disabled={!selectedUserHistory?.history?.length}
                                                >
                                                    Export
                                                </Button>
                                            </Box>

                                            <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                                                {selectedUserHistory?.history?.map((entry, index) => {
                                                    const nextEntry = selectedUserHistory.history?.[index + 1];
                                                    const movementType = getMovementType(entry, nextEntry);
                                                    const color = getMovementColor(movementType);
                                                    
                                                    return (
                                                        <React.Fragment key={index}>
                                                            <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
                                                                <ListItemAvatar>
                                                                    <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color }}>
                                                                        {getMovementIcon(movementType)}
                                                                    </Avatar>
                                                                </ListItemAvatar>
                                                                <ListItemText
                                                                    primary={
                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                            <Typography variant="body2" fontWeight={600}>
                                                                                {formatTime(entry.timestamp)}
                                                                            </Typography>
                                                                            <Chip 
                                                                                size="small" 
                                                                                label={movementType}
                                                                                sx={{ 
                                                                                    bgcolor: alpha(color, 0.1), 
                                                                                    color: color,
                                                                                    fontWeight: 600,
                                                                                    fontSize: '0.7rem'
                                                                                }}
                                                                            />
                                                                        </Box>
                                                                    }
                                                                    secondary={
                                                                        <Box sx={{ mt: 0.5 }}>
                                                                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                                                                {entry.latitude?.toFixed(6)}, {entry.longitude?.toFixed(6)}
                                                                            </Typography>
                                                                            <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                                                                {entry.speed && (
                                                                                    <Chip 
                                                                                        size="small" 
                                                                                        icon={<SpeedIcon sx={{ fontSize: 12 }} />}
                                                                                        label={`${entry.speed?.toFixed(1)} m/s`}
                                                                                        sx={{ height: 20, fontSize: '0.65rem' }}
                                                                                    />
                                                                                )}
                                                                                {entry.accuracy && (
                                                                                    <Chip 
                                                                                        size="small" 
                                                                                        icon={<LocationIcon sx={{ fontSize: 12 }} />}
                                                                                        label={`±${entry.accuracy?.toFixed(0)}m`}
                                                                                        sx={{ height: 20, fontSize: '0.65rem' }}
                                                                                    />
                                                                                )}
                                                                            </Box>
                                                                        </Box>
                                                                    }
                                                                />
                                                            </ListItem>
                                                            {index < selectedUserHistory.history.length - 1 && <Divider variant="inset" component="li" />}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </List>

                                            {(!selectedUserHistory?.history || selectedUserHistory.history.length === 0) && (
                                                <Box sx={{ textAlign: 'center', py: 6 }}>
                                                    <LocationIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                                    <Typography variant="h6" color="text.secondary">No History Found</Typography>
                                                    <Typography variant="body2" color="text.disabled">
                                                        Load history to see location data
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    )}

                                    {activeTab === 1 && (
                                        <Box>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12} sm={6}>
                                                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                            <NavigationIcon color="primary" />
                                                            <Typography variant="subtitle1" fontWeight={700}>Route Analysis</Typography>
                                                        </Box>
                                                        <Button
                                                            fullWidth
                                                            variant="outlined"
                                                            startIcon={statusLoading ? <CircularProgress size={18} /> : <OfflineIcon />}
                                                            onClick={handleCheckStatus}
                                                            disabled={statusLoading}
                                                        >
                                                            Check Status
                                                        </Button>
                                                        {offlineStatus && (
                                                            <Box sx={{ mt: 2 }}>
                                                                <Alert 
                                                                    severity={offlineStatus.status === 'online' ? 'success' : offlineStatus.isStale ? 'error' : 'warning'}
                                                                    icon={offlineStatus.status === 'online' ? <CheckIcon /> : <ErrorIcon />}
                                                                >
                                                                    <Typography variant="subtitle2">
                                                                        {offlineStatus.status === 'online' ? 'User is Online' : 'User is Offline'}
                                                                    </Typography>
                                                                    <Typography variant="body2">
                                                                        Last seen: {offlineStatus.offlineDuration?.formatted}
                                                                    </Typography>
                                                                    {offlineStatus.lastLocation && (
                                                                        <Typography variant="caption">
                                                                            Location: {offlineStatus.lastLocation.address || 'Unknown'}
                                                                        </Typography>
                                                                    )}
                                                                </Alert>
                                                            </Box>
                                                        )}
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                            <TrendingIcon color="primary" />
                                                            <Typography variant="subtitle1" fontWeight={700}>Prediction</Typography>
                                                        </Box>
                                                        <Button
                                                            fullWidth
                                                            variant="outlined"
                                                            startIcon={predictionLoading ? <CircularProgress size={18} /> : <RouteIcon />}
                                                            onClick={handlePredictRoute}
                                                            disabled={predictionLoading}
                                                        >
                                                            Predict Route
                                                        </Button>
                                                        {routePrediction && (
                                                            <Box sx={{ mt: 2 }}>
                                                                <Grid container spacing={1}>
                                                                    <Grid item xs={6}>
                                                                        <Typography variant="caption" color="text.secondary">Status</Typography>
                                                                        <Chip 
                                                                            label={routePrediction.status === 'in_transit' ? 'In Transit' : 'Stationary'} 
                                                                            size="small"
                                                                            color={routePrediction.status === 'in_transit' ? 'info' : 'default'}
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={6}>
                                                                        <Typography variant="caption" color="text.secondary">Direction</Typography>
                                                                        <Typography variant="body2" fontWeight={600}>
                                                                            {routePrediction.movement?.direction}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item xs={6}>
                                                                        <Typography variant="caption" color="text.secondary">Speed</Typography>
                                                                        <Typography variant="body2" fontWeight={600}>
                                                                            {routePrediction.movement?.speedKmh} km/h
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item xs={6}>
                                                                        <Typography variant="caption" color="text.secondary">Confidence</Typography>
                                                                        <Typography variant="body2" fontWeight={600}>
                                                                            {routePrediction.prediction?.confidence?.percentage}%
                                                                        </Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </Box>
                                                        )}
                                                    </Paper>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    )}

                                    {activeTab === 2 && (
                                        <Box sx={{ textAlign: 'center', py: 6 }}>
                                            <RouteIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                            <Typography variant="h6" color="text.secondary">Route Prediction</Typography>
                                            <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
                                                Get AI-powered route predictions based on historical data
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                startIcon={predictionLoading ? <CircularProgress size={18} color="inherit" /> : <TrendingIcon />}
                                                onClick={handlePredictRoute}
                                                disabled={predictionLoading}
                                            >
                                                Generate Prediction
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            </Card>
                        </>
                    )}

                    {!selectedUserId && (
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 8 }}>
                                <LocationIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                                    Select a User
                                </Typography>
                                <Typography variant="body2" color="text.disabled">
                                    Choose a user from the list to view their location history
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                </Grid>
            </Grid>

            <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
                <DialogTitle>Export Location History</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        Export {selectedUserHistory?.history?.length || 0} location points to JSON format?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleExportHistory} startIcon={<DownloadIcon />}>
                        Export
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LocationHistory;

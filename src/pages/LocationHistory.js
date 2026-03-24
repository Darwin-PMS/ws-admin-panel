import React, { useEffect, useState, useCallback } from 'react';
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
    Tooltip,
    LinearProgress,
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
    FilterList as FilterIcon,
    TrendingUp as TrendingIcon,
    WifiOff as OfflineIcon,
    Wifi as OnlineIcon,
    Navigation as NavigationIcon,
    Speed as SpeedIcon,
    Route as RouteIcon,
} from '@mui/icons-material';
import { adminApi } from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserHistory, setSelectedUser } from '../store/slices/trackingSlice';

const LocationHistory = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { locations } = useSelector((state) => state.tracking);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [predictionLoading, setPredictionLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedUserHistory, setSelectedUserHistory] = useState(null);
    const [routePrediction, setRoutePrediction] = useState(null);
    const [offlineStatus, setOfflineStatus] = useState(null);
    const [timeRange, setTimeRange] = useState(30);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminApi.getUsers({ limit: 100, has_location: true });
            if (response.data.success) {
                setUsers(response.data.users || response.data.data || []);
            } else {
                setUsers(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleLoadHistory = async () => {
        if (!selectedUserId) return;
        
        try {
            setHistoryLoading(true);
            setError(null);
            const response = await adminApi.getUserLocationHistory(selectedUserId, { 
                minutes: timeRange 
            });
            setSelectedUserHistory(response.data);
            dispatch(setSelectedUser(users.find(u => u.id === selectedUserId || u.user_id === selectedUserId)));
            
            setRoutePrediction(null);
            setOfflineStatus(null);
        } catch (err) {
            console.error('Error loading history:', err);
            setError('Failed to load location history');
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleViewOnMap = () => {
        if (selectedUserId) {
            navigate('/tracking/live');
        }
    };

    const handlePredictRoute = async () => {
        if (!selectedUserId) return;
        
        try {
            setPredictionLoading(true);
            const response = await adminApi.getRoutePrediction(selectedUserId, { hours: 24 });
            if (response.data.success) {
                setRoutePrediction(response.data.prediction);
            }
        } catch (err) {
            console.error('Error predicting route:', err);
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
            }
        } catch (err) {
            console.error('Error checking status:', err);
        } finally {
            setStatusLoading(false);
        }
    };

    const filteredUsers = users.filter((user) => {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
        const email = (user.email || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        return fullName.includes(term) || email.includes(term);
    });

    const formatTime = (timestamp) => {
        if (!timestamp) return 'Unknown';
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Unknown';
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getDuration = (start, end) => {
        if (!start || !end) return '-';
        const ms = new Date(end).getTime() - new Date(start).getTime();
        const minutes = Math.floor(ms / 60000);
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${minutes % 60}m`;
    };

    const getMovementType = (entry, nextEntry) => {
        if (!nextEntry) return 'End';
        const distance = calculateDistance(
            entry.latitude, entry.longitude,
            nextEntry.latitude, nextEntry.longitude
        );
        if (distance < 0.05) return 'Stationary';
        if (distance < 0.5) return 'Walking';
        return 'Moving';
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

    const selectedUser = users.find(u => 
        (u.id === selectedUserId || u.user_id === selectedUserId) && selectedUserId
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <HistoryIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Location History
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchUsers}
                >
                    Refresh
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Select User
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                sx={{ mb: 2 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                                {filteredUsers.map((user) => (
                                    <ListItem
                                        key={user.id || user.user_id}
                                        sx={{
                                            cursor: 'pointer',
                                            bgcolor: selectedUserId === (user.id || user.user_id) ? 'action.selected' : 'transparent',
                                            borderRadius: 1,
                                            mb: 0.5,
                                            '&:hover': { bgcolor: 'action.hover' }
                                        }}
                                        onClick={() => setSelectedUserId(user.id || user.user_id)}
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                <PersonIcon />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown'}
                                            secondary={user.email}
                                        />
                                    </ListItem>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Load History
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>Time Range</InputLabel>
                                    <Select
                                        value={timeRange}
                                        label="Time Range"
                                        onChange={(e) => setTimeRange(e.target.value)}
                                    >
                                        <MenuItem value={15}>Last 15 minutes</MenuItem>
                                        <MenuItem value={30}>Last 30 minutes</MenuItem>
                                        <MenuItem value={60}>Last 1 hour</MenuItem>
                                        <MenuItem value={180}>Last 3 hours</MenuItem>
                                        <MenuItem value={1440}>Last 24 hours</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button
                                    variant="contained"
                                    startIcon={<TimeIcon />}
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
                        </CardContent>
                    </Card>

                    {selectedUserId && (
                        <>
                            <Card sx={{ mb: 3 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6">
                                            Route Analysis
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Tooltip title="Predict Route">
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={predictionLoading ? <CircularProgress size={16} /> : <TrendingIcon />}
                                                    onClick={handlePredictRoute}
                                                    disabled={predictionLoading}
                                                >
                                                    Predict
                                                </Button>
                                            </Tooltip>
                                            <Tooltip title="Check Status">
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={statusLoading ? <CircularProgress size={16} /> : <OfflineIcon />}
                                                    onClick={handleCheckStatus}
                                                    disabled={statusLoading}
                                                >
                                                    Status
                                                </Button>
                                            </Tooltip>
                                        </Box>
                                    </Box>

                                    {routePrediction && (
                                        <Box>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                            <NavigationIcon color="primary" />
                                                            <Typography variant="subtitle2">Current Status</Typography>
                                                        </Box>
                                                        <Chip 
                                                            sx={{ mb: 1 }}
                                                            label={routePrediction.status === 'in_transit' ? 'In Transit' : 'Stationary'}
                                                            color={routePrediction.status === 'in_transit' ? 'info' : 'default'}
                                                        />
                                                        <Typography variant="body2">
                                                            Direction: {routePrediction.movement.direction}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            Speed: {routePrediction.movement.speedKmh} km/h
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                            <RouteIcon color="primary" />
                                                            <Typography variant="subtitle2">Prediction</Typography>
                                                        </Box>
                                                        <Typography variant="body2">
                                                            Confidence: {routePrediction.prediction.confidence.percentage}%
 ({routePrediction.prediction.confidence.level})
                                                        </Typography>
                                                        {routePrediction.prediction.estimatedArrival && (
                                                            <Typography variant="body2">
                                                                ETA: {routePrediction.prediction.estimatedArrival.estimatedMinutes} min
                                                            </Typography>
                                                        )}
                                                    </Paper>
                                                </Grid>
                                            </Grid>
                                            <LinearProgress 
                                                sx={{ mt: 2 }} 
                                                variant="determinate" 
                                                value={routePrediction.prediction.confidence.percentage}
                                                color={routePrediction.prediction.confidence.level === 'high' ? 'success' : 'warning'}
                                            />
                                        </Box>
                                    )}

                                    {offlineStatus && (
                                        <Box sx={{ mt: 2 }}>
                                            <Alert 
                                                severity={offlineStatus.status === 'online' ? 'success' : offlineStatus.isStale ? 'error' : 'warning'}
                                                icon={offlineStatus.status === 'online' ? <OnlineIcon /> : <OfflineIcon />}
                                            >
                                                <Typography variant="subtitle2">
                                                    {offlineStatus.status === 'online' ? 'User is Online' : 'User is Offline'}
                                                </Typography>
                                                <Typography variant="body2">
                                                    Last seen: {offlineStatus.offlineDuration.formatted}
                                                    {offlineStatus.lastLocation && (
                                                        <> at {offlineStatus.lastLocation.address || `${offlineStatus.lastLocation.latitude}, ${offlineStatus.lastLocation.longitude}`}</>
                                                    )}
                                                </Typography>
                                            </Alert>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {selectedUserHistory && (
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Box>
                                        <Typography variant="h6">
                                            Location Timeline
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedUser?.first_name} {selectedUser?.last_name} - Last {timeRange} minutes
                                        </Typography>
                                    </Box>
                                    <Button
                                        size="small"
                                        startIcon={<DownloadIcon />}
                                    >
                                        Export
                                    </Button>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <Chip 
                                        icon={<TimeIcon />} 
                                        label={`${selectedUserHistory.history?.length || 0} Points`}
                                    />
                                    <Chip 
                                        icon={<LocationIcon />} 
                                        label={getDuration(
                                            selectedUserHistory.history?.[0]?.timestamp,
                                            selectedUserHistory.history?.[selectedUserHistory.history.length - 1]?.timestamp
                                        )}
                                    />
                                </Box>

                                <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                                    {selectedUserHistory.history?.map((entry, index) => {
                                        const nextEntry = selectedUserHistory.history?.[index + 1];
                                        const movementType = getMovementType(entry, nextEntry);
                                        return (
                                            <React.Fragment key={index}>
                                                <ListItem alignItems="flex-start">
                                                    <ListItemAvatar>
                                                        <Avatar sx={{ 
                                                            bgcolor: movementType === 'Stationary' ? 'warning.main' : 
                                                                     movementType === 'Walking' ? 'info.main' : 'success.main'
                                                        }}>
                                                            <LocationIcon />
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                                    {formatTime(entry.timestamp)}
                                                                </Typography>
                                                                <Chip 
                                                                    size="small" 
                                                                    label={movementType}
                                                                    sx={{
                                                                        bgcolor: movementType === 'Stationary' ? 'warning.main' : 
                                                                                 movementType === 'Walking' ? 'info.main' : 'success.main',
                                                                        color: 'white',
                                                                        fontSize: '0.7rem'
                                                                    }}
                                                                />
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Box sx={{ mt: 0.5 }}>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Lat: {entry.latitude?.toFixed(6)}, Lng: {entry.longitude?.toFixed(6)}
                                                                </Typography>
                                                                {entry.speed && (
                                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                                        Speed: {entry.speed?.toFixed(1)} m/s
                                                                    </Typography>
                                                                )}
                                                                {entry.accuracy && (
                                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                                        Accuracy: {entry.accuracy?.toFixed(0)}m
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        }
                                                    />
                                                </ListItem>
                                                {index < selectedUserHistory.history.length - 1 && <Divider variant="inset" component="li" />}
                                            </React.Fragment>
                                        );
                                    })}
                                </List>

                                {(!selectedUserHistory.history || selectedUserHistory.history.length === 0) && (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No location history found for this time period.
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {!selectedUserHistory && (
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 6 }}>
                                <TimeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">
                                    Select a user and load their location history
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    The timeline will show movement data for the selected time range
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default LocationHistory;

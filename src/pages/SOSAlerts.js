import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    TextField,
    Drawer,
    Alert,
    Skeleton,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    alpha,
    Avatar,
    Tooltip,
    Tabs,
    Tab,
    Badge,
    Switch,
    FormControlLabel,
    InputAdornment,
    CircularProgress,
    LinearProgress,
    Grid,
} from '@mui/material';
import {
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    LocationOn as LocationIcon,
    AccessTime as TimeIcon,
    Refresh as RefreshIcon,
    Close as CloseIcon,
    Phone as PhoneIcon,
    Map as MapIcon,
    NotificationsActive as AlertIcon,
    GppGood as AllClearIcon,
    VolumeUp as SoundOnIcon,
    VolumeOff as SoundOffIcon,
    DoneAll as ResolveAllIcon,
    FiberManualRecord as LiveIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Sync as SyncIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAlerts, resolveAlert, setStatusFilter } from '../store/slices/alertsSlice';
import { adminApi } from '../services/api';
import { AlertCard, AlertStatsBar } from '../components/UI';

const SOSAlerts = () => {
    const dispatch = useDispatch();
    const { alerts, loading, filters, error } = useSelector((state) => state.alerts);

    const [detailDrawer, setDetailDrawer] = useState({ open: false, alert: null });
    const [resolveDrawer, setResolveDrawer] = useState({ open: false, alert: null });
    const [resolveNote, setResolveNote] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [nearbyServices, setNearbyServices] = useState([]);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshCountdown, setRefreshCountdown] = useState(30);
    const countdownRef = useRef(null);

    const fetchAlertsData = useCallback(() => {
        dispatch(fetchAlerts({ status: filters.status !== 'all' ? filters.status : undefined }));
        setLastUpdated(new Date());
        setRefreshCountdown(30);
    }, [dispatch, filters.status]);

    useEffect(() => {
        fetchAlertsData();
        const interval = setInterval(fetchAlertsData, 30000);
        return () => clearInterval(interval);
    }, [fetchAlertsData]);

    useEffect(() => {
        if (loading) return;
        countdownRef.current = setInterval(() => {
            setRefreshCountdown((prev) => (prev > 0 ? prev - 1 : 30));
        }, 1000);
        return () => clearInterval(countdownRef.current);
    }, [loading]);

    useEffect(() => {
        if (detailDrawer.alert) {
            setSelectedAlert(detailDrawer.alert);
        }
    }, [detailDrawer.alert]);

    const handleResolve = async () => {
        try {
            await dispatch(resolveAlert(resolveDrawer.alert?.id)).unwrap();
            setResolveDrawer({ open: false, alert: null });
            setResolveNote('');
            fetchAlertsData();
        } catch (err) {
            console.error('Error resolving alert:', err);
        }
    };

    const handleResolveAll = async () => {
        const activeAlerts = alerts.filter(a => a.status === 'active');
        if (activeAlerts.length === 0) return;
        
        const confirmed = window.confirm(`Are you sure you want to resolve all ${activeAlerts.length} active alerts?`);
        if (!confirmed) return;

        for (const alert of activeAlerts) {
            try {
                await dispatch(resolveAlert(alert.id)).unwrap();
            } catch (err) {
                console.error('Error resolving alert:', err);
            }
        }
        fetchAlertsData();
    };

    const fetchNearbyServices = async (lat, lng) => {
        try {
            const res = await adminApi.getNearbyEmergencyServices({ lat, lng, radius: 10000 });
            setNearbyServices(res.data?.services || []);
        } catch (err) {
            console.error('Error fetching nearby services:', err);
        }
    };

    const openDetailDrawer = (alert) => {
        setDetailDrawer({ open: true, alert });
        if (alert.latitude && alert.longitude) {
            fetchNearbyServices(alert.latitude, alert.longitude);
        }
    };

    const handleCallUser = (phone) => {
        window.open(`tel:${phone}`, '_self');
    };

    const filteredAlerts = alerts.filter(alert => {
        if (activeTab === 1) return alert.status === 'active';
        if (activeTab === 2) return alert.status === 'resolved';
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                alert.userName?.toLowerCase().includes(query) ||
                alert.userPhone?.toLowerCase().includes(query) ||
                alert.message?.toLowerCase().includes(query) ||
                alert.location?.toLowerCase().includes(query)
            );
        }
        return true;
    });

    const activeAlerts = alerts.filter(a => a.status === 'active').length;
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved').length;
    const criticalAlerts = alerts.filter(a => a.status === 'active' && a.type === 'emergency').length;

    const formatLastUpdated = () => {
        if (!lastUpdated) return '';
        const now = new Date();
        const diff = Math.floor((now - lastUpdated) / 1000);
        if (diff < 60) return 'Updated just now';
        if (diff < 3600) return `Updated ${Math.floor(diff / 60)}m ago`;
        return `Updated at ${lastUpdated.toLocaleTimeString()}`;
    };

    return (
        <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                            <Typography variant="h4" sx={{ fontWeight: 800 }}>
                                SOS Alerts
                            </Typography>
                            <Chip
                                icon={<LiveIcon sx={{ fontSize: 12 }} />}
                                label={activeAlerts > 0 ? `${activeAlerts} Active` : 'All Clear'}
                                size="small"
                                sx={{
                                    bgcolor: activeAlerts > 0 ? alpha('#ef4444', 0.1) : alpha('#10b981', 0.1),
                                    color: activeAlerts > 0 ? '#ef4444' : '#10b981',
                                    fontWeight: 600,
                                    animation: activeAlerts > 0 ? 'pulse 2s infinite' : 'none',
                                }}
                            />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            Monitor and respond to emergency alerts in real-time
                        </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Paper
                            variant="outlined"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                            }}
                        >
                            <SyncIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                                Refresh in
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', minWidth: 20 }}>
                                {refreshCountdown}s
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={(refreshCountdown / 30) * 100}
                                sx={{
                                    width: 40,
                                    height: 4,
                                    borderRadius: 2,
                                    bgcolor: alpha('#6366f1', 0.1),
                                    '& .MuiLinearProgress-bar': { bgcolor: '#6366f1', borderRadius: 2 },
                                }}
                            />
                        </Paper>

                        <Tooltip title={soundEnabled ? 'Disable alert sounds' : 'Enable alert sounds'}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 2,
                                    bgcolor: soundEnabled ? alpha('#6366f1', 0.05) : 'transparent',
                                }}
                            >
                                {soundEnabled ? <SoundOnIcon sx={{ fontSize: 18, color: '#6366f1' }} /> : <SoundOffIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
                                <FormControlLabel
                                    control={
                                        <Switch
                                            size="small"
                                            checked={soundEnabled}
                                            onChange={(e) => setSoundEnabled(e.target.checked)}
                                            sx={{
                                                '& .MuiSwitch-switchBase.Mui-checked': { color: '#6366f1' },
                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#6366f1' },
                                            }}
                                        />
                                    }
                                    label=""
                                    sx={{ m: 0 }}
                                />
                            </Paper>
                        </Tooltip>

                        {activeAlerts > 0 && (
                            <Tooltip title={`Resolve all ${activeAlerts} active alerts`}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    startIcon={<ResolveAllIcon />}
                                    onClick={handleResolveAll}
                                    sx={{ fontWeight: 600 }}
                                >
                                    Resolve All
                                </Button>
                            </Tooltip>
                        )}

                        <Button
                            variant="outlined"
                            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
                            onClick={fetchAlertsData}
                            disabled={loading}
                        >
                            Refresh
                        </Button>
                    </Box>
                </Box>
            </Box>

            <AlertStatsBar
                stats={{ active: activeAlerts, resolved: resolvedAlerts, total: alerts.length, critical: criticalAlerts }}
                loading={loading}
            />

            <Card sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, flexWrap: 'wrap', gap: 2 }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={(_, v) => setActiveTab(v)}
                        sx={{
                            minHeight: 40,
                            '& .MuiTab-root': { minHeight: 40, py: 1 }
                        }}
                    >
                        <Tab 
                            label={
                                <Chip 
                                    label={`All (${alerts.length})`} 
                                    size="small" 
                                    variant={activeTab === 0 ? 'filled' : 'outlined'}
                                    sx={{ fontWeight: 600 }}
                                />
                            } 
                        />
                        <Tab 
                            label={
                                <Chip 
                                    label={`Active (${activeAlerts})`} 
                                    size="small" 
                                    color="error"
                                    variant={activeTab === 1 ? 'filled' : 'outlined'}
                                    sx={{ fontWeight: 600 }}
                                />
                            } 
                        />
                        <Tab 
                            label={
                                <Chip 
                                    label={`Resolved (${resolvedAlerts})`} 
                                    size="small" 
                                    color="success"
                                    variant={activeTab === 2 ? 'filled' : 'outlined'}
                                    sx={{ fontWeight: 600 }}
                                />
                            } 
                        />
                    </Tabs>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                            size="small"
                            placeholder="Search alerts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                                            <CloseIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ width: 240 }}
                        />

                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={filters.status}
                                onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                                label="Type"
                                startAdornment={
                                    <InputAdornment position="start">
                                        <FilterIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                    </InputAdornment>
                                }
                            >
                                <MenuItem value="all">All Types</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="resolved">Resolved</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
            </Card>

            {error && (
                <Alert 
                    severity="error" 
                    sx={{ mb: 2 }}
                    action={
                        <Button color="inherit" size="small" onClick={fetchAlertsData}>
                            Retry
                        </Button>
                    }
                >
                    {error}
                </Alert>
            )}

            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {loading && alerts.length === 0 ? (
                    <Box sx={{ p: 2 }}>
                        {[...Array(5)].map((_, i) => (
                            <Card key={i} sx={{ mb: 1.5 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Skeleton variant="circular" width={48} height={48} />
                                        <Box sx={{ flex: 1 }}>
                                            <Skeleton width="40%" height={24} />
                                            <Skeleton width="60%" height={20} sx={{ mt: 1 }} />
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                ) : filteredAlerts.length === 0 ? (
                    <Card>
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Box
                                sx={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: '50%',
                                    bgcolor: activeTab === 1 ? alpha('#10b981', 0.1) : alpha('#6366f1', 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 3,
                                }}
                            >
                                {activeTab === 1 ? (
                                    <CheckCircleIcon sx={{ fontSize: 60, color: '#10b981' }} />
                                ) : searchQuery ? (
                                    <SearchIcon sx={{ fontSize: 60, color: '#6366f1' }} />
                                ) : (
                                    <AllClearIcon sx={{ fontSize: 60, color: '#6366f1' }} />
                                )}
                            </Box>
                            <Typography variant="h5" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
                                {activeTab === 1 
                                    ? 'No Active Alerts' 
                                    : searchQuery 
                                        ? 'No Matching Alerts'
                                        : 'No Alerts Found'}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                                {activeTab === 1
                                    ? 'Great news! All emergency alerts have been resolved. Stay vigilant.'
                                    : searchQuery
                                        ? `No alerts match "${searchQuery}". Try adjusting your search.`
                                        : 'No alerts match your current filter criteria.'}
                            </Typography>
                            {searchQuery && (
                                <Button
                                    variant="text"
                                    sx={{ mt: 2 }}
                                    onClick={() => setSearchQuery('')}
                                >
                                    Clear Search
                                </Button>
                            )}
                        </Box>
                    </Card>
                ) : (
                    <Box>
                        {filteredAlerts.map((alert) => (
                            <AlertCard
                                key={alert.id}
                                alert={alert}
                                onView={openDetailDrawer}
                                onResolve={(a) => setResolveDrawer({ open: true, alert: a })}
                                onCall={handleCallUser}
                            />
                        ))}
                    </Box>
                )}
            </Box>

            <Drawer
                anchor="right"
                open={detailDrawer.open}
                onClose={() => setDetailDrawer({ open: false, alert: null })}
                PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}
            >
                {selectedAlert && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ 
                            p: 3, 
                            bgcolor: selectedAlert.status === 'active' ? '#ef4444' : '#10b981', 
                            color: 'white',
                            position: 'sticky',
                            top: 0,
                            zIndex: 1
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                    <Typography variant="h5" fontWeight={700}>
                                        Alert Details
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                        ID: {selectedAlert.id}
                                    </Typography>
                                </Box>
                                <IconButton sx={{ color: 'white' }} onClick={() => setDetailDrawer({ open: false, alert: null })}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip
                                    label={selectedAlert.status?.toUpperCase() || 'ACTIVE'}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }}
                                />
                                <Chip
                                    label={selectedAlert.type?.toUpperCase() || 'EMERGENCY'}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }}
                                />
                            </Box>
                        </Box>

                        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
                                    USER INFORMATION
                                </Typography>
                                <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar 
                                            sx={{ 
                                                width: 56, 
                                                height: 56, 
                                                bgcolor: 'primary.main', 
                                                fontSize: '1.25rem',
                                                boxShadow: 2,
                                            }}
                                        >
                                            {selectedAlert.userName?.charAt(0) || 'U'}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle1" fontWeight={700}>
                                                {selectedAlert.userName || 'Unknown User'}
                                            </Typography>
                                            {selectedAlert.userPhone && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                    <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {selectedAlert.userPhone}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                    {selectedAlert.userPhone && (
                                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                startIcon={<PhoneIcon />}
                                                onClick={() => handleCallUser(selectedAlert.userPhone)}
                                            >
                                                Call User
                                            </Button>
                                        </Box>
                                    )}
                                </Paper>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
                                    ALERT MESSAGE
                                </Typography>
                                <Paper 
                                    elevation={0} 
                                    sx={{ 
                                        p: 2, 
                                        bgcolor: 'background.default', 
                                        borderRadius: 2,
                                        borderLeft: '4px solid',
                                        borderLeftColor: selectedAlert.status === 'active' ? '#ef4444' : '#10b981',
                                    }}
                                >
                                    <Typography variant="body1">
                                        {selectedAlert.message || 'Emergency alert triggered'}
                                    </Typography>
                                </Paper>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
                                    LOCATION
                                </Typography>
                                <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <LocationIcon sx={{ color: '#ef4444' }} />
                                        <Typography variant="body2" fontWeight={500}>
                                            {selectedAlert.location || 'Unknown location'}
                                        </Typography>
                                    </Box>
                                    {(selectedAlert.latitude || selectedAlert.longitude) && (
                                        <Typography 
                                            variant="caption" 
                                            color="text.secondary" 
                                            sx={{ 
                                                fontFamily: 'monospace', 
                                                display: 'block', 
                                                mb: 2,
                                                bgcolor: alpha('#000', 0.05),
                                                p: 1,
                                                borderRadius: 1,
                                            }}
                                        >
                                            {selectedAlert.latitude?.toFixed(6)}, {selectedAlert.longitude?.toFixed(6)}
                                        </Typography>
                                    )}
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<MapIcon />}
                                        onClick={() => window.open(`https://www.google.com/maps?q=${selectedAlert.latitude},${selectedAlert.longitude}`, '_blank')}
                                        sx={{ mt: 1 }}
                                    >
                                        Open in Google Maps
                                    </Button>
                                </Paper>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
                                    TIMELINE
                                </Typography>
                                <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: selectedAlert.resolvedAt ? 1 : 0 }}>
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                bgcolor: '#ef4444',
                                            }}
                                        />
                                        <Typography variant="body2">
                                            <strong>Triggered:</strong> {new Date(selectedAlert.createdAt).toLocaleString()}
                                        </Typography>
                                    </Box>
                                    {selectedAlert.resolvedAt && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    bgcolor: '#10b981',
                                                }}
                                            />
                                            <Typography variant="body2">
                                                <strong>Resolved:</strong> {new Date(selectedAlert.resolvedAt).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Box>

                            {nearbyServices.length > 0 && (
                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                            NEARBY EMERGENCY SERVICES
                                        </Typography>
                                        <Chip label={`${nearbyServices.length} found`} size="small" />
                                    </Box>
                                    <List disablePadding>
                                        {nearbyServices.slice(0, 5).map((service, index) => (
                                            <Paper 
                                                key={index} 
                                                elevation={0} 
                                                sx={{ 
                                                    p: 1.5, 
                                                    mb: 1, 
                                                    bgcolor: 'background.default', 
                                                    borderRadius: 2,
                                                    transition: 'transform 0.2s',
                                                    '&:hover': { transform: 'translateX(4px)' },
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                                                        {service.type === 'police' ? '🚔' : service.type === 'hospital' ? '🏥' : '🛡️'}
                                                    </Avatar>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography variant="body2" fontWeight={600} noWrap>{service.name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {service.type?.replace('_', ' ')} • {(service.distance / 1000).toFixed(1)} km
                                                        </Typography>
                                                    </Box>
                                                    {service.phone && (
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => window.open(`tel:${service.phone}`, '_self')}
                                                        >
                                                            <PhoneIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            </Paper>
                                        ))}
                                    </List>
                                </Box>
                            )}
                        </Box>

                        {selectedAlert.status === 'active' && (
                            <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="success"
                                    size="large"
                                    startIcon={<CheckCircleIcon />}
                                    onClick={() => {
                                        setResolveDrawer({ open: true, alert: selectedAlert });
                                    }}
                                    sx={{ fontWeight: 600 }}
                                >
                                    Mark as Resolved
                                </Button>
                            </Box>
                        )}
                    </Box>
                )}
            </Drawer>

            <Drawer
                anchor="bottom"
                open={resolveDrawer.open}
                onClose={() => setResolveDrawer({ open: false, alert: null })}
                PaperProps={{ sx: { borderRadius: '16px 16px 0 0', p: 3 } }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha('#10b981', 0.1),
                            color: '#10b981',
                        }}
                    >
                        <CheckCircleIcon />
                    </Box>
                    <Box>
                        <Typography variant="h6">Resolve Alert</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Mark this emergency as handled
                        </Typography>
                    </Box>
                </Box>
                <Alert severity="info" sx={{ mb: 3 }}>
                    You're about to mark this SOS alert as resolved. This will notify the user that help has arrived.
                </Alert>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Resolution Notes (optional)"
                    value={resolveNote}
                    onChange={(e) => setResolveNote(e.target.value)}
                    placeholder="Add notes about how the situation was resolved..."
                    sx={{ mb: 3 }}
                />
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setResolveDrawer({ open: false, alert: null })}
                        >
                            Cancel
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="success"
                            onClick={handleResolve}
                            disabled={loading}
                        >
                            Confirm
                        </Button>
                    </Grid>
                </Grid>
            </Drawer>
        </Box>
    );
};

export default SOSAlerts;

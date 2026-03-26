import React, { useEffect, useCallback, useState } from 'react';
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
} from '@mui/material';
import {
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    LocationOn as LocationIcon,
    AccessTime as TimeIcon,
    Refresh as RefreshIcon,
    Close as CloseIcon,
    Phone as PhoneIcon,
    Message as MessageIcon,
    Map as MapIcon,
    FilterList as FilterIcon,
    NotificationsActive as AlertIcon,
    GppGood as AllClearIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAlerts, resolveAlert, setStatusFilter } from '../store/slices/alertsSlice';
import { adminApi } from '../services/api';

const statusConfig = {
    active: { color: '#ef4444', label: 'Active', bg: '#fef2f2', icon: '🚨' },
    resolved: { color: '#10b981', label: 'Resolved', bg: '#ecfdf5', icon: '✓' },
};

const typeConfig = {
    emergency: { color: '#ef4444', bg: '#fef2f2' },
    distress: { color: '#f59e0b', bg: '#fffbeb' },
    test: { color: '#6366f1', bg: '#eef2ff' },
    medical: { color: '#ec4899', bg: '#fdf2f8' },
};

const SOSAlerts = () => {
    const dispatch = useDispatch();
    const { alerts, loading, filters, error } = useSelector((state) => state.alerts);

    const [detailDrawer, setDetailDrawer] = useState({ open: false, alert: null });
    const [resolveDrawer, setResolveDrawer] = useState({ open: false, alert: null });
    const [resolveNote, setResolveNote] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [nearbyServices, setNearbyServices] = useState([]);

    const fetchAlertsData = useCallback(() => {
        dispatch(fetchAlerts({ status: filters.status !== 'all' ? filters.status : undefined }));
    }, [dispatch, filters.status]);

    useEffect(() => {
        fetchAlertsData();
    }, [fetchAlertsData]);

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

    const filteredAlerts = alerts.filter(alert => {
        if (activeTab === 1) return alert.status === 'active';
        if (activeTab === 2) return alert.status === 'resolved';
        return true;
    });

    const activeAlerts = alerts.filter(a => a.status === 'active').length;
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved').length;

    const formatTime = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                            SOS Alerts
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Monitor and respond to emergency alerts
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchAlertsData}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            {/* Stats Cards */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Paper
                    elevation={0}
                    sx={{
                        flex: '1 1 200px',
                        p: 2,
                        borderRadius: 3,
                        background: activeAlerts > 0 ? alpha('#ef4444', 0.1) : alpha('#10b981', 0.1),
                        border: `1px solid ${activeAlerts > 0 ? alpha('#ef4444', 0.3) : alpha('#10b981', 0.3)}`,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: activeAlerts > 0 ? '#ef4444' : '#10b981', color: 'white' }}>
                            {activeAlerts > 0 ? <WarningIcon /> : <AllClearIcon />}
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: activeAlerts > 0 ? '#ef4444' : '#10b981' }}>
                                {loading ? <Skeleton width={40} /> : activeAlerts}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">Active Alerts</Typography>
                        </Box>
                    </Box>
                </Paper>
                <Paper elevation={0} sx={{ flex: '1 1 200px', p: 2, borderRadius: 3, bgcolor: alpha('#10b981', 0.1) }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#10b981', color: 'white' }}>
                            <CheckCircleIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800 }}>{loading ? <Skeleton width={40} /> : resolvedAlerts}</Typography>
                            <Typography variant="body2" color="text.secondary">Resolved</Typography>
                        </Box>
                    </Box>
                </Paper>
                <Paper elevation={0} sx={{ flex: '1 1 200px', p: 2, borderRadius: 3, bgcolor: alpha('#6366f1', 0.1) }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#6366f1', color: 'white' }}>
                            <AlertIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800 }}>{loading ? <Skeleton width={40} /> : alerts.length}</Typography>
                            <Typography variant="body2" color="text.secondary">Total</Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>

            {/* Tabs and Filter */}
            <Card sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                        <Tab label={`All (${alerts.length})`} />
                        <Tab
                            label={
                                <Badge badgeContent={activeAlerts} color="error">
                                    Active
                                </Badge>
                            }
                        />
                        <Tab label={`Resolved (${resolvedAlerts})`} />
                    </Tabs>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Type Filter</InputLabel>
                            <Select
                                value={filters.status}
                                onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                                label="Status Filter"
                            >
                                <MenuItem value="all">All Status</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="resolved">Resolved</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
            </Card>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Alerts List */}
            <Card sx={{ flex: 1, overflow: 'hidden' }}>
                {loading && alerts.length === 0 ? (
                    <Box sx={{ p: 3 }}>
                        {[...Array(5)].map((_, i) => (
                            <Box key={i} sx={{ display: 'flex', gap: 2, py: 2 }}>
                                <Skeleton variant="circular" width={48} height={48} />
                                <Box sx={{ flex: 1 }}>
                                    <Skeleton width="40%" />
                                    <Skeleton width="60%" />
                                </Box>
                            </Box>
                        ))}
                    </Box>
                ) : filteredAlerts.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <AllClearIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">No alerts found</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {activeTab === 1 ? 'No active alerts at the moment' : 'No alerts match your filter'}
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ overflow: 'auto', maxHeight: '100%' }}>
                        {filteredAlerts.map((alert, index) => {
                            const status = statusConfig[alert.status] || statusConfig.active;
                            const type = typeConfig[alert.type] || typeConfig.emergency;
                            return (
                                <React.Fragment key={alert.id}>
                                    <ListItem
                                        sx={{
                                            cursor: 'pointer',
                                            bgcolor: alert.status === 'active' ? alpha('#ef4444', 0.03) : 'transparent',
                                            '&:hover': { bgcolor: 'action.hover' },
                                            py: 2,
                                        }}
                                        onClick={() => openDetailDrawer(alert)}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                sx={{
                                                    bgcolor: status.color,
                                                    width: 48,
                                                    height: 48,
                                                    fontSize: '1.25rem',
                                                    animation: alert.status === 'active' ? 'pulse 2s infinite' : 'none',
                                                }}
                                            >
                                                {status.icon}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Typography variant="subtitle1" fontWeight={700}>
                                                        {alert.userName || 'Unknown User'}
                                                    </Typography>
                                                    <Chip
                                                        label={alert.type || 'emergency'}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: type.bg,
                                                            color: type.color,
                                                            fontWeight: 600,
                                                            fontSize: '0.7rem',
                                                        }}
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {alert.message || 'Emergency alert triggered'}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                            <Typography variant="caption" color="text.secondary">
                                                                {alert.location || 'Unknown location'}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                            <Typography variant="caption" color="text.secondary">
                                                                {formatTime(alert.createdAt)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            }
                                        />
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {alert.status === 'active' && (
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="success"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setResolveDrawer({ open: true, alert });
                                                    }}
                                                >
                                                    Resolve
                                                </Button>
                                            )}
                                            <Chip
                                                label={status.label}
                                                size="small"
                                                sx={{
                                                    bgcolor: status.bg,
                                                    color: status.color,
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </Box>
                                    </ListItem>
                                    {index < filteredAlerts.length - 1 && <Divider />}
                                </React.Fragment>
                            );
                        })}
                    </List>
                )}
            </Card>

            {/* Detail Drawer */}
            <Drawer
                anchor="right"
                open={detailDrawer.open}
                onClose={() => setDetailDrawer({ open: false, alert: null })}
                PaperProps={{ sx: { width: 420 } }}
            >
                {selectedAlert && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {/* Header */}
                        <Box sx={{ p: 3, bgcolor: statusConfig[selectedAlert.status]?.color || '#ef4444', color: 'white' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h5" fontWeight={700}>
                                    Alert Details
                                </Typography>
                                <IconButton sx={{ color: 'white' }} onClick={() => setDetailDrawer({ open: false, alert: null })}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip
                                    label={selectedAlert.status?.toUpperCase() || 'ACTIVE'}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }}
                                />
                                <Chip
                                    label={selectedAlert.type || 'EMERGENCY'}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }}
                                />
                            </Box>
                        </Box>

                        {/* Content */}
                        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                            {/* User Info */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>USER</Typography>
                                <Paper elevation={0} sx={{ p: 2, mt: 1, bgcolor: 'background.default', borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                                            {selectedAlert.userName?.charAt(0) || 'U'}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight={700}>
                                                {selectedAlert.userName || 'Unknown User'}
                                            </Typography>
                                            {selectedAlert.userPhone && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {selectedAlert.userPhone}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                </Paper>
                            </Box>

                            {/* Message */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>MESSAGE</Typography>
                                <Paper elevation={0} sx={{ p: 2, mt: 1, bgcolor: 'background.default', borderRadius: 2 }}>
                                    <Typography variant="body2">
                                        {selectedAlert.message || 'Emergency alert triggered'}
                                    </Typography>
                                </Paper>
                            </Box>

                            {/* Location */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>LOCATION</Typography>
                                <Paper elevation={0} sx={{ p: 2, mt: 1, bgcolor: 'background.default', borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <LocationIcon sx={{ color: 'primary.main' }} />
                                        <Typography variant="body2">
                                            {selectedAlert.location || 'Unknown location'}
                                        </Typography>
                                    </Box>
                                    {(selectedAlert.latitude || selectedAlert.longitude) && (
                                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                            {selectedAlert.latitude?.toFixed(6)}, {selectedAlert.longitude?.toFixed(6)}
                                        </Typography>
                                    )}
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<MapIcon />}
                                        sx={{ mt: 2 }}
                                        onClick={() => window.open(`https://www.google.com/maps?q=${selectedAlert.latitude},${selectedAlert.longitude}`, '_blank')}
                                    >
                                        Open in Maps
                                    </Button>
                                </Paper>
                            </Box>

                            {/* Time */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>TIMELINE</Typography>
                                <Paper elevation={0} sx={{ p: 2, mt: 1, bgcolor: 'background.default', borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TimeIcon sx={{ color: 'primary.main' }} />
                                        <Typography variant="body2">
                                            Triggered: {new Date(selectedAlert.createdAt).toLocaleString()}
                                        </Typography>
                                    </Box>
                                    {selectedAlert.resolvedAt && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                            <CheckCircleIcon sx={{ color: 'success.main' }} />
                                            <Typography variant="body2">
                                                Resolved: {new Date(selectedAlert.resolvedAt).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Box>

                            {/* Nearby Services */}
                            {nearbyServices.length > 0 && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>NEARBY EMERGENCY SERVICES</Typography>
                                    <List dense sx={{ mt: 1 }}>
                                        {nearbyServices.slice(0, 5).map((service) => (
                                            <ListItem key={service.id} sx={{ px: 0 }}>
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: 'background.default' }}>
                                                        {service.type === 'police' ? '👮' : service.type === 'hospital' ? '🏥' : '🛡️'}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={service.name}
                                                    secondary={`${(service.distance / 1000).toFixed(1)} km away`}
                                                />
                                                {service.phone && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => window.open(`tel:${service.phone}`, '_self')}
                                                    >
                                                        <PhoneIcon />
                                                    </IconButton>
                                                )}
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}
                        </Box>

                        {/* Actions */}
                        {selectedAlert.status === 'active' && (
                            <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="success"
                                    size="large"
                                    onClick={() => {
                                        setResolveDrawer({ open: true, alert: selectedAlert });
                                    }}
                                >
                                    Mark as Resolved
                                </Button>
                            </Box>
                        )}
                    </Box>
                )}
            </Drawer>

            {/* Resolve Drawer */}
            <Drawer
                anchor="bottom"
                open={resolveDrawer.open}
                onClose={() => setResolveDrawer({ open: false, alert: null })}
                PaperProps={{ sx: { borderRadius: '16px 16px 0 0', p: 3 } }}
            >
                <Typography variant="h6" sx={{ mb: 2 }}>Resolve Alert</Typography>
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
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => setResolveDrawer({ open: false, alert: null })}
                    >
                        Cancel
                    </Button>
                    <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        onClick={handleResolve}
                        disabled={loading}
                    >
                        Confirm Resolution
                    </Button>
                </Box>
            </Drawer>

            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
            `}</style>
        </Box>
    );
};

export default SOSAlerts;

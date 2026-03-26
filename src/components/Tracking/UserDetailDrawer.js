import React, { useEffect, useState, useCallback } from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Avatar,
    Chip,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    CircularProgress,
    Button,
    LinearProgress,
    Grid,
    Card,
    CardContent,
    Skeleton,
} from '@mui/material';
import {
    Close as CloseIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    CalendarToday as CalendarIcon,
    LocationOn as LocationIcon,
    History as HistoryIcon,
    Warning as WarningIcon,
    FamilyRestroom as FamilyIcon,
    DeviceUnknown as DeviceIcon,
    Security as SecurityIcon,
    Person as PersonIcon,
    Verified as VerifiedIcon,
    TrackChanges as TrackIcon,
    Notifications as NotificationsIcon,
    AccessTime as TimeIcon,
    Edit as EditIcon,
    MoreVert as MoreIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserById, clearSelectedUser } from '../../store/slices/usersSlice';
import { adminApi } from '../../services/api';
import { demoFamiliesData } from '../../services/demoDataService';

const roleColors = {
    system_admin: '#dc2626',
    agency_admin: '#ea580c',
    admin: '#6366f1',
    supervisor: '#8b5cf6',
    woman: '#ec4899',
    parent: '#10b981',
    guardian: '#f59e0b',
    friend: '#06b6d4',
};

const roleLabels = {
    system_admin: 'System Admin',
    agency_admin: 'Agency Admin',
    admin: 'Admin',
    supervisor: 'Supervisor',
    woman: 'Woman',
    parent: 'Parent',
    guardian: 'Guardian',
    friend: 'Friend',
};

const TabPanel = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index} style={{ display: value === index ? 'block' : 'none' }}>
        <Box sx={{ py: 2 }}>{children}</Box>
    </div>
);

const InfoRow = ({ icon, label, value, link }) => (
    <Box sx={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: 1.5, 
        py: 1.5, 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        cursor: link ? 'pointer' : 'default',
        '&:hover': link ? { bgcolor: 'action.hover' } : {}
    }}>
        <Box sx={{ color: 'text.secondary', mt: 0.25, minWidth: 20 }}>{icon}</Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{label}</Typography>
            {link ? (
                <Typography variant="body2" fontWeight={500} sx={{ color: 'primary.main', wordBreak: 'break-all' }}>{value || 'N/A'}</Typography>
            ) : (
                <Typography variant="body2" fontWeight={500} sx={{ wordBreak: 'break-all' }}>{value || 'N/A'}</Typography>
            )}
        </Box>
    </Box>
);

const LoadingSkeleton = () => (
    <Box sx={{ p: 2 }}>
        {[...Array(5)].map((_, i) => (
            <Box key={i} sx={{ mb: 2 }}>
                <Skeleton width={80} height={14} sx={{ mb: 0.5 }} />
                <Skeleton width="100%" height={20} />
            </Box>
        ))}
    </Box>
);

const UserDetailDrawer = ({ open, onClose, userId }) => {
    const dispatch = useDispatch();
    const { selectedUser: user, loading: userLoading, error } = useSelector((state) => state.users);
    const [activeTab, setActiveTab] = useState(0);
    
    // Additional data states
    const [familyData, setFamilyData] = useState([]);
    const [locationHistory, setLocationHistory] = useState([]);
    const [sosAlerts, setSosAlerts] = useState([]);
    const [devices, setDevices] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [loadingData, setLoadingData] = useState({
        family: false,
        locations: false,
        alerts: false,
        devices: false,
        activity: false,
    });

    const fetchAllData = useCallback(async (id) => {
        setLoadingData({
            family: true,
            locations: true,
            alerts: true,
            devices: true,
            activity: true,
        });

        try {
            const [familyRes, locationRes, alertsRes, devicesRes, activityRes] = await Promise.allSettled([
                adminApi.getFamilyById ? adminApi.getFamilyById(id).catch(() => ({ data: { success: false } })) : Promise.resolve({ data: { success: false } }),
                adminApi.getUserLocationHistory(id, { limit: 20 }).catch(() => ({ data: { success: false } })),
                adminApi.getSOSAlerts({ user_id: id, limit: 10 }).catch(() => ({ data: { success: false, alerts: [] } })),
                adminApi.getDevices({ user_id: id }).catch(() => ({ data: { success: false, devices: [] } })),
                adminApi.getActivityLogs({ user_id: id, limit: 10 }).catch(() => ({ data: { success: false, logs: [] } })),
            ]);

            if (familyRes.value?.data?.success) {
                setFamilyData(familyRes.value.data.family?.members || familyRes.value.data.family || []);
            }

            if (locationRes.value?.data?.success) {
                setLocationHistory(locationRes.value.data.history || locationRes.value.data.locations || []);
            }

            if (alertsRes.value?.data?.success) {
                setSosAlerts(alertsRes.value.data.alerts || []);
            }

            if (devicesRes.value?.data?.success) {
                setDevices(devicesRes.value.data.devices || []);
            }

            if (activityRes.value?.data?.success) {
                setActivityLogs(activityRes.value.data.logs || []);
            }
        } catch (err) {
            console.error('Error fetching user detail data:', err);
        } finally {
            setLoadingData(prev => ({
                family: false,
                locations: false,
                alerts: false,
                devices: false,
                activity: false,
            }));
        }
    }, []);

    useEffect(() => {
        if (open && userId) {
            dispatch(fetchUserById(userId))
                .unwrap()
                .catch((err) => {
                    console.warn('Using demo user data:', err.message);
                    const demoUser = demoFamiliesData.getUserData(userId);
                    if (demoUser) {
                        dispatch({ type: 'users/fetchUserById/fulfilled', payload: demoUser });
                    }
                });
            fetchAllData(userId);
        }
        return () => {
            if (open) {
                dispatch(clearSelectedUser());
                setFamilyData([]);
                setLocationHistory([]);
                setSosAlerts([]);
                setDevices([]);
                setActivityLogs([]);
            }
        };
    }, [dispatch, open, userId, fetchAllData]);

    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateTime = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatRelativeTime = (date) => {
        if (!date) return 'Unknown';
        const now = new Date();
        const d = new Date(date);
        const diff = Math.floor((now - d) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return formatDate(date);
    };

    const getStatusColor = (status) => {
        const colors = {
            active: 'success',
            inactive: 'default',
            pending: 'warning',
            resolved: 'success',
            emergency: 'error',
        };
        return colors[status?.toLowerCase()] || 'default';
    };

    const InfoItem = ({ icon, label, value, link }) => (
        <InfoRow icon={icon} label={label} value={value} link={link} />
    );

    if (!open) return null;

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: { xs: '100%', sm: 480 }, maxWidth: '100vw' }
            }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper'
                }}>
                    <Typography variant="h6" fontWeight={700}>User Dossier</Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>

                {userLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="error">{error}</Typography>
                    </Box>
                ) : user ? (
                    <>
                        {/* Profile Header */}
                        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                                <Avatar
                                    src={user.profile_photo || user.avatar || `https://i.pravatar.cc/150?u=${user.id}`}
                                    sx={{ 
                                        width: 80, 
                                        height: 80, 
                                        border: '3px solid', 
                                        borderColor: roleColors[user.role] || '#6366f1' 
                                    }}
                                />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="h6" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
                                        {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.name || user.firstName || 'Unknown User'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        ID: {user.id || user.user_id || 'N/A'}
                                    </Typography>
                                    <Chip
                                        size="small"
                                        label={roleLabels[user.role] || user.role || 'User'}
                                        sx={{ 
                                            bgcolor: `${roleColors[user.role] || '#6366f1'}20`,
                                            color: roleColors[user.role] || '#6366f1',
                                            fontWeight: 600,
                                        }}
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip 
                                    size="small" 
                                    icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
                                    label={user.is_verified ? 'Verified' : 'Unverified'}
                                    color={user.is_verified ? 'success' : 'default'}
                                    variant={user.is_verified ? 'filled' : 'outlined'}
                                />
                                <Chip 
                                    size="small" 
                                    label={user.is_active !== false ? 'Active' : 'Inactive'}
                                    color={user.is_active !== false ? 'success' : 'error'}
                                    variant={user.is_active !== false ? 'filled' : 'outlined'}
                                />
                                {user.is_online && (
                                    <Chip 
                                        size="small" 
                                        label="Online"
                                        color="success"
                                        variant="filled"
                                    />
                                )}
                            </Box>
                        </Box>

                        {/* Tabs */}
                        <Tabs 
                            value={activeTab} 
                            onChange={(_, v) => setActiveTab(v)}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{ 
                                borderBottom: '1px solid', 
                                borderColor: 'divider', 
                                px: 1,
                                minHeight: 48
                            }}
                        >
                            <Tab label="Details" icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                            <Tab label="Family" icon={<FamilyIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                            <Tab label="Locations" icon={<LocationIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                            <Tab label="Alerts" icon={<WarningIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                            <Tab label="Devices" icon={<DeviceIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                            <Tab label="Activity" icon={<HistoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                        </Tabs>

                        {/* Tab Content */}
                        <Box sx={{ flex: 1, overflow: 'auto' }}>
                            {/* Details Tab */}
                            <TabPanel value={activeTab} index={0}>
                                <Box sx={{ px: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                                        Contact Information
                                    </Typography>
                                    <InfoItem icon={<EmailIcon fontSize="small" />} label="Email" value={user.email} link />
                                    <InfoItem icon={<PhoneIcon fontSize="small" />} label="Phone" value={user.phone} />
                                    
                                    <Divider sx={{ my: 2 }} />
                                    
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                                        Account Information
                                    </Typography>
                                    <InfoItem icon={<SecurityIcon fontSize="small" />} label="Role" value={roleLabels[user.role] || user.role} />
                                    <InfoItem icon={<CalendarIcon fontSize="small" />} label="Joined" value={formatDate(user.created_at || user.createdAt)} />
                                    <InfoItem icon={<TimeIcon fontSize="small" />} label="Last Active" value={formatRelativeTime(user.last_active || user.lastActive)} />
                                    
                                    {user.address && (
                                        <>
                                            <Divider sx={{ my: 2 }} />
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                                                Location
                                            </Typography>
                                            <InfoItem icon={<LocationIcon fontSize="small" />} label="Current Location" value={user.current_location || 'Unknown'} />
                                            <InfoItem icon={<LocationIcon fontSize="small" />} label="Address" value={user.address} />
                                            <InfoItem icon={<LocationIcon fontSize="small" />} label="Last Known Lat/Lng" value={user.latitude && user.longitude ? `${user.latitude?.toFixed(4)}, ${user.longitude?.toFixed(4)}` : 'N/A'} />
                                        </>
                                    )}
                                </Box>
                            </TabPanel>

                            {/* Family Tab */}
                            <TabPanel value={activeTab} index={1}>
                                {loadingData.family ? (
                                    <LoadingSkeleton />
                                ) : familyData.length > 0 ? (
                                    <Box sx={{ px: 2 }}>
                                        {familyData.map((member, idx) => (
                                            <Card key={idx} sx={{ mb: 1.5, bgcolor: 'background.default' }}>
                                                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar 
                                                            src={member.profile_photo || `https://i.pravatar.cc/150?u=${member.id}`}
                                                            sx={{ width: 40, height: 40 }}
                                                        />
                                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                                            <Typography variant="body2" fontWeight={600} noWrap>
                                                                {member.name || member.first_name ? `${member.first_name} ${member.last_name || ''}` : 'Family Member'}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {member.relation || member.relationship || 'Member'}
                                                            </Typography>
                                                        </Box>
                                                        <Chip 
                                                            size="small" 
                                                            label={member.is_active !== false ? 'Active' : 'Inactive'}
                                                            color={member.is_active !== false ? 'success' : 'default'}
                                                            sx={{ height: 20, fontSize: '0.65rem' }}
                                                        />
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Box>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <FamilyIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                                        <Typography variant="body2" color="text.secondary">No family members</Typography>
                                    </Box>
                                )}
                            </TabPanel>

                            {/* Locations Tab */}
                            <TabPanel value={activeTab} index={2}>
                                {loadingData.locations ? (
                                    <LoadingSkeleton />
                                ) : locationHistory.length > 0 ? (
                                    <Box sx={{ px: 2 }}>
                                        {locationHistory.map((loc, idx) => (
                                            <Box key={idx} sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                    <LocationIcon sx={{ color: 'primary.main', mt: 0.5, fontSize: 20 }} />
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {loc.address || loc.location_name || 'Location'}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            {formatDateTime(loc.timestamp || loc.created_at)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <TrackIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                                        <Typography variant="body2" color="text.secondary">No location history</Typography>
                                    </Box>
                                )}
                            </TabPanel>

                            {/* Alerts Tab */}
                            <TabPanel value={activeTab} index={3}>
                                {loadingData.alerts ? (
                                    <LoadingSkeleton />
                                ) : sosAlerts.length > 0 ? (
                                    <Box sx={{ px: 2 }}>
                                        {sosAlerts.map((alert, idx) => (
                                            <Card key={idx} sx={{ mb: 1.5, bgcolor: alert.status === 'active' ? '#fef2f2' : 'background.default' }}>
                                                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <WarningIcon sx={{ color: alert.status === 'active' ? 'error.main' : 'warning.main', fontSize: 20 }} />
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {alert.type || alert.title || 'SOS Alert'}
                                                            </Typography>
                                                        </Box>
                                                        <Chip 
                                                            size="small" 
                                                            label={alert.status || 'Unknown'}
                                                            color={getStatusColor(alert.status)}
                                                            sx={{ height: 20, fontSize: '0.65rem' }}
                                                        />
                                                    </Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDateTime(alert.created_at || alert.timestamp)}
                                                    </Typography>
                                                    {alert.location && (
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            Location: {alert.location}
                                                        </Typography>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Box>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <SecurityIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                                        <Typography variant="body2" color="text.secondary">No SOS alerts</Typography>
                                        <Typography variant="caption" color="text.secondary">This user has no emergency alerts</Typography>
                                    </Box>
                                )}
                            </TabPanel>

                            {/* Devices Tab */}
                            <TabPanel value={activeTab} index={4}>
                                {loadingData.devices ? (
                                    <LoadingSkeleton />
                                ) : devices.length > 0 ? (
                                    <Box sx={{ px: 2 }}>
                                        {devices.map((device, idx) => (
                                            <Card key={idx} sx={{ mb: 1.5, bgcolor: 'background.default' }}>
                                                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <DeviceIcon sx={{ color: 'primary.main' }} />
                                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                                            <Typography variant="body2" fontWeight={600} noWrap>
                                                                {device.name || device.device_name || 'Device'}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" noWrap>
                                                                {device.device_id || device.id || 'No ID'}
                                                            </Typography>
                                                        </Box>
                                                        <Chip 
                                                            size="small" 
                                                            label={device.is_active !== false ? 'Active' : 'Inactive'}
                                                            color={device.is_active !== false ? 'success' : 'default'}
                                                            sx={{ height: 20, fontSize: '0.65rem' }}
                                                        />
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Box>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <DeviceIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                                        <Typography variant="body2" color="text.secondary">No devices registered</Typography>
                                    </Box>
                                )}
                            </TabPanel>

                            {/* Activity Tab */}
                            <TabPanel value={activeTab} index={5}>
                                {loadingData.activity ? (
                                    <LoadingSkeleton />
                                ) : activityLogs.length > 0 ? (
                                    <Box sx={{ px: 2 }}>
                                        {activityLogs.map((log, idx) => (
                                            <Box key={idx} sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                    <HistoryIcon sx={{ color: 'primary.main', mt: 0.5, fontSize: 20 }} />
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {log.action || log.description || 'Activity'}
                                                        </Typography>
                                                        {log.details && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                {log.details}
                                                            </Typography>
                                                        )}
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            {formatDateTime(log.created_at || log.timestamp)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <HistoryIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                                        <Typography variant="body2" color="text.secondary">No activity logs</Typography>
                                    </Box>
                                )}
                            </TabPanel>
                        </Box>

                        {/* Footer Actions */}
                        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
                            <Button 
                                variant="contained" 
                                fullWidth 
                                size="small"
                                startIcon={<PersonIcon />}
                            >
                                View Full Profile
                            </Button>
                            <Button 
                                variant="outlined" 
                                fullWidth 
                                size="small"
                                startIcon={<EditIcon />}
                            >
                                Edit User
                            </Button>
                        </Box>
                    </>
                ) : (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">User not found</Typography>
                        <Typography variant="caption" color="text.secondary">
                            User ID: {userId}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Drawer>
    );
};

export default UserDetailDrawer;
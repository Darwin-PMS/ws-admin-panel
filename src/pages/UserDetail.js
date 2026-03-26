import React, { useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Chip,
    Avatar,
    TextField,
    CircularProgress,
    Alert,
    Skeleton,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Divider,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    LinearProgress,
    Tooltip,
    Badge,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    CalendarToday as CalendarIcon,
    Security as SecurityIcon,
    Refresh as RefreshIcon,
    Person as PersonIcon,
    FamilyRestroom as FamilyIcon,
    LocationOn as LocationIcon,
    Warning as WarningIcon,
    History as HistoryIcon,
    DeviceUnknown as DeviceIcon,
    Settings as SettingsIcon,
    Verified as VerifiedIcon,
    Block as BlockIcon,
    Chat as ChatIcon,
    TrackChanges as TrackIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserById, updateUser, clearSelectedUser, deleteUser } from '../store/slices/usersSlice';
import { adminApi } from '../services/api';

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

const TabPanel = ({ children, value, index, ...other }) => (
    <div role="tabpanel" hidden={value !== index} {...other}>
        {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
);

const InfoRow = ({ icon, label, value, children }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ color: 'text.secondary', mt: 0.5 }}>{icon}</Box>
        <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>{label}</Typography>
            {children || <Typography variant="body1" fontWeight={500}>{value || 'Not available'}</Typography>}
        </Box>
    </Box>
);

const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { selectedUser: user, loading, error } = useSelector((state) => state.users);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [localError, setLocalError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [tabLoading, setTabLoading] = useState(false);
    
    // Tab data
    const [familyData, setFamilyData] = useState([]);
    const [locationHistory, setLocationHistory] = useState([]);
    const [sosAlerts, setSosAlerts] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [devices, setDevices] = useState([]);
    const [userSettings, setUserSettings] = useState(null);

    const fetchUser = useCallback(() => {
        dispatch(fetchUserById(id));
    }, [dispatch, id]);

    useEffect(() => {
        fetchUser();
        return () => {
            dispatch(clearSelectedUser());
        };
    }, [fetchUser, dispatch]);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || 'woman',
                isActive: user.isActive !== undefined ? user.isActive : true,
            });
        }
    }, [user]);

    // Fetch tab data when tab changes
    useEffect(() => {
        if (!user) return;
        fetchTabData(activeTab);
    }, [activeTab, user]);

    const fetchTabData = async (tab) => {
        setTabLoading(true);
        try {
            switch (tab) {
                case 1: // Family
                    try {
                        const familyRes = await adminApi.get(`/v1/admin/families?userId=${id}`);
                        if (familyRes.data?.success) {
                            setFamilyData(familyRes.data.families || []);
                        }
                    } catch { setFamilyData([]); }
                    break;
                case 2: // Location
                    try {
                        const locRes = await adminApi.tracking.userHistory(id, { minutes: 1440 });
                        if (locRes.data?.success) {
                            setLocationHistory(locRes.data.history || []);
                        }
                    } catch { setLocationHistory([]); }
                    break;
                case 3: // SOS
                    try {
                        const sosRes = await adminApi.sosAlerts.list({ userId: id });
                        if (sosRes.data?.success) {
                            setSosAlerts(sosRes.data.alerts || []);
                        }
                    } catch { setSosAlerts([]); }
                    break;
                case 4: // Activity
                    try {
                        const actRes = await adminApi.activity.logs({ userId: id, limit: 50 });
                        if (actRes.data?.success) {
                            setActivityLogs(actRes.data.logs || []);
                        }
                    } catch { setActivityLogs([]); }
                    break;
                case 5: // Devices
                    try {
                        const devRes = await adminApi.devices.list({ userId: id });
                        if (devRes.data?.success) {
                            setDevices(devRes.data.devices || []);
                        }
                    } catch { setDevices([]); }
                    break;
                case 6: // Settings
                    try {
                        const setRes = await adminApi.get(`/v1/mobile/users/${id}/settings`);
                        if (setRes.data?.success) {
                            setUserSettings(setRes.data.settings);
                        }
                    } catch { setUserSettings(null); }
                    break;
                default:
                    break;
            }
        } catch (err) {
            console.error('Error fetching tab data:', err);
        } finally {
            setTabLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await dispatch(updateUser({ id, data: formData })).unwrap();
            setEditMode(false);
            fetchUser();
        } catch (err) {
            console.error('Error updating user:', err);
            setLocalError('Failed to update user');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await dispatch(deleteUser(id)).unwrap();
                navigate('/users');
            } catch (err) {
                console.error('Error deleting user:', err);
                setLocalError('Failed to delete user');
            }
        }
    };

    const getRoleColor = (role) => roleColors[role] || '#64748b';
    const getRoleLabel = (role) => roleLabels[role] || role || 'User';

    if (loading && !user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return (
            <Box sx={{ p: 3 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/users')} sx={{ mb: 2 }}>
                    Back to Users
                </Button>
                <Alert severity="error">User not found</Alert>
            </Box>
        );
    }

    const activeSosCount = sosAlerts.filter(a => a.status === 'active').length;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button variant="outlined" onClick={() => navigate('/users')} startIcon={<ArrowBackIcon />}>
                        Back
                    </Button>
                    <Box>
                        <Typography variant="h4" fontWeight={700}>
                            User Profile
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            View and manage user details
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchUser} disabled={loading}>
                        Refresh
                    </Button>
                    {!editMode ? (
                        <>
                            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditMode(true)}>
                                Edit
                            </Button>
                            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>
                                Delete
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outlined" onClick={() => setEditMode(false)}>
                                Cancel
                            </Button>
                            <Button variant="contained" onClick={handleSave} disabled={loading}>
                                Save Changes
                            </Button>
                        </>
                    )}
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {localError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setLocalError(null)}>{localError}</Alert>}

            <Grid container spacing={3}>
                {/* Left Column - Profile Card */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ position: 'sticky', top: 80 }}>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <Avatar
                                sx={{
                                    width: 120,
                                    height: 120,
                                    mx: 'auto',
                                    mb: 2,
                                    bgcolor: getRoleColor(user.role),
                                    fontSize: 48,
                                }}
                            >
                                {user.firstName?.[0]}{user.lastName?.[0]}
                            </Avatar>
                            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                                {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email?.split('@')[0] || 'Unknown'}
                            </Typography>
                            <Chip
                                label={getRoleLabel(user.role)}
                                sx={{
                                    bgcolor: `${getRoleColor(user.role)}20`,
                                    color: getRoleColor(user.role),
                                    fontWeight: 600,
                                    mb: 2,
                                }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Chip
                                    icon={user.isActive ? <VerifiedIcon sx={{ fontSize: 16 }} /> : <BlockIcon sx={{ fontSize: 16 }} />}
                                    label={user.isActive ? 'Active' : 'Inactive'}
                                    size="small"
                                    sx={{
                                        bgcolor: user.isActive ? 'success.main' : 'error.main',
                                        color: 'white',
                                    }}
                                />
                                <Chip
                                    label={user.isVerified ? 'Verified' : 'Pending'}
                                    size="small"
                                    sx={{
                                        bgcolor: user.isVerified ? 'success.main' : 'warning.main',
                                        color: 'white',
                                    }}
                                />
                            </Box>
                        </CardContent>
                        <Divider />
                        <CardContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                    <Typography variant="body2">{user.email || 'Not provided'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                    <Typography variant="body2">{user.phone || 'Not provided'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CalendarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                    <Typography variant="body2">
                                        Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Column - Tabs */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
                                <Tab icon={<PersonIcon />} iconPosition="start" label="Profile" />
                                <Tab icon={<FamilyIcon />} iconPosition="start" label="Family" />
                                <Tab icon={<LocationIcon />} iconPosition="start" label="Location" />
                                <Tab 
                                    icon={
                                        <Badge badgeContent={activeSosCount} color="error" max={99}>
                                            <WarningIcon />
                                        </Badge>
                                    } 
                                    iconPosition="start" 
                                    label="SOS Alerts" 
                                />
                                <Tab icon={<HistoryIcon />} iconPosition="start" label="Activity" />
                                <Tab icon={<DeviceIcon />} iconPosition="start" label="Devices" />
                                <Tab icon={<SettingsIcon />} iconPosition="start" label="Settings" />
                            </Tabs>
                        </Box>

                        {tabLoading && <LinearProgress />}

                        {/* Profile Tab */}
                        <TabPanel value={activeTab} index={0}>
                            {editMode ? (
                                <Box sx={{ p: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField fullWidth label="First Name" value={formData.firstName || ''} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField fullWidth label="Last Name" value={formData.lastName || ''} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField fullWidth label="Email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField fullWidth label="Phone" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField fullWidth select label="Role" value={formData.role || 'woman'} onChange={(e) => setFormData({ ...formData, role: e.target.value })} SelectProps={{ native: true }}>
                                                {Object.entries(roleLabels).map(([key, label]) => (
                                                    <option key={key} value={key}>{label}</option>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField fullWidth select label="Status" value={formData.isActive ? 'active' : 'inactive'} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })} SelectProps={{ native: true }}>
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </TextField>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ) : (
                                <Box sx={{ p: 2 }}>
                                    <InfoRow icon={<PersonIcon />} label="Full Name" value={user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Not set'} />
                                    <InfoRow icon={<EmailIcon />} label="Email Address" value={user.email} />
                                    <InfoRow icon={<PhoneIcon />} label="Phone Number" value={user.phone} />
                                    <InfoRow icon={<SecurityIcon />} label="User Role" children={<Chip label={getRoleLabel(user.role)} size="small" sx={{ bgcolor: `${getRoleColor(user.role)}20`, color: getRoleColor(user.role) }} />} />
                                    <InfoRow icon={<CalendarIcon />} label="Account Created" value={user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Unknown'} />
                                    <InfoRow icon={<VerifiedIcon />} label="Verification Status" children={<Chip label={user.isVerified ? 'Verified' : 'Pending Verification'} size="small" color={user.isVerified ? 'success' : 'warning'} />} />
                                    <InfoRow icon={<BlockIcon />} label="Account Status" children={<Chip label={user.isActive ? 'Active' : 'Inactive'} size="small" color={user.isActive ? 'success' : 'error'} />} />
                                </Box>
                            )}
                        </TabPanel>

                        {/* Family Tab */}
                        <TabPanel value={activeTab} index={1}>
                            {tabLoading ? (
                                <Box sx={{ p: 2 }}><CircularProgress size={24} /></Box>
                            ) : familyData.length > 0 ? (
                                <List>
                                    {familyData.map((family, index) => (
                                        <React.Fragment key={family.id}>
                                            <ListItem
                                                secondaryAction={
                                                    <Button size="small" onClick={() => navigate(`/families/${family.id}`)}>View</Button>
                                                }
                                            >
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: 'primary.main' }}><FamilyIcon /></Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={family.name || 'Family Group'}
                                                    secondary={`${family.memberCount || 0} members`}
                                                />
                                            </ListItem>
                                            {index < familyData.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <FamilyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                    <Typography color="text.secondary">Not part of any family group</Typography>
                                </Box>
                            )}
                        </TabPanel>

                        {/* Location Tab */}
                        <TabPanel value={activeTab} index={2}>
                            {tabLoading ? (
                                <Box sx={{ p: 2 }}><CircularProgress size={24} /></Box>
                            ) : locationHistory.length > 0 ? (
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Time</TableCell>
                                                <TableCell>Latitude</TableCell>
                                                <TableCell>Longitude</TableCell>
                                                <TableCell>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {locationHistory.slice(0, 20).map((loc, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{new Date(loc.timestamp || loc.last_updated).toLocaleString()}</TableCell>
                                                    <TableCell>{loc.latitude?.toFixed(6)}</TableCell>
                                                    <TableCell>{loc.longitude?.toFixed(6)}</TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={loc.status || 'safe'} 
                                                            size="small" 
                                                            sx={{
                                                                bgcolor: loc.status === 'sos' ? 'error.main' : loc.status === 'danger' ? 'warning.main' : 'success.main',
                                                                color: 'white',
                                                                fontSize: '0.7rem',
                                                            }} 
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <LocationIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                    <Typography color="text.secondary">No location history available</Typography>
                                </Box>
                            )}
                        </TabPanel>

                        {/* SOS Tab */}
                        <TabPanel value={activeTab} index={3}>
                            {tabLoading ? (
                                <Box sx={{ p: 2 }}><CircularProgress size={24} /></Box>
                            ) : sosAlerts.length > 0 ? (
                                <List>
                                    {sosAlerts.map((alert, index) => (
                                        <React.Fragment key={alert.id}>
                                            <ListItem
                                                secondaryAction={
                                                    <Chip 
                                                        label={alert.status?.toUpperCase()} 
                                                        size="small" 
                                                        sx={{
                                                            bgcolor: alert.status === 'active' ? 'error.main' : 'success.main',
                                                            color: 'white',
                                                        }} 
                                                    />
                                                }
                                            >
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: alert.status === 'active' ? 'error.main' : 'success.main' }}>
                                                        <WarningIcon />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={alert.message || 'SOS Alert'}
                                                    secondary={`${new Date(alert.created_at || alert.createdAt).toLocaleString()} - ${alert.type || 'emergency'}`}
                                                />
                                            </ListItem>
                                            {index < sosAlerts.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <WarningIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                                    <Typography color="success.main" fontWeight={600}>No SOS Alerts</Typography>
                                    <Typography color="text.secondary">This user has no SOS alerts on record</Typography>
                                </Box>
                            )}
                        </TabPanel>

                        {/* Activity Tab */}
                        <TabPanel value={activeTab} index={4}>
                            {tabLoading ? (
                                <Box sx={{ p: 2 }}><CircularProgress size={24} /></Box>
                            ) : activityLogs.length > 0 ? (
                                <List>
                                    {activityLogs.map((log, index) => (
                                        <React.Fragment key={log.id || index}>
                                            <ListItem>
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                        <ChatIcon />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={log.action || 'Activity'}
                                                    secondary={new Date(log.created_at || log.timestamp).toLocaleString()}
                                                />
                                            </ListItem>
                                            {index < activityLogs.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                    <Typography color="text.secondary">No activity logs available</Typography>
                                </Box>
                            )}
                        </TabPanel>

                        {/* Devices Tab */}
                        <TabPanel value={activeTab} index={5}>
                            {tabLoading ? (
                                <Box sx={{ p: 2 }}><CircularProgress size={24} /></Box>
                            ) : devices.length > 0 ? (
                                <TableContainer component={Paper} variant="outlined">
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Device</TableCell>
                                                <TableCell>Type</TableCell>
                                                <TableCell>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {devices.map((device) => (
                                                <TableRow key={device.id}>
                                                    <TableCell>{device.name || device.device_name || 'Unknown Device'}</TableCell>
                                                    <TableCell>{device.type || device.device_type || 'Mobile'}</TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={device.is_active ? 'Active' : 'Inactive'} 
                                                            size="small" 
                                                            color={device.is_active ? 'success' : 'default'} 
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <DeviceIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                    <Typography color="text.secondary">No devices registered</Typography>
                                </Box>
                            )}
                        </TabPanel>

                        {/* Settings Tab */}
                        <TabPanel value={activeTab} index={6}>
                            {tabLoading ? (
                                <Box sx={{ p: 2 }}><CircularProgress size={24} /></Box>
                            ) : userSettings ? (
                                <Box sx={{ p: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Notifications</Typography>
                                                <Chip label={userSettings.notification_enabled ? 'Enabled' : 'Disabled'} size="small" color={userSettings.notification_enabled ? 'success' : 'default'} />
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Location Sharing</Typography>
                                                <Chip label={userSettings.location_sharing ? 'Enabled' : 'Disabled'} size="small" color={userSettings.location_sharing ? 'success' : 'default'} />
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>SOS Timer</Typography>
                                                <Typography variant="h6">{userSettings.sos_timer || 30} seconds</Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Shake to SOS</Typography>
                                                <Chip label={userSettings.shake_to_sos ? 'Enabled' : 'Disabled'} size="small" color={userSettings.shake_to_sos ? 'success' : 'default'} />
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Family Agent</Typography>
                                                <Chip label={userSettings.family_agent_enabled ? 'Enabled' : 'Disabled'} size="small" color={userSettings.family_agent_enabled ? 'success' : 'default'} />
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Voice SOS</Typography>
                                                <Chip label={userSettings.voice_enabled ? 'Enabled' : 'Disabled'} size="small" color={userSettings.voice_enabled ? 'success' : 'default'} />
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <SettingsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                    <Typography color="text.secondary">No settings data available</Typography>
                                </Box>
                            )}
                        </TabPanel>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default UserDetail;

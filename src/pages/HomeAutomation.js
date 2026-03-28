import React, { useEffect, useCallback, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Chip,
    Switch,
    Drawer,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Skeleton,
    IconButton,
    Slider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    Divider,
    CircularProgress,
    Alert,
    Paper,
    alpha,
    InputAdornment,
    Autocomplete,
    Avatar,
    Tabs,
    Tab,
    Badge,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    LinearProgress,
    Icon,
} from '@mui/material';
import {
    Close as CloseIcon,
    Add as AddIcon,
    Lightbulb as LightbulbIcon,
    Thermostat as ThermostatIcon,
    Lock as LockIcon,
    Security as SecurityIcon,
    Power as PowerIcon,
    Home as HomeIcon,
    Refresh as RefreshIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Notifications as NotificationsIcon,
    Settings as SettingsIcon,
    Wifi as WifiIcon,
    BatteryChargingFull as BatteryIcon,
    Speed as SpeedIcon,
    WaterDrop as WaterDropIcon,
    Search as SearchIcon,
    Dashboard as DashboardIcon,
    Person as PersonIcon,
    ViewModule as GridViewIcon,
    ViewList as ListViewIcon,
    GroupWork as GroupIcon,
    Sync as SyncIcon,
    DevicesOther as DevicesOtherIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchDevices, 
    setTypeFilter, 
    toggleDevice, 
    addDevice,
    updateDevice,
    deleteDevice,
    fetchDeviceById,
    setStatusFilter,
    clearSelectedDevice,
    controlDevice,
} from '../store/slices/devicesSlice';
import { adminApi } from '../services/api';

const DEVICE_TYPES = {
    light: { 
        icon: <LightbulbIcon />, 
        color: '#f59e0b', 
        name: 'Light',
        controls: ['brightness', 'power'],
        unit: '%'
    },
    thermostat: { 
        icon: <ThermostatIcon />, 
        color: '#6366f1', 
        name: 'Thermostat',
        controls: ['temperature'],
        unit: '°C'
    },
    lock: { 
        icon: <LockIcon />, 
        color: '#10b981', 
        name: 'Smart Lock',
        controls: ['locked', 'power'],
        unit: ''
    },
    camera: { 
        icon: <SecurityIcon />, 
        color: '#ef4444', 
        name: 'Camera',
        controls: ['recording', 'power'],
        unit: ''
    },
    fan: {
        icon: <SpeedIcon />,
        color: '#3b82f6',
        name: 'Fan',
        controls: ['speed', 'power'],
        unit: '%'
    },
    ac: {
        icon: <ThermostatIcon />,
        color: '#06b6d4',
        name: 'AC',
        controls: ['temperature', 'mode', 'power'],
        unit: '°C'
    },
    plug: {
        icon: <PowerIcon />,
        color: '#8b5cf6',
        name: 'Smart Plug',
        controls: ['power'],
        unit: 'W'
    },
    sensor: {
        icon: <WifiIcon />,
        color: '#14b8a6',
        name: 'Sensor',
        controls: [],
        unit: ''
    },
    garage: {
        icon: <LockIcon />,
        color: '#f97316',
        name: 'Garage',
        controls: ['open', 'power'],
        unit: ''
    },
    water: {
        icon: <WaterDropIcon />,
        color: '#0ea5e9',
        name: 'Water Valve',
        controls: ['valve', 'power'],
        unit: ''
    },
};

const HomeAutomation = () => {
    const dispatch = useDispatch();
    const { devices, loading, error, filters, selectedDevice, totalCount } = useSelector((state) => state.devices);
    
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [addDialog, setAddDialog] = useState({ open: false });
    const [editDialog, setEditDialog] = useState({ open: false });
    const [deviceDetail, setDeviceDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [controlValues, setControlValues] = useState({});
    const [refreshCountdown, setRefreshCountdown] = useState(30);
    const [lastUpdated, setLastUpdated] = useState(null);
    
    const [newDevice, setNewDevice] = useState({ 
        userId: '', 
        name: '', 
        deviceType: 'light', 
        room: '', 
        status: 'off',
        brightness: 100,
        temperature: 24,
        speed: 50,
        isLocked: true
    });

    const fetchDevicesData = useCallback(() => {
        const params = { ...filters };
        if (selectedUser) {
            params.userId = selectedUser.id;
        }
        dispatch(fetchDevices(params));
        setLastUpdated(new Date());
        setRefreshCountdown(30);
    }, [dispatch, filters, selectedUser]);

    const fetchUsers = useCallback(async () => {
        setUsersLoading(true);
        try {
            const response = await adminApi.users.list({ page: 0, limit: 100 });
            if (response.data.success) {
                setUsers(response.data.users || []);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setUsersLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDevicesData();
        fetchUsers();
        const interval = setInterval(fetchDevicesData, 30000);
        return () => clearInterval(interval);
    }, [fetchDevicesData]);

    useEffect(() => {
        if (!loading) {
            const countdown = setInterval(() => {
                setRefreshCountdown(prev => (prev > 0 ? prev - 1 : 30));
            }, 1000);
            return () => clearInterval(countdown);
        }
    }, [loading]);

    const handleToggle = async (device) => {
        try {
            await dispatch(toggleDevice(device.id)).unwrap();
        } catch (err) {
            console.error('Error toggling device:', err);
        }
    };

    const handleOpenDetail = async (device) => {
        setDeviceDetail(device);
        setControlValues({
            brightness: device.brightness || 100,
            temperature: device.temperature || 24,
            speed: device.speed || 50,
            isLocked: device.isLocked ?? true,
        });
    };

    const handleCloseDetail = () => {
        setDeviceDetail(null);
        setControlValues({});
        dispatch(clearSelectedDevice());
    };

    const handleControlChange = async (field, value) => {
        if (!deviceDetail) return;
        
        setControlValues(prev => ({ ...prev, [field]: value }));
        
        try {
            await dispatch(controlDevice({ 
                id: deviceDetail.id, 
                command: { [field]: value } 
            })).unwrap();
            setDeviceDetail(prev => ({ ...prev, [field]: value }));
        } catch (err) {
            console.error('Error controlling device:', err);
            setControlValues(prev => ({ ...prev, [field]: deviceDetail[field] }));
        }
    };

    const handleAddDevice = async () => {
        try {
            await dispatch(addDevice(newDevice)).unwrap();
            setAddDialog({ open: false });
            setNewDevice({ 
                userId: '', 
                name: '', 
                deviceType: 'light', 
                room: '', 
                status: 'off',
                brightness: 100,
                temperature: 24,
                speed: 50,
                isLocked: true
            });
            fetchDevicesData();
        } catch (err) {
            console.error('Error adding device:', err);
        }
    };

    const handleEditDevice = async () => {
        if (!selectedDevice) return;
        try {
            await dispatch(updateDevice({
                id: selectedDevice.id,
                data: editDialog.data
            })).unwrap();
            setEditDialog({ open: false });
            fetchDevicesData();
        } catch (err) {
            console.error('Error updating device:', err);
        }
    };

    const handleDeleteDevice = async (deviceId) => {
        if (!window.confirm('Are you sure you want to delete this device?')) return;
        try {
            await dispatch(deleteDevice(deviceId)).unwrap();
            if (deviceDetail?.id === deviceId) {
                handleCloseDetail();
            }
        } catch (err) {
            console.error('Error deleting device:', err);
        }
    };

    const filteredDevices = devices.filter(device => {
        const typeMatch = filters.type === 'all' || device.device_type === filters.type;
        const statusMatch = filters.status === 'all' || device.status === filters.status;
        const searchMatch = !searchQuery || 
            device.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            device.room?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            device.email?.toLowerCase().includes(searchQuery.toLowerCase());
        return typeMatch && statusMatch && searchMatch;
    });

    const groupedByUser = filteredDevices.reduce((acc, device) => {
        const userKey = device.user_id || 'unassigned';
        const userName = device.first_name ? `${device.first_name} ${device.last_name}` : device.email || 'Unassigned';
        if (!acc[userKey]) {
            acc[userKey] = { name: userName, devices: [], count: { total: 0, active: 0 } };
        }
        acc[userKey].devices.push(device);
        acc[userKey].count.total++;
        if (device.status === 'on') acc[userKey].count.active++;
        return acc;
    }, {});

    const stats = {
        total: devices.length,
        active: devices.filter(d => d.status === 'on').length,
        offline: devices.filter(d => d.status !== 'on').length,
        byType: devices.reduce((acc, d) => {
            acc[d.device_type] = (acc[d.device_type] || 0) + 1;
            return acc;
        }, {}),
        totalUsers: Object.keys(groupedByUser).length,
    };

    const getDeviceIcon = (type) => DEVICE_TYPES[type]?.icon || <PowerIcon />;
    const getDeviceColor = (type) => DEVICE_TYPES[type]?.color || '#6366f1';

    const formatLastUpdated = () => {
        if (!lastUpdated) return '';
        return `Updated ${lastUpdated.toLocaleTimeString()}`;
    };

    return (
        <Box sx={{ minHeight: 'calc(100vh - 120px)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            IoT Device Management
                        </Typography>
                        <Chip
                            label={stats.active > 0 ? `${stats.active} Active` : 'All Offline'}
                            size="small"
                            sx={{
                                bgcolor: stats.active > 0 ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                                color: stats.active > 0 ? '#10b981' : '#ef4444',
                                fontWeight: 600,
                                animation: stats.active > 0 ? 'pulse 2s infinite' : 'none',
                            }}
                        />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Monitor and control your smart home devices
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
                        <Typography variant="caption" color="text.secondary">Refresh</Typography>
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
                    <Button 
                        variant="outlined" 
                        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />} 
                        onClick={fetchDevicesData} 
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />} 
                        onClick={() => setAddDialog({ open: true })}
                        sx={{ fontWeight: 600 }}
                    >
                        Add Device
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: 'primary.main', boxShadow: 1 }
                        }}
                    >
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }}>
                            <WifiIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#6366f1', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : stats.total}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Total Devices</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: 'success.main', boxShadow: 1 }
                        }}
                    >
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#10b981', 0.1), color: '#10b981' }}>
                            <CheckCircleIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : stats.active}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Active</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: 'error.main', boxShadow: 1 }
                        }}
                    >
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' }}>
                            <CancelIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#ef4444', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : stats.offline}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Offline</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: 'warning.main', boxShadow: 1 }
                        }}
                    >
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b' }}>
                            <PersonIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : stats.totalUsers}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Users</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Card sx={{ mb: 3 }}>
                <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Tabs 
                        value={viewMode} 
                        onChange={(_, v) => setViewMode(v)}
                        sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40 } }}
                    >
                        <Tab 
                            value="grid" 
                            icon={<GridViewIcon sx={{ fontSize: 18 }} />} 
                            iconPosition="start"
                            label="Grid View"
                            sx={{ minWidth: 120 }}
                        />
                        <Tab 
                            value="grouped" 
                            icon={<GroupIcon sx={{ fontSize: 18 }} />} 
                            iconPosition="start"
                            label="By User"
                            sx={{ minWidth: 120 }}
                        />
                    </Tabs>

                    <Box sx={{ flex: 1 }} />

                    <TextField
                        size="small"
                        placeholder="Search devices..."
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

                    <Autocomplete
                        size="small"
                        options={users}
                        loading={usersLoading}
                        getOptionLabel={(option) => option.name || option.email || ''}
                        value={selectedUser}
                        onChange={(_, value) => setSelectedUser(value)}
                        renderOption={(props, option) => (
                            <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                                    {(option.name || option.email || 'U').charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2">{option.name || 'Unknown'}</Typography>
                                    <Typography variant="caption" color="text.secondary">{option.email}</Typography>
                                </Box>
                            </Box>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Filter by user"
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ width: 200 }}
                            />
                        )}
                    />

                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={filters.type}
                            label="Type"
                            onChange={(e) => dispatch(setTypeFilter(e.target.value))}
                        >
                            <MenuItem value="all">All Types</MenuItem>
                            {Object.entries(DEVICE_TYPES).map(([key, config]) => (
                                <MenuItem key={key} value={key}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ color: config.color, display: 'flex' }}>{config.icon}</Box>
                                        {config.name}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={filters.status}
                            label="Status"
                            onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                        >
                            <MenuItem value="all">All Status</MenuItem>
                            <MenuItem value="on">Online</MenuItem>
                            <MenuItem value="off">Offline</MenuItem>
                        </Select>
                    </FormControl>

                    {selectedUser && (
                        <Chip
                            label={`User: ${selectedUser.name || selectedUser.email}`}
                            size="small"
                            onDelete={() => setSelectedUser(null)}
                            sx={{ fontWeight: 500 }}
                        />
                    )}
                </Box>
            </Card>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} action={
                    <Button color="inherit" size="small" onClick={fetchDevicesData}>
                        Retry
                    </Button>
                }>
                    {error}
                </Alert>
            )}

            {viewMode === 'grid' ? (
                <Grid container spacing={3}>
                    {loading && devices.length === 0 ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <Card sx={{ height: 180 }}>
                                    <CardContent>
                                        <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
                                        <Skeleton variant="text" />
                                        <Skeleton variant="text" width="60%" />
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : filteredDevices.length === 0 ? (
                        <Grid item xs={12}>
                            <Card sx={{ p: 6, textAlign: 'center' }}>
                                <Box
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: '50%',
                                        bgcolor: alpha('#6366f1', 0.1),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 2,
                                    }}
                                >
                                    <DevicesOtherIcon sx={{ fontSize: 48, color: '#6366f1' }} />
                                </Box>
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                                    {searchQuery || selectedUser ? 'No Matching Devices' : 'No Devices Yet'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {searchQuery || selectedUser 
                                        ? 'No devices match your current filters' 
                                        : 'Add your first IoT device to get started'}
                                </Typography>
                                {(searchQuery || selectedUser) ? (
                                    <Button 
                                        variant="text" 
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedUser(null);
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                ) : (
                                    <Button 
                                        variant="contained" 
                                        startIcon={<AddIcon />} 
                                        onClick={() => setAddDialog({ open: true })}
                                    >
                                        Add Device
                                    </Button>
                                )}
                            </Card>
                        </Grid>
                    ) : (
                        filteredDevices.map((device) => (
                            <Grid item xs={12} sm={6} md={4} key={device.id}>
                                <Card 
                                    sx={{ 
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        border: '1px solid',
                                        borderColor: device.status === 'on' ? alpha(getDeviceColor(device.device_type), 0.3) : 'divider',
                                        '&:hover': { 
                                            transform: 'translateY(-2px)', 
                                            boxShadow: 4,
                                            borderColor: getDeviceColor(device.device_type),
                                        }
                                    }}
                                    onClick={() => handleOpenDetail(device)}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        bgcolor: device.status === 'on' ? alpha(getDeviceColor(device.device_type), 0.15) : alpha('#000', 0.05),
                                                        color: device.status === 'on' ? getDeviceColor(device.device_type) : 'text.secondary',
                                                        transition: 'all 0.3s',
                                                        display: 'flex',
                                                    }}
                                                >
                                                    {getDeviceIcon(device.device_type)}
                                                </Box>
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {device.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {device.room || 'No room'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Switch
                                                checked={device.status === 'on'}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    handleToggle(device);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                size="small"
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                                        color: getDeviceColor(device.device_type),
                                                    },
                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                        bgcolor: getDeviceColor(device.device_type),
                                                    },
                                                }}
                                            />
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Chip
                                                label={device.status === 'on' ? 'Online' : 'Offline'}
                                                size="small"
                                                sx={{
                                                    bgcolor: device.status === 'on' ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                                                    color: device.status === 'on' ? '#10b981' : '#ef4444',
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem',
                                                }}
                                            />
                                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                {device.brightness !== undefined ? `${device.brightness}%` : 
                                                 device.temperature !== undefined ? `${device.temperature}°C` :
                                                 device.speed !== undefined ? `${device.speed}%` : ''}
                                            </Typography>
                                        </Box>

                                        <Divider sx={{ my: 1.5 }} />

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: 'primary.main' }}>
                                                    {(device.first_name || device.email || 'U').charAt(0)}
                                                </Avatar>
                                                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 100 }}>
                                                    {device.first_name ? `${device.first_name}` : device.email?.split('@')[0] || 'Unknown'}
                                                </Typography>
                                            </Box>
                                            <Tooltip title={DEVICE_TYPES[device.device_type]?.name || device.device_type}>
                                                <Chip 
                                                    icon={<Box sx={{ display: 'flex', fontSize: 14 }}>{getDeviceIcon(device.device_type)}</Box>}
                                                    label={DEVICE_TYPES[device.device_type]?.name || device.device_type}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.65rem', height: 24 }}
                                                />
                                            </Tooltip>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            ) : (
                <Box>
                    {loading && devices.length === 0 ? (
                        Array.from({ length: 2 }).map((_, i) => (
                            <Card key={i} sx={{ mb: 2 }}>
                                <CardContent>
                                    <Skeleton width={200} height={32} sx={{ mb: 2 }} />
                                    <Grid container spacing={2}>
                                        {[...Array(3)].map((_, j) => (
                                            <Grid item xs={12} sm={6} md={4} key={j}>
                                                <Skeleton variant="rectangular" height={100} />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </CardContent>
                            </Card>
                        ))
                    ) : Object.keys(groupedByUser).length === 0 ? (
                        <Card sx={{ p: 6, textAlign: 'center' }}>
                            <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                No devices found
                            </Typography>
                        </Card>
                    ) : (
                        Object.entries(groupedByUser).map(([userId, userGroup]) => (
                            <Card key={userId} sx={{ mb: 3, overflow: 'hidden' }}>
                                <Box sx={{ 
                                    p: 2.5, 
                                    bgcolor: 'background.default',
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                                            {(userGroup.name || 'U').charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight={700}>
                                                {userGroup.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {userGroup.count.active} of {userGroup.count.total} devices active
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Chip 
                                        label={`${userGroup.count.total} devices`}
                                        size="small"
                                        sx={{ fontWeight: 500 }}
                                    />
                                </Box>
                                <Box sx={{ p: 2 }}>
                                    <Grid container spacing={2}>
                                        {userGroup.devices.map((device) => (
                                            <Grid item xs={12} sm={6} md={4} key={device.id}>
                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: 2,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        border: '1px solid',
                                                        borderColor: device.status === 'on' ? alpha(getDeviceColor(device.device_type), 0.3) : 'divider',
                                                        '&:hover': { 
                                                            borderColor: getDeviceColor(device.device_type),
                                                            boxShadow: 1,
                                                        }
                                                    }}
                                                    onClick={() => handleOpenDetail(device)}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                                        <Box
                                                            sx={{
                                                                p: 1,
                                                                borderRadius: 1.5,
                                                                bgcolor: device.status === 'on' ? alpha(getDeviceColor(device.device_type), 0.15) : alpha('#000', 0.05),
                                                                color: device.status === 'on' ? getDeviceColor(device.device_type) : 'text.secondary',
                                                                display: 'flex',
                                                            }}
                                                        >
                                                            {React.cloneElement(getDeviceIcon(device.device_type), { sx: { fontSize: 18 } })}
                                                        </Box>
                                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                                            <Typography variant="body2" fontWeight={600} noWrap>
                                                                {device.name}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" noWrap>
                                                                {device.room || 'No room'}
                                                            </Typography>
                                                        </Box>
                                                        <Switch
                                                            checked={device.status === 'on'}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                handleToggle(device);
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            size="small"
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Chip
                                                            label={device.status === 'on' ? 'Online' : 'Offline'}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: device.status === 'on' ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                                                                color: device.status === 'on' ? '#10b981' : '#ef4444',
                                                                fontWeight: 600,
                                                                fontSize: '0.65rem',
                                                                height: 20,
                                                            }}
                                                        />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {device.brightness !== undefined ? `Brightness: ${device.brightness}%` : 
                                                             device.temperature !== undefined ? `Temp: ${device.temperature}°C` :
                                                             device.speed !== undefined ? `Speed: ${device.speed}%` : ''}
                                                        </Typography>
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            </Card>
                        ))
                    )}
                </Box>
            )}

            <Dialog open={addDialog.open} onClose={() => setAddDialog({ open: false })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }}>
                            <AddIcon />
                        </Box>
                        Add New Device
                    </Box>
                    <IconButton onClick={() => setAddDialog({ open: false })}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                        <Autocomplete
                            options={users}
                            loading={usersLoading}
                            getOptionLabel={(option) => option.name ? `${option.name} (${option.email})` : option.email}
                            value={users.find(u => u.id === newDevice.userId) || null}
                            onChange={(_, value) => setNewDevice({ ...newDevice, userId: value?.id || '' })}
                            renderOption={(props, option) => (
                                <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                                        {(option.name || option.email || 'U').charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2">{option.name || 'Unknown'}</Typography>
                                        <Typography variant="caption" color="text.secondary">{option.email}</Typography>
                                    </Box>
                                </Box>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Owner"
                                    placeholder="Select user"
                                    required
                                />
                            )}
                        />
                        <TextField
                            fullWidth
                            label="Device Name"
                            value={newDevice.name}
                            onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                            placeholder="e.g., Living Room Light"
                            required
                            size="small"
                        />
                        <FormControl fullWidth size="small">
                            <InputLabel>Device Type</InputLabel>
                            <Select
                                label="Device Type"
                                value={newDevice.deviceType}
                                onChange={(e) => setNewDevice({ ...newDevice, deviceType: e.target.value })}
                            >
                                {Object.entries(DEVICE_TYPES).map(([key, config]) => (
                                    <MenuItem key={key} value={key}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ color: config.color, display: 'flex' }}>{config.icon}</Box>
                                            {config.name}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Room"
                            value={newDevice.room}
                            onChange={(e) => setNewDevice({ ...newDevice, room: e.target.value })}
                            placeholder="e.g., Living Room"
                            size="small"
                        />
                        
                        {newDevice.deviceType === 'light' && (
                            <Box sx={{ px: 1 }}>
                                <Typography variant="body2" gutterBottom>
                                    Brightness: {newDevice.brightness}%
                                </Typography>
                                <Slider
                                    value={newDevice.brightness}
                                    onChange={(e, v) => setNewDevice({ ...newDevice, brightness: v })}
                                    min={0}
                                    max={100}
                                    sx={{ color: getDeviceColor('light') }}
                                />
                            </Box>
                        )}
                        
                        {(newDevice.deviceType === 'thermostat' || newDevice.deviceType === 'ac') && (
                            <Box sx={{ px: 1 }}>
                                <Typography variant="body2" gutterBottom>
                                    Temperature: {newDevice.temperature}°C
                                </Typography>
                                <Slider
                                    value={newDevice.temperature}
                                    onChange={(e, v) => setNewDevice({ ...newDevice, temperature: v })}
                                    min={16}
                                    max={32}
                                    sx={{ color: getDeviceColor('thermostat') }}
                                />
                            </Box>
                        )}
                        
                        {newDevice.deviceType === 'fan' && (
                            <Box sx={{ px: 1 }}>
                                <Typography variant="body2" gutterBottom>
                                    Speed: {newDevice.speed}%
                                </Typography>
                                <Slider
                                    value={newDevice.speed}
                                    onChange={(e, v) => setNewDevice({ ...newDevice, speed: v })}
                                    min={0}
                                    max={100}
                                    sx={{ color: getDeviceColor('fan') }}
                                />
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setAddDialog({ open: false })}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleAddDevice}
                        disabled={!newDevice.userId || !newDevice.name}
                    >
                        Add Device
                    </Button>
                </DialogActions>
            </Dialog>

            <Drawer
                anchor="right"
                open={!!deviceDetail}
                onClose={handleCloseDetail}
                PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}
            >
                {deviceDetail && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ 
                            p: 3, 
                            bgcolor: alpha(getDeviceColor(deviceDetail.device_type), 0.1),
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                    <Typography variant="h6" fontWeight={700}>Device Details</Typography>
                                    <Typography variant="caption" color="text.secondary">ID: {deviceDetail.id}</Typography>
                                </Box>
                                <IconButton onClick={handleCloseDetail}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: deviceDetail.status === 'on' ? getDeviceColor(deviceDetail.device_type) : 'action.disabledBackground',
                                        color: 'white',
                                        display: 'flex',
                                    }}
                                >
                                    {React.cloneElement(getDeviceIcon(deviceDetail.device_type), { sx: { fontSize: 28 } })}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6">{deviceDetail.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {DEVICE_TYPES[deviceDetail.device_type]?.name || deviceDetail.device_type}
                                    </Typography>
                                </Box>
                                <Switch
                                    checked={deviceDetail.status === 'on'}
                                    onChange={() => handleToggle(deviceDetail)}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: getDeviceColor(deviceDetail.device_type),
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            bgcolor: getDeviceColor(deviceDetail.device_type),
                                        },
                                    }}
                                />
                            </Box>
                        </Box>

                        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                            <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1.5 }}>
                                    QUICK STATUS
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                    <Chip 
                                        label={deviceDetail.status === 'on' ? 'Online' : 'Offline'} 
                                        size="small"
                                        sx={{ 
                                            bgcolor: deviceDetail.status === 'on' ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                                            color: deviceDetail.status === 'on' ? '#10b981' : '#ef4444',
                                            fontWeight: 600,
                                        }}
                                    />
                                    {deviceDetail.room && (
                                        <Chip label={deviceDetail.room} size="small" variant="outlined" />
                                    )}
                                    <Chip 
                                        label={DEVICE_TYPES[deviceDetail.device_type]?.name || deviceDetail.device_type} 
                                        size="small" 
                                        variant="outlined" 
                                        icon={getDeviceIcon(deviceDetail.device_type)}
                                    />
                                </Box>
                            </Paper>

                            <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1.5 }}>
                                    OWNER INFORMATION
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                                        {(deviceDetail.first_name || deviceDetail.email || 'U').charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>
                                            {deviceDetail.first_name ? `${deviceDetail.first_name} ${deviceDetail.last_name}` : 'Unknown User'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {deviceDetail.email || 'No email'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>

                            {deviceDetail.status === 'on' && (
                                <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1.5 }}>
                                        DEVICE CONTROLS
                                    </Typography>
                                    
                                    {deviceDetail.device_type === 'light' && (
                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2">Brightness</Typography>
                                                <Typography variant="body2" fontWeight={600}>{controlValues.brightness}%</Typography>
                                            </Box>
                                            <Slider
                                                value={controlValues.brightness}
                                                onChange={(e, v) => setControlValues(prev => ({ ...prev, brightness: v }))}
                                                onChangeCommitted={(e, v) => handleControlChange('brightness', v)}
                                                min={0}
                                                max={100}
                                                sx={{ color: getDeviceColor('light') }}
                                            />
                                        </Box>
                                    )}

                                    {(deviceDetail.device_type === 'thermostat' || deviceDetail.device_type === 'ac') && (
                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2">Temperature</Typography>
                                                <Typography variant="body2" fontWeight={600}>{controlValues.temperature}°C</Typography>
                                            </Box>
                                            <Slider
                                                value={controlValues.temperature}
                                                onChange={(e, v) => setControlValues(prev => ({ ...prev, temperature: v }))}
                                                onChangeCommitted={(e, v) => handleControlChange('temperature', v)}
                                                min={16}
                                                max={32}
                                                sx={{ color: getDeviceColor('thermostat') }}
                                            />
                                        </Box>
                                    )}

                                    {deviceDetail.device_type === 'fan' && (
                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2">Speed</Typography>
                                                <Typography variant="body2" fontWeight={600}>{controlValues.speed}%</Typography>
                                            </Box>
                                            <Slider
                                                value={controlValues.speed}
                                                onChange={(e, v) => setControlValues(prev => ({ ...prev, speed: v }))}
                                                onChangeCommitted={(e, v) => handleControlChange('speed', v)}
                                                min={0}
                                                max={100}
                                                sx={{ color: getDeviceColor('fan') }}
                                            />
                                        </Box>
                                    )}

                                    {deviceDetail.device_type === 'lock' && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" fontWeight={500}>
                                                {controlValues.isLocked ? 'Locked' : 'Unlocked'}
                                            </Typography>
                                            <Switch
                                                checked={controlValues.isLocked}
                                                onChange={(e) => handleControlChange('isLocked', e.target.checked)}
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': { color: getDeviceColor('lock') },
                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: getDeviceColor('lock') },
                                                }}
                                            />
                                        </Box>
                                    )}
                                </Paper>
                            )}

                            {(deviceDetail.brightness !== undefined || deviceDetail.temperature !== undefined || deviceDetail.speed !== undefined) && (
                                <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1.5 }}>
                                        CURRENT READINGS
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {deviceDetail.brightness !== undefined && (
                                            <Grid item xs={4}>
                                                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                                                    <LightbulbIcon sx={{ color: '#f59e0b', mb: 0.5 }} />
                                                    <Typography variant="h6" fontWeight={700}>{deviceDetail.brightness}%</Typography>
                                                    <Typography variant="caption" color="text.secondary">Brightness</Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                        {deviceDetail.temperature !== undefined && (
                                            <Grid item xs={4}>
                                                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                                                    <ThermostatIcon sx={{ color: '#6366f1', mb: 0.5 }} />
                                                    <Typography variant="h6" fontWeight={700}>{deviceDetail.temperature}°C</Typography>
                                                    <Typography variant="caption" color="text.secondary">Temp</Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                        {deviceDetail.speed !== undefined && (
                                            <Grid item xs={4}>
                                                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                                                    <SpeedIcon sx={{ color: '#3b82f6', mb: 0.5 }} />
                                                    <Typography variant="h6" fontWeight={700}>{deviceDetail.speed}%</Typography>
                                                    <Typography variant="caption" color="text.secondary">Speed</Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Paper>
                            )}

                            <Paper 
                                variant="outlined" 
                                sx={{ 
                                    p: 2, 
                                    borderRadius: 2,
                                    borderColor: 'error.main',
                                    bgcolor: alpha('#ef4444', 0.02),
                                }}
                            >
                                <Typography variant="caption" color="error.main" fontWeight={600} sx={{ display: 'block', mb: 1.5 }}>
                                    DANGER ZONE
                                </Typography>
                                <Button 
                                    variant="outlined" 
                                    color="error" 
                                    startIcon={<DeleteIcon />}
                                    onClick={() => handleDeleteDevice(deviceDetail.id)}
                                    fullWidth
                                >
                                    Delete Device
                                </Button>
                            </Paper>
                        </Box>
                    </Box>
                )}
            </Drawer>
        </Box>
    );
};

export default HomeAutomation;

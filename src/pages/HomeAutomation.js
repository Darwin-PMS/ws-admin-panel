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
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import {
    Add as AddIcon,
    Lightbulb as LightbulbIcon,
    Thermostat as ThermostatIcon,
    Lock as LockIcon,
    Security as SecurityIcon,
    Power as PowerIcon,
    Home as HomeIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDevices, setTypeFilter, toggleDevice, addDevice } from '../store/slices/devicesSlice';

// Device icons will be fetched from API configuration
const deviceIcons = {
    light: <LightbulbIcon />,
    thermostat: <ThermostatIcon />,
    lock: <LockIcon />,
    camera: <SecurityIcon />,
    garage: <LockIcon />,
};

// Device colors will be fetched from API configuration
const deviceColors = {
    light: '#f59e0b',
    thermostat: '#6366f1',
    lock: '#10b981',
    camera: '#ef4444',
    garage: '#8b5cf6',
};

const HomeAutomation = () => {
    const dispatch = useDispatch();
    const { devices, loading, error, filters } = useSelector((state) => state.devices);
    const [addDialog, setAddDialog] = useState({ open: false });
    const [newDevice, setNewDevice] = useState({ name: '', type: 'light', room: '', owner: '' });

    const fetchDevicesData = useCallback(() => {
        dispatch(fetchDevices());
    }, [dispatch]);

    useEffect(() => {
        fetchDevicesData();
    }, [fetchDevicesData]);

    const handleToggle = (device) => {
        dispatch(toggleDevice(device.id));
    };

    const handleAddDevice = async () => {
        try {
            await dispatch(addDevice(newDevice)).unwrap();
            setAddDialog({ open: false });
            setNewDevice({ name: '', type: 'light', room: '', owner: '' });
        } catch (error) {
            console.error('Error adding device:', error);
        }
    };

    const filteredDevices = devices.filter(device =>
        filters.type === 'all' || device.type === filters.type
    );

    const activeDevices = devices.filter(d => d.status === 'on').length;
    const uniqueOwners = new Set(devices.map(d => d.owner)).size;

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Home Automation
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage smart home devices and automation
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl sx={{ minWidth: 150 }}>
                        <Select
                            value={filters.type}
                            onChange={(e) => dispatch(setTypeFilter(e.target.value))}
                            displayEmpty
                        >
                            <MenuItem value="all">All Devices</MenuItem>
                            <MenuItem value="light">Lights</MenuItem>
                            <MenuItem value="thermostat">Thermostats</MenuItem>
                            <MenuItem value="lock">Locks</MenuItem>
                            <MenuItem value="camera">Cameras</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchDevicesData} disabled={loading}>
                        Refresh
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddDialog({ open: true })}>
                        Add Device
                    </Button>
                </Box>
            </Box>

            {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

            {/* Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {loading ? <Skeleton variant="circular" width={48} height={48} /> : (
                                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.main', color: 'white' }}>
                                    <PowerIcon />
                                </Box>
                            )}
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {loading ? <Skeleton width={40} /> : devices.length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Devices
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {loading ? <Skeleton variant="circular" width={48} height={48} /> : (
                                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.main', color: 'white' }}>
                                    <PowerIcon />
                                </Box>
                            )}
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {loading ? <Skeleton width={40} /> : activeDevices}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Active Now
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {loading ? <Skeleton variant="circular" width={48} height={48} /> : (
                                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.main', color: 'white' }}>
                                    <HomeIcon />
                                </Box>
                            )}
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {loading ? <Skeleton width={40} /> : uniqueOwners}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Connected Homes
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Devices Grid */}
            <Grid container spacing={3}>
                {filteredDevices.map((device) => (
                    <Grid item xs={12} sm={6} md={4} key={device.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 2,
                                                bgcolor: device.status === 'on' ? `${deviceColors[device.type]}20` : 'background.default',
                                                color: device.status === 'on' ? deviceColors[device.type] : 'text.secondary',
                                            }}
                                        >
                                            {deviceIcons[device.type]}
                                        </Box>
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                {device.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {device.room}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Switch
                                        checked={device.status === 'on'}
                                        onChange={() => handleToggle(device)}
                                        color="primary"
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Chip
                                        label={device.status === 'on' ? 'Online' : 'Offline'}
                                        size="small"
                                        sx={{
                                            bgcolor: device.status === 'on' ? 'success.main' : 'error.main',
                                            color: 'white',
                                        }}
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        {device.value}{device.type === 'thermostat' ? '°C' : '%'}
                                    </Typography>
                                </Box>

                                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Owner: {device.owner}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Add Device Drawer */}
            <Drawer
                anchor="right"
                open={addDialog.open}
                onClose={() => setAddDialog({ open: false })}
            >
                <Box sx={{ width: 400, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">Add New Device</Typography>
                        <IconButton onClick={() => setAddDialog({ open: false })}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Device Name"
                            value={newDevice.name}
                            onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Device Type</InputLabel>
                            <Select
                                label="Device Type"
                                value={newDevice.type}
                                onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value })}
                            >
                                <MenuItem value="light">Light</MenuItem>
                                <MenuItem value="thermostat">Thermostat</MenuItem>
                                <MenuItem value="lock">Lock</MenuItem>
                                <MenuItem value="camera">Camera</MenuItem>
                                <MenuItem value="garage">Garage Door</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Room"
                            value={newDevice.room}
                            onChange={(e) => setNewDevice({ ...newDevice, room: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Owner"
                            value={newDevice.owner}
                            onChange={(e) => setNewDevice({ ...newDevice, owner: e.target.value })}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Button onClick={() => setAddDialog({ open: false })} fullWidth>Cancel</Button>
                        <Button variant="contained" onClick={handleAddDevice} fullWidth>Add Device</Button>
                    </Box>
                </Box>
            </Drawer>
        </Box>
    );
};

export default HomeAutomation;

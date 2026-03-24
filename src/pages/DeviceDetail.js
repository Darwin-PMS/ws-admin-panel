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
    CircularProgress,
    Alert,
    Switch,
    Slider,
    IconButton,
    Divider,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Delete as DeleteIcon,
    PowerSettingsNew as PowerIcon,
    Edit as EditIcon,
    Lightbulb as LightbulbIcon,
    Thermostat as ThermostatIcon,
    Lock as LockIcon,
    Videocam as CameraIcon,
    DirectionsCar as GarageIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { adminApi } from '../services/api';

const deviceTypeIcons = {
    light: <LightbulbIcon />,
    thermostat: <ThermostatIcon />,
    lock: <LockIcon />,
    camera: <CameraIcon />,
    garage: <GarageIcon />,
};

const deviceTypeColors = {
    light: '#fbbf24',
    thermostat: '#ef4444',
    lock: '#6366f1',
    camera: '#10b981',
    garage: '#8b5cf6',
};

const DeviceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [device, setDevice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);

    const fetchDevice = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminApi.getDeviceById(id);
            if (response.data.success) {
                setDevice(response.data.device);
            } else {
                setError('Device not found');
            }
        } catch (err) {
            console.error('Error fetching device:', err);
            setError('Failed to fetch device details');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDevice();
    }, [fetchDevice]);

    const handleToggle = async () => {
        try {
            setUpdating(true);
            const response = await adminApi.toggleDevice(id);
            if (response.data.success) {
                setDevice(response.data.device);
            }
        } catch (err) {
            console.error('Error toggling device:', err);
            setError('Failed to toggle device');
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdate = async (updates) => {
        try {
            setUpdating(true);
            const response = await adminApi.updateDevice(id, updates);
            if (response.data.success) {
                setDevice(response.data.device);
            }
        } catch (err) {
            console.error('Error updating device:', err);
            setError('Failed to update device');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this device?')) {
            try {
                await adminApi.deleteDevice(id);
                navigate('/home-automation');
            } catch (err) {
                console.error('Error deleting device:', err);
                setError('Failed to delete device');
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error && !device) {
        return (
            <Box>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button onClick={() => navigate('/home-automation')}>Back to Devices</Button>
            </Box>
        );
    }

    const isOn = device?.status === 'on';

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/home-automation')}
                        startIcon={<ArrowBackIcon />}
                    >
                        Back
                    </Button>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                            p: 1.5, 
                            borderRadius: 2, 
                            bgcolor: `${deviceTypeColors[device?.device_type] || '#6366f1'}20`,
                            color: deviceTypeColors[device?.device_type] || '#6366f1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {deviceTypeIcons[device?.device_type] || <PowerIcon />}
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {device?.name || 'Device Details'}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchDevice}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Device Control</Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <PowerIcon sx={{ fontSize: 32, color: isOn ? 'success.main' : 'text.secondary' }} />
                                    <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>Power</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {isOn ? 'Device is on' : 'Device is off'}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Switch
                                    checked={isOn}
                                    onChange={handleToggle}
                                    disabled={updating}
                                    color="success"
                                    sx={{ '& .MuiSwitch-thumb': { width: 32, height: 32 } }}
                                />
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {device?.device_type === 'light' && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>Brightness</Typography>
                                    <Slider
                                        value={device?.brightness || 50}
                                        onChange={(_, value) => handleUpdate({ brightness: value })}
                                        disabled={!isOn || updating}
                                        min={0}
                                        max={100}
                                        valueLabelDisplay="auto"
                                        valueLabelFormat={(v) => `${v}%`}
                                    />
                                </Box>
                            )}

                            {device?.device_type === 'thermostat' && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>Temperature</Typography>
                                    <Slider
                                        value={device?.temperature || 22}
                                        onChange={(_, value) => handleUpdate({ temperature: value })}
                                        disabled={!isOn || updating}
                                        min={16}
                                        max={30}
                                        valueLabelDisplay="auto"
                                        valueLabelFormat={(v) => `${v}°C`}
                                    />
                                </Box>
                            )}

                            {device?.device_type === 'lock' && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>Lock Status</Typography>
                                    <Switch
                                        checked={device?.is_locked || false}
                                        onChange={(_, checked) => handleUpdate({ is_locked: checked })}
                                        disabled={updating}
                                        color="primary"
                                        label="Locked"
                                    />
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Device Information</Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Type</Typography>
                                    <Chip 
                                        label={device?.device_type || 'Unknown'} 
                                        size="small"
                                        sx={{ 
                                            bgcolor: `${deviceTypeColors[device?.device_type] || '#6366f1'}20`,
                                            color: deviceTypeColors[device?.device_type] || '#6366f1',
                                            fontWeight: 500
                                        }}
                                    />
                                </Box>
                                
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Room</Typography>
                                    <Typography variant="body1">{device?.room || 'Not assigned'}</Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary">Owner</Typography>
                                    <Typography variant="body1">
                                        {device?.first_name && device?.last_name 
                                            ? `${device.first_name} ${device.last_name}` 
                                            : device?.email || 'Unknown'}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary">Status</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Chip
                                            label={isOn ? 'Online' : 'Offline'}
                                            size="small"
                                            sx={{
                                                bgcolor: isOn ? 'success.main' : 'text.secondary',
                                                color: 'white',
                                                fontWeight: 500
                                            }}
                                        />
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                                    <Typography variant="body2">
                                        {device?.updated_at ? new Date(device.updated_at).toLocaleString() : 'Never'}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DeviceDetail;

import React, { useEffect, useState, useCallback } from 'react';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Divider,
    Paper,
    Switch,
    FormControlLabel,
} from '@mui/material';
import {
    GpsFixed as GpsIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    Security as SafeIcon,
    Warning as DangerIcon,
    LocationOn as LocationIcon,
    Circle as CircleIcon,
} from '@mui/icons-material';
import { adminApi } from '../services/api';

const generateId = () => 'geo-' + Math.random().toString(36).substr(2, 9);

const generateDemoGeofences = () => [
    { id: generateId(), name: 'Home - Delhi', type: 'safe', latitude: 28.6139, longitude: 77.2090, radius: 100, active: true },
    { id: generateId(), name: 'Office - Gurgaon', type: 'safe', latitude: 28.4645, longitude: 77.0299, radius: 150, active: true },
    { id: generateId(), name: 'School Zone', type: 'safe', latitude: 28.6328, longitude: 77.2197, radius: 200, active: true },
    { id: generateId(), name: 'Danger Area - North', type: 'danger', latitude: 28.6500, longitude: 77.2500, radius: 50, active: false },
    { id: generateId(), name: 'Market Area', type: 'safe', latitude: 28.6000, longitude: 77.2000, radius: 80, active: true },
];

const Geofencing = () => {
    const [geofences, setGeofences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingGeofence, setEditingGeofence] = useState(null);
    const [useDemoData, setUseDemoData] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'safe',
        latitude: '',
        longitude: '',
        radius: 100,
        active: true,
    });

    const fetchGeofences = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminApi.getGeofences();
            if (response.data.success) {
                setGeofences(response.data.geofences || response.data.data || []);
                setUseDemoData(false);
            } else if (response.data.geofences || response.data.data) {
                setGeofences(response.data.geofences || response.data.data || []);
                setUseDemoData(false);
            }
        } catch (err) {
            console.warn('API unavailable, using demo data:', err.message);
            setError(null);
            setUseDemoData(true);
            setGeofences(generateDemoGeofences());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGeofences();
    }, [fetchGeofences]);

    const handleOpenDialog = (geofence = null) => {
        if (geofence) {
            setEditingGeofence(geofence);
            setFormData({
                name: geofence.name || '',
                type: geofence.type || 'safe',
                latitude: geofence.latitude || '',
                longitude: geofence.longitude || '',
                radius: geofence.radius || 100,
                active: geofence.active !== false,
            });
        } else {
            setEditingGeofence(null);
            setFormData({
                name: '',
                type: 'safe',
                latitude: '',
                longitude: '',
                radius: 100,
                active: true,
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingGeofence(null);
    };

    const handleSubmit = async () => {
        try {
            setError(null);
            const payload = {
                name: formData.name,
                type: formData.type,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                radius: parseInt(formData.radius),
                active: formData.active,
            };

            if (useDemoData) {
                // Handle demo mode CRUD
                if (editingGeofence) {
                    setGeofences(prev => prev.map(g => g.id === editingGeofence.id ? { ...g, ...payload } : g));
                } else {
                    setGeofences(prev => [...prev, { id: generateId(), ...payload }]);
                }
                handleCloseDialog();
                return;
            }

            if (editingGeofence) {
                await adminApi.updateGeofence(editingGeofence.id, payload);
            } else {
                await adminApi.createGeofence(payload);
            }
            handleCloseDialog();
            fetchGeofences();
        } catch (err) {
            console.warn('Demo mode - updating locally:', err.message);
            if (editingGeofence) {
                setGeofences(prev => prev.map(g => g.id === editingGeofence.id ? { ...g, ...formData } : g));
            } else {
                setGeofences(prev => [...prev, { id: generateId(), ...formData }]);
            }
            handleCloseDialog();
        }
    };

    const handleDelete = async (geofenceId) => {
        if (!window.confirm('Are you sure you want to delete this geofence?')) return;
        
        try {
            setError(null);
            if (useDemoData) {
                setGeofences(prev => prev.filter(g => g.id !== geofenceId));
                return;
            }
            await adminApi.deleteGeofence(geofenceId);
            fetchGeofences();
        } catch (err) {
            console.warn('Demo mode - deleting locally:', err.message);
            setGeofences(prev => prev.filter(g => g.id !== geofenceId));
        }
    };

    const handleToggleActive = async (geofence) => {
        try {
            setError(null);
            if (useDemoData) {
                setGeofences(prev => prev.map(g => g.id === geofence.id ? { ...g, active: !g.active } : g));
                return;
            }
            await adminApi.updateGeofence(geofence.id, { active: !geofence.active });
            fetchGeofences();
        } catch (err) {
            console.warn('Demo mode - toggling locally:', err.message);
            setGeofences(prev => prev.map(g => g.id === geofence.id ? { ...g, active: !g.active } : g));
        }
    };

    const safeGeofences = geofences.filter(g => g.type === 'safe');
    const dangerGeofences = geofences.filter(g => g.type === 'danger');

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
                    <GpsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Geofencing
                    </Typography>
                    {useDemoData && (
                        <Chip 
                            label="Demo Data" 
                            color="warning" 
                            size="small"
                        />
                    )}
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchGeofences}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Add Geofence
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <SafeIcon sx={{ color: 'success.main' }} />
                                <Typography variant="h6">Safe Zones</Typography>
                                <Chip label={safeGeofences.length} size="small" />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                Safe zones trigger notifications when users enter or leave. Displayed as green circles.
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <DangerIcon sx={{ color: 'error.main' }} />
                                <Typography variant="h6">Danger Zones</Typography>
                                <Chip label={dangerGeofences.length} size="small" color="error" />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                Danger zones trigger alerts when users enter. Displayed as red circles.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    {geofences.length === 0 ? (
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 6 }}>
                                <GpsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">
                                    No Geofences Created
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Create safe or danger zones to monitor user movements.
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleOpenDialog()}
                                >
                                    Create First Geofence
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent>
                                <List>
                                    {geofences.map((geofence, index) => (
                                        <React.Fragment key={geofence.id}>
                                            <ListItem
                                                sx={{
                                                    bgcolor: geofence.active ? 'transparent' : 'action.disabledBackground',
                                                    borderRadius: 1,
                                                    mb: 1,
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar sx={{ 
                                                        bgcolor: geofence.type === 'safe' ? 'success.main' : 'error.main',
                                                        opacity: geofence.active ? 1 : 0.5
                                                    }}>
                                                        {geofence.type === 'safe' ? <SafeIcon /> : <DangerIcon />}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Typography 
                                                                variant="body1" 
                                                                sx={{ 
                                                                    fontWeight: 600,
                                                                    opacity: geofence.active ? 1 : 0.5
                                                                }}
                                                            >
                                                                {geofence.name}
                                                            </Typography>
                                                            <Chip
                                                                size="small"
                                                                label={geofence.type === 'safe' ? 'Safe' : 'Danger'}
                                                                sx={{
                                                                    bgcolor: geofence.type === 'safe' ? 'success.main' : 'error.main',
                                                                    color: 'white',
                                                                    fontSize: '0.7rem',
                                                                    height: 20,
                                                                }}
                                                            />
                                                            {!geofence.active && (
                                                                <Chip
                                                                    size="small"
                                                                    label="Inactive"
                                                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                                                />
                                                            )}
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box sx={{ mt: 0.5 }}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                <LocationIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
                                                                {geofence.latitude?.toFixed(6)}, {geofence.longitude?.toFixed(6)}
                                                            </Typography>
                                                            <Typography variant="caption" display="block" color="text.secondary">
                                                                <CircleIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
                                                                Radius: {geofence.radius}m
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={geofence.active}
                                                                onChange={() => handleToggleActive(geofence)}
                                                                size="small"
                                                            />
                                                        }
                                                        label=""
                                                    />
                                                    <IconButton size="small" onClick={() => handleOpenDialog(geofence)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton size="small" color="error" onClick={() => handleDelete(geofence.id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            </ListItem>
                                            {index < geofences.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    )}
                </Grid>
            </Grid>

            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingGeofence ? 'Edit Geofence' : 'Create New Geofence'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Home, Office, School"
                        />

                        <FormControl fullWidth>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={formData.type}
                                label="Type"
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <MenuItem value="safe">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <SafeIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                        Safe Zone
                                    </Box>
                                </MenuItem>
                                <MenuItem value="danger">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <DangerIcon sx={{ color: 'error.main', fontSize: 20 }} />
                                        Danger Zone
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Latitude"
                                    type="number"
                                    value={formData.latitude}
                                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                    placeholder="e.g., 28.6139"
                                    inputProps={{ step: 'any' }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Longitude"
                                    type="number"
                                    value={formData.longitude}
                                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                    placeholder="e.g., 77.2090"
                                    inputProps={{ step: 'any' }}
                                />
                            </Grid>
                        </Grid>

                        <TextField
                            fullWidth
                            label="Radius (meters)"
                            type="number"
                            value={formData.radius}
                            onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                            placeholder="e.g., 100"
                            helperText="The radius of the geofence in meters"
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                />
                            }
                            label="Active"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSubmit}
                        disabled={!formData.name || !formData.latitude || !formData.longitude}
                    >
                        {editingGeofence ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Geofencing;

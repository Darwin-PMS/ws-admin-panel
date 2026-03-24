import React, { useEffect, useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    Chip,
    IconButton,
    Avatar,
    Alert,
    AlertTitle,
    Divider,
    Skeleton,
    Snackbar,
    CircularProgress,
    DialogActions,
} from '@mui/material';
import {
    Close as CloseIcon,
    Warning as WarningIcon,
    EmergencyShare as EmergencyIcon,
    LocationOn as LocationIcon,
    AccessTime as TimeIcon,
    Phone as PhoneIcon,
    Navigation as NavigationIcon,
    LocalPolice as PoliceIcon,
    LocalHospital as HospitalIcon,
    Security as SecurityIcon,
    FamilyRestroom as FamilyIcon,
    Send as SendIcon,
    CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { notificationService } from '../../services/realtime';
import { adminApi } from '../../services/api';

const playSOSAlertSound = () => {
    notificationService.playSOSSound();
};

const SOSAlertHandler = ({ open, sosUser, emergencyServices, onClose, onCenterUser }) => {
    const [soundEnabled, setSoundEnabled] = useState(notificationService.isSoundEnabled());
    const [loading, setLoading] = useState({ family: false, admin: false, emergency: null });
    const [notifications, setNotifications] = useState({ family: false, admin: false, emergency: [] });
    const soundPlayedRef = useRef(false);

    useEffect(() => {
        setSoundEnabled(notificationService.isSoundEnabled());
    }, []);

    useEffect(() => {
        if (open && sosUser && soundEnabled && !soundPlayedRef.current) {
            playSOSAlertSound();
            soundPlayedRef.current = true;

            const interval = setInterval(() => {
                playSOSAlertSound();
            }, 10000);

            return () => clearInterval(interval);
        }

        if (!open) {
            soundPlayedRef.current = false;
            setNotifications({ family: false, admin: false, emergency: [] });
        }
    }, [open, sosUser, soundEnabled]);

    if (!sosUser) return null;

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return 'Unknown';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

        return date.toLocaleString();
    };

    const getEmergencyServiceIcon = (type) => {
        switch (type) {
            case 'police':
                return <PoliceIcon sx={{ color: '#1976d2' }} />;
            case 'hospital':
                return <HospitalIcon sx={{ color: '#d32f2f' }} />;
            case 'safe_zone':
                return <SecurityIcon sx={{ color: '#388e3c' }} />;
            default:
                return <LocationIcon />;
        }
    };

    const handleNotifyFamily = async () => {
        if (!sosUser.family_id) {
            alert('No family associated with this user');
            return;
        }
        
        setLoading(prev => ({ ...prev, family: true }));
        try {
            const response = await adminApi.families.notify(sosUser.family_id, {
                alertId: sosUser.id,
                message: `Emergency alert for ${sosUser.name}. Location: ${sosUser.latitude}, ${sosUser.longitude}`
            });
            
            if (response.data.success) {
                setNotifications(prev => ({ ...prev, family: true }));
                notificationService.notify('Family Notified', {
                    body: `Notifications sent to ${response.data.notifications?.length || 0} family members`,
                    tag: 'family-notified'
                });
            }
        } catch (error) {
            console.error('Error notifying family:', error);
            alert('Failed to notify family members');
        } finally {
            setLoading(prev => ({ ...prev, family: false }));
        }
    };

    const handleNotifyAdmin = async () => {
        setLoading(prev => ({ ...prev, admin: true }));
        try {
            const response = await adminApi.sosAlerts.notify(sosUser.id, {
                contactType: 'admin',
                message: `Admin notified about SOS from ${sosUser.name}`
            });
            
            if (response.data.success) {
                setNotifications(prev => ({ ...prev, admin: true }));
                notificationService.notify('Admin Notified', {
                    body: 'All administrators have been alerted',
                    tag: 'admin-notified'
                });
            }
        } catch (error) {
            console.error('Error notifying admin:', error);
            alert('Failed to notify administrators');
        } finally {
            setLoading(prev => ({ ...prev, admin: false }));
        }
    };

    const handleContactEmergency = async (service) => {
        if (service.phone) {
            window.open(`tel:${service.phone}`);
        }
        
        setLoading(prev => ({ ...prev, emergency: service.name }));
        try {
            const response = await adminApi.sosAlerts.emergencyContact(sosUser.id, {
                serviceType: service.type,
                serviceName: service.name,
                contactNumber: service.phone || '',
                latitude: sosUser.latitude,
                longitude: sosUser.longitude
            });
            
            if (response.data.success) {
                setNotifications(prev => ({
                    ...prev,
                    emergency: [...(prev.emergency || []), service.name]
                }));
                notificationService.notify('Emergency Service Contacted', {
                    body: `${service.name} has been notified`,
                    tag: 'emergency-contacted'
                });
            }
        } catch (error) {
            console.error('Error contacting emergency service:', error);
        } finally {
            setLoading(prev => ({ ...prev, emergency: null }));
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 },
            }}
        >
            <Box sx={{ position: 'relative' }}>
                {/* Header with blinking alert */}
                <Box
                    sx={{
                        bgcolor: 'error.main',
                        color: 'white',
                        p: 3,
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <style>
                        {`
                            @keyframes pulse-red {
                                0%, 100% { opacity: 1; }
                                50% { opacity: 0.7; }
                            }
                            .pulse-animation {
                                animation: pulse-red 2s infinite;
                            }
                        `}
                    </style>
                    <Box className="pulse-animation">
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <EmergencyIcon sx={{ fontSize: 48 }} />
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                                        🚨 SOS ALERT
                                    </Typography>
                                    <Typography variant="body1">
                                        Emergency - Immediate Action Required
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    size="small"
                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                    sx={{ color: 'white' }}
                                >
                                    Sound: {soundEnabled ? 'ON' : 'OFF'}
                                </Button>
                                <IconButton onClick={onClose} sx={{ color: 'white' }}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <DialogContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        {/* User Information */}
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined" sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                                        User in Emergency
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                                        <Avatar
                                            src={sosUser.profile_photo}
                                            sx={{ width: 64, height: 64 }}
                                        >
                                            {sosUser.name?.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                                {sosUser.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {sosUser.phone}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {sosUser.email}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        <AlertTitle sx={{ fontWeight: 700 }}>Alert Details</AlertTitle>
                                        <Typography variant="body2">
                                            <strong>Type:</strong> {sosUser.type || 'Emergency'}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Message:</strong> {sosUser.message || 'User triggered SOS alert'}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Time:</strong> {formatTimeAgo(sosUser.created_at || sosUser.sos_triggered_at)}
                                        </Typography>
                                    </Alert>

                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            variant="contained"
                                            startIcon={<NavigationIcon />}
                                            onClick={() => onCenterUser(sosUser.latitude, sosUser.longitude)}
                                            fullWidth
                                        >
                                            View on Map
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<PhoneIcon />}
                                            onClick={() => window.open(`tel:${sosUser.phone}`)}
                                            fullWidth
                                        >
                                            Call
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Emergency Contacts */}
                            {sosUser.emergency_contacts && sosUser.emergency_contacts.length > 0 && (
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                                            Emergency Contacts
                                        </Typography>
                                        {sosUser.emergency_contacts.map((contact, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    py: 1,
                                                    borderBottom: index < sosUser.emergency_contacts.length - 1 ? '1px solid' : 'none',
                                                    borderColor: 'divider',
                                                }}
                                            >
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {contact.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {contact.relationship}
                                                    </Typography>
                                                </Box>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<PhoneIcon />}
                                                    onClick={() => window.open(`tel:${contact.phone}`)}
                                                >
                                                    Call
                                                </Button>
                                            </Box>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>

                        {/* Location & Emergency Services */}
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined" sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                                        Location Information
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <LocationIcon color="action" />
                                        <Typography variant="body2">
                                            {sosUser.location || `${sosUser.latitude?.toFixed(6)}, ${sosUser.longitude?.toFixed(6)}`}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Coordinates: {sosUser.latitude?.toFixed(6)}, {sosUser.longitude?.toFixed(6)}
                                    </Typography>

                                    <Button
                                        variant="outlined"
                                        startIcon={<NavigationIcon />}
                                        onClick={() => window.open(`https://www.google.com/maps?q=${sosUser.latitude},${sosUser.longitude}`)}
                                        fullWidth
                                        sx={{ mt: 2 }}
                                    >
                                        Open in Google Maps
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Nearby Emergency Services */}
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                                        Nearby Emergency Services
                                    </Typography>

                                    {emergencyServices && emergencyServices.length > 0 ? (
                                        <Grid container spacing={1}>
                                            {emergencyServices.slice(0, 6).map((service, index) => (
                                                <Grid item xs={12} key={index}>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            p: 1,
                                                            borderRadius: 1,
                                                            bgcolor: 'background.default',
                                                        }}
                                                    >
                                                        <Box sx={{ minWidth: 32 }}>
                                                            {getEmergencyServiceIcon(service.type)}
                                                        </Box>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                {service.name}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {service.type.replace('_', ' ')} • {service.distance?.toFixed(1)} km
                                                            </Typography>
                                                        </Box>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            disabled={loading.emergency !== null}
                                                            onClick={() => handleContactEmergency(service)}
                                                        >
                                                            {loading.emergency === service.name ? (
                                                                <CircularProgress size={16} />
                                                            ) : notifications.emergency.includes(service.name) ? (
                                                                <CheckIcon fontSize="small" />
                                                            ) : (
                                                                'Contact'
                                                            )}
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 3 }}>
                                            <Skeleton variant="text" />
                                            <Skeleton variant="text" />
                                            <Skeleton variant="text" />
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                                        {/* Quick Actions */}
                        <Grid item xs={12}>
                            <Card variant="outlined" sx={{ bgcolor: 'error.light', color: 'white' }}>
                                <CardContent>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                                        Quick Actions
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={4}>
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                disabled={!sosUser.family_id || loading.family || notifications.family}
                                                sx={{ bgcolor: 'white', color: 'error.main', height: 56, '&:disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e' } }}
                                                onClick={handleNotifyFamily}
                                                startIcon={loading.family ? <CircularProgress size={20} color="inherit" /> : notifications.family ? <CheckIcon /> : <FamilyIcon />}
                                            >
                                                {notifications.family ? 'Family Notified' : loading.family ? 'Notifying...' : 'Notify Family'}
                                            </Button>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                disabled={loading.admin || notifications.admin}
                                                sx={{ bgcolor: 'white', color: 'error.main', height: 56, '&:disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e' } }}
                                                onClick={handleNotifyAdmin}
                                                startIcon={loading.admin ? <CircularProgress size={20} color="inherit" /> : notifications.admin ? <CheckIcon /> : <EmergencyIcon />}
                                            >
                                                {notifications.admin ? 'Admin Notified' : loading.admin ? 'Notifying...' : 'Notify Admin'}
                                            </Button>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                sx={{ bgcolor: 'white', color: 'error.main', height: 56 }}
                                                onClick={() => window.open(`tel:100`)}
                                                startIcon={<PoliceIcon />}
                                            >
                                                Call Police (100)
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Box>
        </Dialog>
    );
};

export default SOSAlertHandler;

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
    Divider,
    TextField,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Warning as WarningIcon,
    LocationOn as LocationIcon,
    AccessTime as TimeIcon,
    CheckCircle as CheckCircleIcon,
    Phone as PhoneIcon,
    Message as MessageIcon,
    Send as SendIcon,
} from '@mui/icons-material';
import { adminApi } from '../services/api';

const statusColors = {
    active: '#ef4444',
    resolved: '#10b981',
};

const typeColors = {
    emergency: '#ef4444',
    distress: '#f59e0b',
    test: '#6366f1',
    medical: '#ec4899',
};

const SOSAlertDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [resolving, setResolving] = useState(false);
    const [notifyMessage, setNotifyMessage] = useState('');
    const [sending, setSending] = useState(false);

    const fetchAlert = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminApi.getSOSAlertById(id);
            if (response.data.success) {
                setAlert(response.data.alert);
            } else {
                setError('Alert not found');
            }
        } catch (err) {
            console.error('Error fetching alert:', err);
            setError('Failed to fetch alert details');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchAlert();
    }, [fetchAlert]);

    const handleResolve = async () => {
        try {
            setResolving(true);
            const response = await adminApi.resolveSOSAlert(id);
            if (response.data.success) {
                fetchAlert();
            }
        } catch (err) {
            console.error('Error resolving alert:', err);
            setError('Failed to resolve alert');
        } finally {
            setResolving(false);
        }
    };

    const handleSendNotification = async () => {
        if (!notifyMessage.trim()) return;
        
        try {
            setSending(true);
            const response = await adminApi.sendEmergencyNotification(id, {
                message: notifyMessage,
                type: 'admin_notification'
            });
            if (response.data.success) {
                setNotifyMessage('');
                alert('Notification sent successfully');
            }
        } catch (err) {
            console.error('Error sending notification:', err);
            setError('Failed to send notification');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error && !alert) {
        return (
            <Box>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button onClick={() => navigate('/sos-alerts')}>Back to Alerts</Button>
            </Box>
        );
    }

    const isResolved = alert?.status === 'resolved';

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/sos-alerts')}
                        startIcon={<ArrowBackIcon />}
                    >
                        Back
                    </Button>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                            p: 1.5, 
                            borderRadius: 2, 
                            bgcolor: `${typeColors[alert?.type] || '#ef4444'}20`,
                            color: typeColors[alert?.type] || '#ef4444'
                        }}>
                            <WarningIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                SOS Alert #{alert?.id || id}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {alert?.type?.charAt(0).toUpperCase() + alert?.type?.slice(1) || 'Unknown'} Alert
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<LocationIcon />}
                        onClick={() => navigate(`/tracking/live?user=${alert?.user_id}`)}
                    >
                        View Location
                    </Button>
                    {!isResolved && (
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={handleResolve}
                            disabled={resolving}
                        >
                            {resolving ? 'Resolving...' : 'Mark Resolved'}
                        </Button>
                    )}
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Alert Details</Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Status</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Chip
                                            label={isResolved ? 'Resolved' : 'Active'}
                                            sx={{
                                                bgcolor: statusColors[alert?.status] || '#ef4444',
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: '0.875rem',
                                                px: 1
                                            }}
                                        />
                                    </Box>
                                </Box>

                                <Divider />

                                <Box>
                                    <Typography variant="caption" color="text.secondary">Message</Typography>
                                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                                        {alert?.message || 'No message provided'}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary">Location</Typography>
                                    <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LocationIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                        <Typography variant="body2">
                                            {alert?.address || `${alert?.latitude}, ${alert?.longitude}` || 'Location not available'}
                                        </Typography>
                                    </Box>
                                    {alert?.latitude && alert?.longitude && (
                                        <Typography variant="caption" color="text.secondary" sx={{ ml: 3.5 }}>
                                            Lat: {alert.latitude}, Lng: {alert.longitude}
                                        </Typography>
                                    )}
                                </Box>

                                <Divider />

                                <Box>
                                    <Typography variant="caption" color="text.secondary">Created At</Typography>
                                    <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TimeIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                        <Typography variant="body2">
                                            {alert?.created_at ? new Date(alert.created_at).toLocaleString() : 'Unknown'}
                                        </Typography>
                                    </Box>
                                </Box>

                                {alert?.resolved_at && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Resolved At</Typography>
                                        <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                            <Typography variant="body2">
                                                {new Date(alert.resolved_at).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>

                    {!isResolved && (
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2 }}>Send Notification</Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        fullWidth
                                        placeholder="Type a message to send to the user..."
                                        value={notifyMessage}
                                        onChange={(e) => setNotifyMessage(e.target.value)}
                                        multiline
                                        rows={2}
                                    />
                                    <Button
                                        variant="contained"
                                        startIcon={<SendIcon />}
                                        onClick={handleSendNotification}
                                        disabled={sending || !notifyMessage.trim()}
                                        sx={{ alignSelf: 'flex-end' }}
                                    >
                                        Send
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    )}
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>User Information</Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">User ID</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {alert?.user_id || 'Unknown'}
                                    </Typography>
                                </Box>

                                <Divider />

                                <Box>
                                    <Typography variant="caption" color="text.secondary">Contact Actions</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<PhoneIcon />}
                                            onClick={() => window.open(`tel:${alert?.user_phone}`)}
                                        >
                                            Call
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<MessageIcon />}
                                            onClick={() => window.open(`sms:${alert?.user_phone}`)}
                                        >
                                            SMS
                                        </Button>
                                    </Box>
                                </Box>

                                <Divider />

                                <Box>
                                    <Typography variant="caption" color="text.secondary">Additional Info</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                                        <Typography variant="body2">
                                            <strong>Speed:</strong> {alert?.speed ? `${alert.speed} m/s` : 'N/A'}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Accuracy:</strong> {alert?.accuracy ? `${alert.accuracy}m` : 'N/A'}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Battery:</strong> {alert?.battery_level ? `${alert.battery_level}%` : 'N/A'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SOSAlertDetail;

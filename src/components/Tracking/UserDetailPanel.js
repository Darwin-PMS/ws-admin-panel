import React from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Avatar,
    Chip,
    Card,
    CardContent,
    Grid,
    Button,
    Divider,
    Skeleton,
    Tooltip,
    Alert,
} from '@mui/material';
import {
    Close as CloseIcon,
    LocationOn as LocationIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    FamilyRestroom as FamilyIcon,
    AccessTime as TimeIcon,
    Navigation as NavigationIcon,
    EmergencyShare as EmergencyIcon,
    Shield as ShieldIcon,
} from '@mui/icons-material';

const UserDetailPanel = ({ open, user, onClose, onCenterUser }) => {
    if (!user) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'sos':
                return { bg: '#ef444420', color: '#ef4444', label: 'SOS - EMERGENCY' };
            case 'danger':
                return { bg: '#f59e0b20', color: '#f59e0b', label: 'DANGER' };
            case 'safe':
                return { bg: '#10b98120', color: '#10b981', label: 'SAFE' };
            default:
                return { bg: '#6366f120', color: '#6366f1', label: 'UNKNOWN' };
        }
    };

    const statusColor = getStatusColor(user.status);

    const formatLastUpdated = (timestamp) => {
        if (!timestamp) return 'Never';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

        return date.toLocaleString();
    };

    const handleEmergencyContact = () => {
        // Trigger emergency contact notification
        console.log('Emergency contact triggered for user:', user.user_id);
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: { xs: '100%', sm: 450 }, maxWidth: '90vw' },
            }}
        >
            <Box sx={{ p: 3, position: 'relative' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Avatar
                            src={user.profile_photo}
                            sx={{ width: 64, height: 64, border: `3px solid ${statusColor.color}` }}
                        >
                            {user.name?.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {user.name}
                            </Typography>
                            <Chip
                                label={statusColor.label}
                                size="small"
                                sx={{
                                    bgcolor: statusColor.bg,
                                    color: statusColor.color,
                                    fontWeight: 700,
                                    mt: 0.5,
                                }}
                            />
                        </Box>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Status Alert for SOS */}
                {user.status === 'sos' && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            🚨 SOS ALERT ACTIVE
                        </Typography>
                        <Typography variant="caption">
                            Triggered at: {user.sos_triggered_at ? new Date(user.sos_triggered_at).toLocaleString() : 'Unknown'}
                        </Typography>
                    </Alert>
                )}

                {/* Quick Actions */}
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    <Tooltip title="Center on Map">
                        <Button
                            variant="outlined"
                            startIcon={<NavigationIcon />}
                            onClick={() => onCenterUser(user.latitude, user.longitude)}
                            fullWidth
                        >
                            Center
                        </Button>
                    </Tooltip>
                    {user.status === 'sos' && (
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<EmergencyIcon />}
                            onClick={handleEmergencyContact}
                            fullWidth
                        >
                            Alert
                        </Button>
                    )}
                </Box>

                {/* Location Info */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <LocationIcon color="action" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Current Location
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {user.address || `${user.latitude?.toFixed(6)}, ${user.longitude?.toFixed(6)}`}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <TimeIcon fontSize="small" color="action" />
                                <Typography variant="caption" color="text.secondary">
                                    {formatLastUpdated(user.last_updated)}
                                </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                                Lat: {user.latitude?.toFixed(4)}, Lng: {user.longitude?.toFixed(4)}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                            Contact Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PhoneIcon fontSize="small" color="action" />
                                    <Typography variant="body2">
                                        {user.phone || 'Not provided'}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <EmailIcon fontSize="small" color="action" />
                                    <Typography variant="body2">
                                        {user.email || 'Not provided'}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Family Information */}
                {user.family && (
                    <Card variant="outlined" sx={{ mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <FamilyIcon color="action" />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    Family
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {user.family.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {user.family.members?.length || 0} members
                            </Typography>
                        </CardContent>
                    </Card>
                )}

                {/* Emergency Contacts */}
                {user.emergency_contacts && user.emergency_contacts.length > 0 && (
                    <Card variant="outlined" sx={{ mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <EmergencyIcon color="error" />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    Emergency Contacts
                                </Typography>
                            </Box>
                            {user.emergency_contacts.map((contact, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        py: 1,
                                        borderBottom: index < user.emergency_contacts.length - 1 ? '1px solid' : 'none',
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {contact.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {contact.relationship}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2">{contact.phone}</Typography>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Safety Score / Status */}
                <Card variant="outlined">
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <ShieldIcon color={user.safety_score >= 70 ? 'success' : user.safety_score >= 40 ? 'warning' : 'error'} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Safety Status
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Current Status
                            </Typography>
                            <Chip
                                label={user.status?.toUpperCase() || 'UNKNOWN'}
                                size="small"
                                sx={{
                                    bgcolor: statusColor.bg,
                                    color: statusColor.color,
                                    fontWeight: 600,
                                }}
                            />
                        </Box>
                        {user.safety_score !== undefined && (
                            <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Safety Score
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                        {user.safety_score}/100
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Drawer>
    );
};

export default UserDetailPanel;

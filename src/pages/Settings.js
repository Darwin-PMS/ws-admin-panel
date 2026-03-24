import React, { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    TextField,
    Switch,
    FormControlLabel,
    Divider,
    Alert,
    Avatar,
    IconButton,
    CircularProgress,
} from '@mui/material';
import {
    Save as SaveIcon,
    PhotoCamera as PhotoCameraIcon,
    Security as SecurityIcon,
    Notifications as NotificationsIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings, updateSettings, setSetting, clearSaved } from '../store/slices/settingsSlice';
import { selectCurrentUser } from '../store/slices/authSlice';

const Settings = () => {
    const user = useSelector(selectCurrentUser);
    const dispatch = useDispatch();
    const { settings, loading, saved, error } = useSelector((state) => state.settings);
    const [localSettings, setLocalSettings] = useState({
        siteName: '',
        siteDescription: '',
        emailNotifications: true,
        sosAlerts: true,
        weeklyReports: false,
        language: 'en',
        theme: 'dark',
        maintenanceMode: false,
    });
    const [apiUrl, setApiUrl] = useState('');

    // Load settings from Redux store on mount
    const loadSettings = useCallback(async () => {
        await dispatch(fetchSettings());
    }, [dispatch]);

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    // Sync Redux settings to local state
    useEffect(() => {
        if (settings) {
            setLocalSettings(settings);
        }
    }, [settings]);

    const handleSave = async () => {
        await dispatch(updateSettings(localSettings));
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Configure system preferences and options
                    </Typography>
                </Box>
            </Box>

            {saved && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Settings saved successfully!
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Profile Settings */}
                <Grid item xs={12} lg={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                Profile Settings
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Avatar
                                        sx={{
                                            width: 100,
                                            height: 100,
                                            bgcolor: 'primary.main',
                                            fontSize: 36,
                                        }}
                                    >
                                        {user?.email?.charAt(0).toUpperCase() || 'A'}
                                    </Avatar>
                                    <IconButton
                                        sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            right: 0,
                                            bgcolor: 'background.paper',
                                            '&:hover': { bgcolor: 'background.default' },
                                        }}
                                        size="small"
                                    >
                                        <PhotoCameraIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <Box>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {user?.name || 'Admin User'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {user?.email || 'Loading...'}
                                    </Typography>
                                </Box>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        defaultValue={user?.firstName || ''}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        defaultValue={user?.lastName || ''}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        value={user?.email || ''}
                                        disabled
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* General Settings */}
                <Grid item xs={12} lg={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                General Settings
                            </Typography>

                            <TextField
                                fullWidth
                                label="Site Name"
                                value={localSettings.siteName}
                                onChange={(e) => setLocalSettings({ ...localSettings, siteName: e.target.value })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Site Description"
                                value={localSettings.siteDescription}
                                onChange={(e) => setLocalSettings({ ...localSettings, siteDescription: e.target.value })}
                                multiline
                                rows={2}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                select
                                label="Language"
                                value={localSettings.language}
                                onChange={(e) => setLocalSettings({ ...localSettings, language: e.target.value })}
                                SelectProps={{ native: true }}
                                sx={{ mb: 2 }}
                            >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                            </TextField>
                            <TextField
                                fullWidth
                                select
                                label="Theme"
                                value={localSettings.theme}
                                onChange={(e) => setLocalSettings({ ...localSettings, theme: e.target.value })}
                                SelectProps={{ native: true }}
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="system">System</option>
                            </TextField>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Notification Settings */}
                <Grid item xs={12} lg={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Notification Settings
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={localSettings.emailNotifications}
                                            onChange={(e) => setLocalSettings({ ...localSettings, emailNotifications: e.target.checked })}
                                        />
                                    }
                                    label="Email Notifications"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={localSettings.sosAlerts}
                                            onChange={(e) => setLocalSettings({ ...localSettings, sosAlerts: e.target.checked })}
                                        />
                                    }
                                    label="SOS Alerts"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={localSettings.weeklyReports}
                                            onChange={(e) => setLocalSettings({ ...localSettings, weeklyReports: e.target.checked })}
                                        />
                                    }
                                    label="Weekly Reports"
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* System Settings */}
                <Grid item xs={12} lg={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                System Settings
                            </Typography>

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.maintenanceMode}
                                        onChange={(e) => setLocalSettings({ ...localSettings, maintenanceMode: e.target.checked })}
                                    />
                                }
                                label="Maintenance Mode"
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                                When enabled, users will see a maintenance message
                            </Typography>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                API Configuration
                            </Typography>
                            <TextField
                                fullWidth
                                label="API Base URL"
                                placeholder="Enter API Base URL"
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="API Key"
                                type="password"
                                placeholder="Enter API Key"
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* API Configuration */}
                <Grid item xs={12} lg={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                API Configuration
                            </Typography>
                            <TextField
                                fullWidth
                                label="API Base URL"
                                value={apiUrl}
                                onChange={(e) => setApiUrl(e.target.value)}
                                sx={{ mb: 2 }}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Current API Status: {loading ? 'Connecting...' : 'Connected'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Save Button */}
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadSettings}>
                            Load Settings
                        </Button>
                        <Button variant="outlined">Cancel</Button>
                        <Button
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Settings;

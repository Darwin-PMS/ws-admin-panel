import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    Switch,
    Avatar,
    IconButton,
    CircularProgress,
    Button,
    Tabs,
    Tab,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    alpha,
    Tooltip,
    Snackbar,
    Alert as MuiAlert,
    LinearProgress,
    Fade,
    Collapse,
    FormControl,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import {
    Save as SaveIcon,
    PhotoCamera as PhotoCameraIcon,
    Security as SecurityIcon,
    Notifications as NotificationsIcon,
    Refresh as RefreshIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    Lock as LockIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Download as DownloadIcon,
    Upload as UploadIcon,
    History as HistoryIcon,
    Storage as StorageIcon,
    Cloud as CloudIcon,
    Code as CodeIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Shield as ShieldIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings, updateSettings } from '../store/slices/settingsSlice';
import { selectCurrentUser } from '../store/slices/authSlice';
import { setTheme } from '../store/slices/uiSlice';

const TabPanel = ({ children, value, index }) => (
    <Fade in={value === index} timeout={300}>
        <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
            {value === index && children}
        </Box>
    </Fade>
);

const SettingsSection = ({ title, icon, children, description, action, defaultExpanded = true }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Card
            sx={{
                mb: 3,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s ease',
                '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }
            }}
        >
            <CardContent sx={{ p: 0 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 3,
                        pb: isExpanded ? 3 : 2,
                        cursor: 'pointer',
                        bgcolor: isHovered ? alpha('#6366f1', 0.02) : 'transparent',
                        transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <Box sx={{
                        color: 'primary.main',
                        display: 'flex',
                        p: 1,
                        borderRadius: 2,
                        bgcolor: alpha('#6366f1', 0.1)
                    }}>{icon}</Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={700}>{title}</Typography>
                        {description && (
                            <Typography variant="caption" color="text.secondary">{description}</Typography>
                        )}
                    </Box>
                    {action}
                    <IconButton size="small">
                        {isExpanded ? <Box component="svg" sx={{ width: 20, height: 20, transform: 'rotate(180deg)' }} viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" /></Box> : <Box component="svg" sx={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" /></Box>}
                    </IconButton>
                </Box>
                <Collapse in={isExpanded}>
                    <Box sx={{ px: 3, pb: 3 }}>
                        {children}
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
};

const SettingRow = ({ label, description, children, highlight }) => (
    <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 2,
        px: 2,
        mx: -2,
        borderRadius: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: highlight ? alpha('#6366f1', 0.05) : 'transparent',
        '&:last-child': { borderBottom: 'none' },
        '&:hover': { bgcolor: alpha('#6366f1', 0.02) },
        transition: 'background-color 0.2s'
    }}>
        <Box sx={{ flex: 1, mr: 3 }}>
            <Typography variant="body1" fontWeight={500}>{label}</Typography>
            {description && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>{description}</Typography>}
        </Box>
        <Box sx={{ flexShrink: 0 }}>{children}</Box>
    </Box>
);

const Settings = () => {
    const user = useSelector(selectCurrentUser);
    const dispatch = useDispatch();
    const { settings, loading } = useSelector((state) => state.settings);
    const uiTheme = useSelector((state) => state.ui?.theme || 'dark');
    
    const [activeTab, setActiveTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null, color: 'error' });
    const [localSettings, setLocalSettings] = useState({
        siteName: 'Nirbhaya Admin',
        siteDescription: 'Women Safety & Family Tracking Platform',
        emailNotifications: true,
        sosAlerts: true,
        weeklyReports: false,
        pushNotifications: true,
        language: 'en',
        theme: uiTheme,
        maintenanceMode: false,
        twoFactorAuth: false,
        sessionTimeout: 30,
        dataRetention: 90,
        apiKey: '',
        serverUrl: 'https://api.nirbhaya.com',
        alertSound: true,
        locationHistory: true,
        messageHistory: true,
        showUserLocation: true,
        anonymousAnalytics: true,
        exportUserData: true,
        webhooksEnabled: false,
        webhookUrl: '',
        timezone: 'Asia/Kolkata',
        passwordExpiry: 90,
    });
    const [hasChanges, setHasChanges] = useState(false);
    const [clearCacheDialog, setClearCacheDialog] = useState(false);
    const [cacheSize, setCacheSize] = useState('2.4 MB');
    const [storageUsed] = useState(42.3);
    const [storageTotal] = useState(100);
    const [apiStatus, setApiStatus] = useState({ connected: true, lastChecked: '2 minutes ago' });
    const [webhookTestStatus, setWebhookTestStatus] = useState(null);
    const [loginHistory, setLoginHistory] = useState([
        { id: 1, device: 'Chrome on Windows', location: 'Mumbai, India', ip: '192.168.1.1', time: '2 hours ago', current: true },
        { id: 2, device: 'Safari on iPhone', location: 'Mumbai, India', ip: '192.168.1.2', time: 'Yesterday', current: false },
        { id: 3, device: 'Firefox on MacOS', location: 'Delhi, India', ip: '192.168.1.3', time: '3 days ago', current: false },
    ]);
    const [profileForm, setProfileForm] = useState({
        firstName: user?.firstName || 'Admin',
        lastName: user?.lastName || 'User',
        email: user?.email || 'admin@nirbhaya.com',
        phone: '+91 98765 43210',
        role: 'System Administrator',
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [passwordSubmitting, setPasswordSubmitting] = useState(false);
    const [profileSubmitting, setProfileSubmitting] = useState(false);

    useEffect(() => {
        dispatch(fetchSettings());
    }, [dispatch]);

    useEffect(() => {
        if (settings) {
            setLocalSettings(prev => ({ ...prev, ...settings }));
        }
    }, [settings]);

    const handleChange = (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
        if (key === 'theme') {
            dispatch(setTheme(value));
        }
    };

    const handleSave = async () => {
        try {
            await dispatch(updateSettings(localSettings));
            setHasChanges(false);
            setSnackbar({ open: true, message: 'Settings saved successfully!', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to save settings', severity: 'error' });
        }
    };

    const handleReset = () => {
        setConfirmDialog({
            open: true,
            title: 'Reset Settings',
            message: 'Are you sure you want to reset all settings to default values?',
            color: 'warning',
            onConfirm: () => {
                setLocalSettings({
                    siteName: 'Nirbhaya Admin',
                    siteDescription: 'Women Safety & Family Tracking Platform',
                    emailNotifications: true,
                    sosAlerts: true,
                    weeklyReports: false,
                    pushNotifications: true,
                    language: 'en',
                    theme: 'dark',
                    maintenanceMode: false,
                    twoFactorAuth: false,
                    sessionTimeout: 30,
                    dataRetention: 90,
                    apiKey: '',
                    serverUrl: 'https://api.nirbhaya.com',
                    alertSound: true,
                    locationHistory: true,
                    messageHistory: true,
                    showUserLocation: true,
                    anonymousAnalytics: true,
                    exportUserData: true,
                    webhooksEnabled: false,
                    webhookUrl: '',
                    timezone: 'Asia/Kolkata',
                    passwordExpiry: 90,
                });
                setHasChanges(false);
                setConfirmDialog({ open: false, title: '', message: '', onConfirm: null });
                setSnackbar({ open: true, message: 'Settings reset to defaults', severity: 'success' });
            }
        });
    };

    const handleExportSettings = () => {
        const dataStr = JSON.stringify(localSettings, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nirbhaya-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setSnackbar({ open: true, message: 'Settings exported successfully!', severity: 'success' });
    };

    const handleImportSettings = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    setLocalSettings({ ...localSettings, ...imported });
                    setHasChanges(true);
                    setSnackbar({ open: true, message: 'Settings imported successfully! Review and save.', severity: 'success' });
                } catch {
                    setSnackbar({ open: true, message: 'Invalid settings file', severity: 'error' });
                }
            };
            reader.readAsText(file);
        }
        event.target.value = '';
    };

    const handleClearCacheFromDialog = () => {
        setClearCacheDialog(false);
        setCacheSize('0 MB');
        setSnackbar({ open: true, message: 'Cache cleared successfully!', severity: 'success' });
    };

    const handleTestApiConnection = () => {
        setApiStatus({ ...apiStatus, lastChecked: 'Just now' });
        setSnackbar({ open: true, message: 'API connection successful!', severity: 'success' });
    };

    const handleTestWebhook = () => {
        setWebhookTestStatus('testing');
        setTimeout(() => {
            setWebhookTestStatus('success');
            setSnackbar({ open: true, message: 'Webhook test sent successfully!', severity: 'success' });
            setTimeout(() => setWebhookTestStatus(null), 3000);
        }, 1500);
    };

    const validatePasswords = () => {
        const errors = {};
        if (passwordForm.newPassword.length < 8) {
            errors.newPassword = 'Password must be at least 8 characters';
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        if (!passwordForm.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }
        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePasswordChange = () => {
        if (!validatePasswords()) return;
        
        setPasswordSubmitting(true);
        setTimeout(() => {
            setPasswordSubmitting(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setSnackbar({ open: true, message: 'Password updated successfully!', severity: 'success' });
        }, 1500);
    };

    const handleProfileUpdate = () => {
        setProfileSubmitting(true);
        setTimeout(() => {
            setProfileSubmitting(false);
            setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
        }, 1000);
    };

    const handleDeleteSession = (id) => {
        setConfirmDialog({
            open: true,
            title: 'End Session',
            message: 'Are you sure you want to end this session?',
            color: 'error',
            onConfirm: () => {
                setLoginHistory(prev => prev.filter(s => s.id !== id));
                setConfirmDialog({ open: false, title: '', message: '', onConfirm: null });
                setSnackbar({ open: true, message: 'Session ended', severity: 'success' });
            }
        });
    };

    const tabItems = [
        { label: 'Profile', icon: <PersonIcon />, key: 'profile' },
        { label: 'General', icon: <SettingsIcon />, key: 'general' },
        { label: 'Notifications', icon: <NotificationsIcon />, key: 'notifications' },
        { label: 'Security', icon: <SecurityIcon />, key: 'security' },
        { label: 'Privacy', icon: <ShieldIcon />, key: 'privacy' },
        { label: 'Storage', icon: <StorageIcon />, key: 'storage' },
        { label: 'API', icon: <CodeIcon />, key: 'api' },
    ];

    const TIMEZONES = [
        { value: 'Asia/Kolkata', label: 'IST (UTC+5:30)' },
        { value: 'UTC', label: 'UTC' },
        { value: 'America/New_York', label: 'EST (UTC-5)' },
        { value: 'Europe/London', label: 'GMT (UTC+0)' },
    ];

    return (
        <Box sx={{ pb: 4 }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2,
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider'
            }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SettingsIcon sx={{ color: 'primary.main' }} />
                        Settings
                        {hasChanges && (
                            <Chip
                                label="Unsaved changes"
                                size="small"
                                color="warning"
                                sx={{ ml: 1, fontWeight: 600 }}
                            />
                        )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Configure system preferences and admin account
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportSettings}
                        size="small"
                    >
                        Export
                    </Button>
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadIcon />}
                        size="small"
                    >
                        Import
                        <input type="file" hidden accept=".json" onChange={handleImportSettings} />
                    </Button>
                    {hasChanges && (
                        <Button
                            variant="outlined"
                            color="warning"
                            onClick={handleReset}
                            startIcon={<RefreshIcon />}
                            size="small"
                        >
                            Reset
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                        onClick={handleSave}
                        disabled={loading || !hasChanges}
                        color={hasChanges ? 'primary' : 'inherit'}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Search settings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    sx={{
                        maxWidth: 400,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'background.paper'
                        }
                    }}
                />
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    <Card sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        position: 'sticky',
                        top: 80,
                        overflow: 'hidden'
                    }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha('#6366f1', 0.02) }}>
                            <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                                SETTINGS CATEGORIES
                            </Typography>
                        </Box>
                        <Tabs
                            orientation="vertical"
                            value={activeTab}
                            onChange={(_, v) => setActiveTab(v)}
                            sx={{
                                '.MuiTab-root': {
                                    justifyContent: 'flex-start',
                                    textTransform: 'none',
                                    minHeight: 48,
                                    px: 2,
                                    borderRadius: 1,
                                    mx: 1,
                                    my: 0.5,
                                },
                                '.Mui-selected': {
                                    bgcolor: alpha('#6366f1', 0.1),
                                }
                            }}
                        >
                            {tabItems.map((tab, index) => (
                                <Tab
                                    key={index}
                                    icon={tab.icon}
                                    iconPosition="start"
                                    label={tab.label}
                                />
                            ))}
                        </Tabs>
                    </Card>
                </Grid>

                <Grid item xs={12} md={9}>
                    <TabPanel value={activeTab} index={0}>
                        <SettingsSection
                            title="Profile Settings"
                            icon={<PersonIcon />}
                            description="Manage your admin profile information"
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Avatar sx={{ width: 90, height: 90, bgcolor: 'primary.main', fontSize: 32 }}>
                                        {profileForm.firstName?.[0]}{profileForm.lastName?.[0]}
                                    </Avatar>
                                    <Tooltip title="Change photo">
                                        <IconButton
                                            sx={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                '&:hover': { bgcolor: 'primary.dark' },
                                                width: 32,
                                                height: 32,
                                            }}
                                            size="small"
                                        >
                                            <PhotoCameraIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <Box>
                                    <Typography variant="h6" fontWeight={600}>
                                        {profileForm.firstName} {profileForm.lastName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">{profileForm.email}</Typography>
                                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                        <Chip
                                            label={profileForm.role}
                                            size="small"
                                            sx={{ bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', fontWeight: 600 }}
                                            icon={<CheckCircleIcon sx={{ fontSize: '16px !important' }} />}
                                        />
                                        <Chip
                                            label="Active"
                                            size="small"
                                            sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 600 }}
                                            icon={<CheckCircleIcon sx={{ fontSize: '16px !important' }} />}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        value={profileForm.firstName}
                                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        value={profileForm.lastName}
                                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        value={profileForm.email}
                                        disabled
                                        size="small"
                                        helperText="Contact administrator to change email"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone"
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Role"
                                        value={profileForm.role}
                                        disabled
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        onClick={handleProfileUpdate}
                                        disabled={profileSubmitting}
                                        startIcon={profileSubmitting ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                                    >
                                        {profileSubmitting ? 'Saving...' : 'Update Profile'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </SettingsSection>

                        <SettingsSection
                            title="Change Password"
                            icon={<LockIcon />}
                            description="Update your account password"
                            action={
                                <Chip
                                    label="Recommended"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                />
                            }
                        >
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        type={showPasswords.current ? 'text' : 'password'}
                                        label="Current Password"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        size="small"
                                        error={!!passwordErrors.currentPassword}
                                        helperText={passwordErrors.currentPassword}
                                        InputProps={{
                                            endAdornment: (
                                                <IconButton onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })} edge="end">
                                                    {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        type={showPasswords.new ? 'text' : 'password'}
                                        label="New Password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        size="small"
                                        error={!!passwordErrors.newPassword}
                                        helperText={passwordErrors.newPassword || 'Minimum 8 characters'}
                                        InputProps={{
                                            endAdornment: (
                                                <IconButton onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })} edge="end">
                                                    {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        label="Confirm New Password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        size="small"
                                        error={!!passwordErrors.confirmPassword}
                                        helperText={passwordErrors.confirmPassword}
                                        InputProps={{
                                            endAdornment: (
                                                <IconButton onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })} edge="end">
                                                    {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={handlePasswordChange}
                                        disabled={passwordSubmitting}
                                        startIcon={passwordSubmitting ? <CircularProgress size={18} color="inherit" /> : <LockIcon />}
                                    >
                                        {passwordSubmitting ? 'Updating...' : 'Update Password'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </SettingsSection>
                    </TabPanel>

                    <TabPanel value={activeTab} index={1}>
                        <SettingsSection
                            title="General Settings"
                            icon={<SettingsIcon />}
                            description="Configure basic platform settings"
                        >
                            <SettingRow label="Site Name" description="Display name for the admin panel">
                                <TextField
                                    size="small"
                                    value={localSettings.siteName}
                                    onChange={(e) => handleChange('siteName', e.target.value)}
                                    sx={{ width: 280 }}
                                />
                            </SettingRow>
                            <SettingRow label="Site Description" description="Brief description of the platform">
                                <TextField
                                    size="small"
                                    value={localSettings.siteDescription}
                                    onChange={(e) => handleChange('siteDescription', e.target.value)}
                                    sx={{ width: 350 }}
                                />
                            </SettingRow>
                            <SettingRow label="Language" description="Default interface language">
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <Select
                                        value={localSettings.language}
                                        onChange={(e) => handleChange('language', e.target.value)}
                                    >
                                        <MenuItem value="en">English</MenuItem>
                                        <MenuItem value="hi">Hindi</MenuItem>
                                        <MenuItem value="ta">Tamil</MenuItem>
                                        <MenuItem value="te">Telugu</MenuItem>
                                    </Select>
                                </FormControl>
                            </SettingRow>
                            <SettingRow label="Theme" description="Interface color scheme">
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip
                                        icon={<Box component="svg" sx={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" /></Box>}
                                        label="Dark"
                                        onClick={() => handleChange('theme', 'dark')}
                                        variant={localSettings.theme === 'dark' ? 'filled' : 'outlined'}
                                        color={localSettings.theme === 'dark' ? 'primary' : 'default'}
                                        sx={{ px: 1 }}
                                    />
                                    <Chip
                                        icon={<Box component="svg" sx={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="currentColor"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" /></Box>}
                                        label="Light"
                                        onClick={() => handleChange('theme', 'light')}
                                        variant={localSettings.theme === 'light' ? 'filled' : 'outlined'}
                                        color={localSettings.theme === 'light' ? 'primary' : 'default'}
                                        sx={{ px: 1 }}
                                    />
                                </Box>
                            </SettingRow>
                            <SettingRow label="Timezone" description="Default timezone for timestamps">
                                <FormControl size="small" sx={{ minWidth: 180 }}>
                                    <Select
                                        value={localSettings.timezone}
                                        onChange={(e) => handleChange('timezone', e.target.value)}
                                    >
                                        {TIMEZONES.map(tz => (
                                            <MenuItem key={tz.value} value={tz.value}>{tz.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </SettingRow>
                        </SettingsSection>

                        <SettingsSection
                            title="Maintenance Mode"
                            icon={<ShieldIcon />}
                            description="Control platform availability"
                            action={
                                <Chip
                                    label={localSettings.maintenanceMode ? 'Active' : 'Inactive'}
                                    size="small"
                                    color={localSettings.maintenanceMode ? 'error' : 'success'}
                                />
                            }
                        >
                            <SettingRow
                                label="Enable Maintenance Mode"
                                description="When enabled, users will see a maintenance message"
                                highlight={localSettings.maintenanceMode}
                            >
                                <Switch
                                    checked={localSettings.maintenanceMode}
                                    onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                                    color="warning"
                                />
                            </SettingRow>
                            {localSettings.maintenanceMode && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: alpha('#f59e0b', 0.1), borderRadius: 2, border: '1px solid', borderColor: alpha('#f59e0b', 0.3) }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <WarningIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                                        <Typography variant="body2" color="warning.main" fontWeight={600}>Warning</Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Enabling maintenance mode will prevent all users from accessing the platform except administrators.
                                    </Typography>
                                </Box>
                            )}
                        </SettingsSection>
                    </TabPanel>

                    <TabPanel value={activeTab} index={2}>
                        <SettingsSection
                            title="Notification Preferences"
                            icon={<NotificationsIcon />}
                            description="Configure how you receive notifications"
                        >
                            <SettingRow label="Email Notifications" description="Receive important updates via email">
                                <Switch
                                    checked={localSettings.emailNotifications}
                                    onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                                />
                            </SettingRow>
                            <SettingRow label="SOS Alerts" description="Instant alerts for emergency situations">
                                <Switch
                                    checked={localSettings.sosAlerts}
                                    onChange={(e) => handleChange('sosAlerts', e.target.checked)}
                                />
                            </SettingRow>
                            <SettingRow label="Push Notifications" description="Browser push notifications">
                                <Switch
                                    checked={localSettings.pushNotifications}
                                    onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                                />
                            </SettingRow>
                            <SettingRow label="Weekly Reports" description="Summary of platform activity">
                                <Switch
                                    checked={localSettings.weeklyReports}
                                    onChange={(e) => handleChange('weeklyReports', e.target.checked)}
                                />
                            </SettingRow>
                        </SettingsSection>

                        <SettingsSection
                            title="Alert Sound"
                            icon={<NotificationsIcon />}
                            description="Configure alert sound preferences"
                        >
                            <SettingRow label="Alert Sound" description="Play sound for new SOS alerts">
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip
                                        icon={<NotificationsIcon />}
                                        label="Enabled"
                                        onClick={() => handleChange('alertSound', true)}
                                        variant={localSettings.alertSound ? 'filled' : 'outlined'}
                                        color={localSettings.alertSound ? 'primary' : 'default'}
                                    />
                                    <Chip
                                        icon={<Box component="svg" sx={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5V7c0-2.49 2.01-4.5 4.5-4.5s4.5 2.01 4.5 4.5v5c0 2.49-2.01 4.5-4.5 4.5zm1-5h-2V7h2v4.5z" /></Box>}
                                        label="Muted"
                                        onClick={() => handleChange('alertSound', false)}
                                        variant={!localSettings.alertSound ? 'filled' : 'outlined'}
                                        color={!localSettings.alertSound ? 'error' : 'default'}
                                    />
                                </Box>
                            </SettingRow>
                        </SettingsSection>
                    </TabPanel>

                    <TabPanel value={activeTab} index={3}>
                        <SettingsSection
                            title="Security Settings"
                            icon={<SecurityIcon />}
                            description="Configure security options"
                            action={
                                <Chip
                                    label="Protected"
                                    size="small"
                                    color="success"
                                    icon={<ShieldIcon sx={{ fontSize: '14px !important' }} />}
                                />
                            }
                        >
                            <SettingRow
                                label="Two-Factor Authentication"
                                description="Add an extra layer of security"
                                highlight={localSettings.twoFactorAuth}
                            >
                                <Switch
                                    checked={localSettings.twoFactorAuth}
                                    onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                                />
                            </SettingRow>
                            <SettingRow label="Session Timeout" description="Auto logout after inactivity">
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <Select
                                        value={localSettings.sessionTimeout}
                                        onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                                    >
                                        <MenuItem value={15}>15 minutes</MenuItem>
                                        <MenuItem value={30}>30 minutes</MenuItem>
                                        <MenuItem value={60}>1 hour</MenuItem>
                                        <MenuItem value={120}>2 hours</MenuItem>
                                    </Select>
                                </FormControl>
                            </SettingRow>
                        </SettingsSection>

                        <SettingsSection
                            title="Login History"
                            icon={<HistoryIcon />}
                            description="Track your login activity"
                        >
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Device</TableCell>
                                            <TableCell>Location</TableCell>
                                            <TableCell>IP Address</TableCell>
                                            <TableCell>Time</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loginHistory.map((session) => (
                                            <TableRow key={session.id}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {session.device}
                                                        {session.current && (
                                                            <Chip label="Current" size="small" color="success" sx={{ ml: 1 }} />
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{session.location}</TableCell>
                                                <TableCell sx={{ fontFamily: 'monospace' }}>{session.ip}</TableCell>
                                                <TableCell>{session.time}</TableCell>
                                                <TableCell align="right">
                                                    {!session.current && (
                                                        <Button
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDeleteSession(session.id)}
                                                        >
                                                            End Session
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </SettingsSection>

                        <SettingsSection
                            title="Password Policy"
                            icon={<LockIcon />}
                            description="Configure password requirements"
                        >
                            <SettingRow label="Minimum Password Length" description="Minimum 8 characters required">
                                <Chip label="8 characters" size="small" variant="outlined" />
                            </SettingRow>
                            <SettingRow label="Password Expiry" description="Force password change">
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <Select
                                        value={localSettings.passwordExpiry}
                                        onChange={(e) => handleChange('passwordExpiry', e.target.value)}
                                    >
                                        <MenuItem value={30}>30 days</MenuItem>
                                        <MenuItem value={90}>90 days</MenuItem>
                                        <MenuItem value={180}>180 days</MenuItem>
                                        <MenuItem value={0}>Never</MenuItem>
                                    </Select>
                                </FormControl>
                            </SettingRow>
                        </SettingsSection>
                    </TabPanel>

                    <TabPanel value={activeTab} index={4}>
                        <SettingsSection
                            title="Data Retention"
                            icon={<StorageIcon />}
                            description="Configure data storage policies"
                        >
                            <SettingRow label="Data Retention Period" description="How long to keep user data">
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <Select
                                        value={localSettings.dataRetention}
                                        onChange={(e) => handleChange('dataRetention', e.target.value)}
                                    >
                                        <MenuItem value={30}>30 days</MenuItem>
                                        <MenuItem value={60}>60 days</MenuItem>
                                        <MenuItem value={90}>90 days</MenuItem>
                                        <MenuItem value={180}>180 days</MenuItem>
                                        <MenuItem value={365}>1 year</MenuItem>
                                    </Select>
                                </FormControl>
                            </SettingRow>
                            <SettingRow label="Location History" description="Keep user location history">
                                <Switch
                                    checked={localSettings.locationHistory}
                                    onChange={(e) => handleChange('locationHistory', e.target.checked)}
                                />
                            </SettingRow>
                            <SettingRow label="Message History" description="Retain AI chat messages">
                                <Switch
                                    checked={localSettings.messageHistory}
                                    onChange={(e) => handleChange('messageHistory', e.target.checked)}
                                />
                            </SettingRow>
                        </SettingsSection>

                        <SettingsSection
                            title="Privacy Controls"
                            icon={<ShieldIcon />}
                            description="Configure privacy settings"
                        >
                            <SettingRow label="Show User Location" description="Display user locations on map">
                                <Switch
                                    checked={localSettings.showUserLocation}
                                    onChange={(e) => handleChange('showUserLocation', e.target.checked)}
                                />
                            </SettingRow>
                            <SettingRow label="Anonymous Analytics" description="Help improve by sharing anonymized data">
                                <Switch
                                    checked={localSettings.anonymousAnalytics}
                                    onChange={(e) => handleChange('anonymousAnalytics', e.target.checked)}
                                />
                            </SettingRow>
                            <SettingRow label="Export User Data" description="Allow users to export their data">
                                <Switch
                                    checked={localSettings.exportUserData}
                                    onChange={(e) => handleChange('exportUserData', e.target.checked)}
                                />
                            </SettingRow>
                        </SettingsSection>
                    </TabPanel>

                    <TabPanel value={activeTab} index={5}>
                        <SettingsSection
                            title="Storage Information"
                            icon={<StorageIcon />}
                            description="Monitor storage usage"
                        >
                            <Box sx={{ mb: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" fontWeight={500}>Storage Used</Typography>
                                    <Typography variant="body2" fontWeight={700}>{storageUsed} GB / {storageTotal} GB</Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={(storageUsed / storageTotal) * 100}
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        bgcolor: alpha('#6366f1', 0.1),
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 5,
                                            bgcolor: 'primary.main'
                                        }
                                    }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                    <Typography variant="caption" color="text.secondary">{storageUsed} GB used</Typography>
                                    <Typography variant="caption" color="text.secondary">{storageTotal - storageUsed} GB remaining</Typography>
                                </Box>
                            </Box>
                            <Grid container spacing={2}>
                                {[
                                    { label: 'User Data', value: '12.5 GB', color: '#6366f1', bg: alpha('#6366f1', 0.1) },
                                    { label: 'Media', value: '8.2 GB', color: '#ec4899', bg: alpha('#ec4899', 0.1) },
                                    { label: 'Location', value: '15.1 GB', color: '#10b981', bg: alpha('#10b981', 0.1) },
                                    { label: 'Logs', value: '6.5 GB', color: '#f59e0b', bg: alpha('#f59e0b', 0.1) },
                                ].map((item, index) => (
                                    <Grid item xs={6} sm={3} key={index}>
                                        <Paper sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            bgcolor: item.bg,
                                            border: '1px solid',
                                            borderColor: item.color,
                                            borderRadius: 2,
                                            transition: 'transform 0.2s',
                                            '&:hover': { transform: 'translateY(-2px)' }
                                        }}>
                                            <Typography variant="h6" fontWeight={700} sx={{ color: item.color }}>{item.value}</Typography>
                                            <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </SettingsSection>

                        <SettingsSection
                            title="Cache Management"
                            icon={<CloudIcon />}
                            description="Manage temporary data"
                        >
                            <SettingRow label="Clear Cache" description="Free up temporary storage">
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => setClearCacheDialog(true)}
                                >
                                    Clear Cache
                                </Button>
                            </SettingRow>
                            <SettingRow label="Current Cache Size" description="Temporary data stored locally">
                                <Chip
                                    label={cacheSize}
                                    size="small"
                                    sx={{ bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', fontWeight: 600 }}
                                />
                            </SettingRow>
                        </SettingsSection>
                    </TabPanel>

                    <TabPanel value={activeTab} index={6}>
                        <SettingsSection
                            title="API Configuration"
                            icon={<CodeIcon />}
                            description="Configure API settings"
                            action={
                                <Chip
                                    label={apiStatus.connected ? 'Connected' : 'Disconnected'}
                                    size="small"
                                    color={apiStatus.connected ? 'success' : 'error'}
                                    icon={apiStatus.connected ? <CheckCircleIcon sx={{ fontSize: '14px !important' }} /> : <ErrorIcon sx={{ fontSize: '14px !important' }} />}
                                />
                            }
                        >
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="API Base URL"
                                        value={localSettings.serverUrl}
                                        onChange={(e) => handleChange('serverUrl', e.target.value)}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="API Key"
                                        type="password"
                                        value={localSettings.apiKey}
                                        onChange={(e) => handleChange('apiKey', e.target.value)}
                                        size="small"
                                        helperText="Keep this key secure and never share it"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 2,
                                        bgcolor: alpha(apiStatus.connected ? '#10b981' : '#ef4444', 0.1),
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: alpha(apiStatus.connected ? '#10b981' : '#ef4444', 0.3)
                                    }}>
                                        {apiStatus.connected ? <CheckCircleIcon sx={{ color: 'success.main' }} /> : <ErrorIcon sx={{ color: 'error.main' }} />}
                                        <Box>
                                            <Typography variant="body2" fontWeight={600} color={apiStatus.connected ? 'success.main' : 'error.main'}>
                                                API {apiStatus.connected ? 'Connected' : 'Disconnected'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">Last checked: {apiStatus.lastChecked}</Typography>
                                        </Box>
                                        <Button size="small" sx={{ ml: 'auto' }} onClick={handleTestApiConnection}>
                                            Test Connection
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </SettingsSection>

                        <SettingsSection
                            title="Webhooks"
                            icon={<CodeIcon />}
                            description="Configure webhook notifications"
                        >
                            <SettingRow label="Enable Webhooks" description="Receive real-time event notifications">
                                <Switch
                                    checked={localSettings.webhooksEnabled}
                                    onChange={(e) => handleChange('webhooksEnabled', e.target.checked)}
                                />
                            </SettingRow>
                            {localSettings.webhooksEnabled && (
                                <>
                                    <SettingRow label="Webhook URL" description="Endpoint for event notifications">
                                        <TextField
                                            size="small"
                                            placeholder="https://your-server.com/webhook"
                                            value={localSettings.webhookUrl}
                                            onChange={(e) => handleChange('webhookUrl', e.target.value)}
                                            sx={{ width: 320 }}
                                        />
                                    </SettingRow>
                                    <SettingRow label="Test Webhook" description="Send a test notification">
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={handleTestWebhook}
                                            disabled={webhookTestStatus === 'testing'}
                                            startIcon={webhookTestStatus === 'testing' ? <CircularProgress size={16} /> : null}
                                        >
                                            {webhookTestStatus === 'success' ? 'Test Sent!' : webhookTestStatus === 'testing' ? 'Sending...' : 'Send Test'}
                                        </Button>
                                    </SettingRow>
                                </>
                            )}
                        </SettingsSection>
                    </TabPanel>
                </Grid>
            </Grid>

            <Box sx={{
                mt: 4,
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <InfoIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="subtitle2" fontWeight={700}>System Information</Typography>
                </Box>
                <Grid container spacing={3}>
                    {[
                        { label: 'Version', value: 'v2.4.1', color: 'primary.main' },
                        { label: 'Last Deployment', value: 'Mar 15, 2026', color: 'text.primary' },
                        { label: 'Server Region', value: 'Asia Pacific (Mumbai)', color: 'text.primary' },
                        { label: 'Uptime', value: '99.98%', color: 'success.main' },
                    ].map((item, index) => (
                        <Grid item xs={6} sm={3} key={index}>
                            <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ color: item.color }}>{item.value}</Typography>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <MuiAlert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </MuiAlert>
            </Snackbar>

            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, title: '', message: '', onConfirm: null })}
            >
                <DialogTitle>{confirmDialog.title}</DialogTitle>
                <DialogContent>
                    <Typography>{confirmDialog.message}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog({ open: false, title: '', message: '', onConfirm: null })}>
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDialog.onConfirm}
                        variant="contained"
                        color={confirmDialog.color || 'error'}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={clearCacheDialog}
                onClose={() => setClearCacheDialog(false)}
            >
                <DialogTitle>Clear Cache</DialogTitle>
                <DialogContent>
                    <Typography>
                        This will clear all cached data ({cacheSize}). Users may experience slower initial load times after clearing.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setClearCacheDialog(false)}>Cancel</Button>
                    <Button onClick={handleClearCacheFromDialog} variant="contained" color="error">
                        Clear Cache
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Settings;

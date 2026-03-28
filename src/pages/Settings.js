import React, { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    Switch,
    FormControlLabel,
    Divider,
    Alert,
    Avatar,
    IconButton,
    CircularProgress,
    Button,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    alpha,
    Tooltip,
} from '@mui/material';
import {
    Save as SaveIcon,
    PhotoCamera as PhotoCameraIcon,
    Security as SecurityIcon,
    Notifications as NotificationsIcon,
    Refresh as RefreshIcon,
    Person as PersonIcon,
    Language as LanguageIcon,
    Palette as PaletteIcon,
    Lock as LockIcon,
    Email as EmailIcon,
    NotificationsActive as ActiveIcon,
    NotificationsOff as MutedIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    Settings as SettingsIcon,
    Shield as ShieldIcon,
    Storage as StorageIcon,
    Cloud as CloudIcon,
    Code as CodeIcon,
    Info as InfoIcon,
    Check as CheckIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings, updateSettings, setSetting, clearSaved } from '../store/slices/settingsSlice';
import { selectCurrentUser } from '../store/slices/authSlice';

const TabPanel = ({ children, value, index }) => (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
        {value === index && children}
    </Box>
);

const SettingsSection = ({ title, icon, children }) => (
    <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ color: 'primary.main' }}>{icon}</Box>
                <Typography variant="h6" fontWeight={700}>{title}</Typography>
            </Box>
            {children}
        </CardContent>
    </Card>
);

const SettingRow = ({ label, description, children }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
        <Box sx={{ flex: 1, mr: 2 }}>
            <Typography variant="body1" fontWeight={500}>{label}</Typography>
            {description && <Typography variant="caption" color="text.secondary">{description}</Typography>}
        </Box>
        <Box>{children}</Box>
    </Box>
);

const Settings = () => {
    const user = useSelector(selectCurrentUser);
    const dispatch = useDispatch();
    const { settings, loading, saved, error } = useSelector((state) => state.settings);
    const [activeTab, setActiveTab] = useState(0);
    const [localSettings, setLocalSettings] = useState({
        siteName: 'Nirbhaya Admin',
        siteDescription: 'Women Safety & Family Tracking Platform',
        emailNotifications: true,
        sosAlerts: true,
        weeklyReports: false,
        pushNotifications: true,
        language: 'en',
        theme: 'dark',
        maintenanceMode: false,
        twoFactorAuth: true,
        sessionTimeout: 30,
        dataRetention: 90,
        apiKey: '',
        serverUrl: 'https://api.nirbhaya.com',
    });
    const [hasChanges, setHasChanges] = useState(false);
    const [profileDialog, setProfileDialog] = useState(false);

    const loadSettings = useCallback(async () => {
        await dispatch(fetchSettings());
    }, [dispatch]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    useEffect(() => {
        if (settings) {
            setLocalSettings(settings);
        }
    }, [settings]);

    const handleChange = (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        await dispatch(updateSettings(localSettings));
        setHasChanges(false);
    };

    const handleReset = () => {
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
            twoFactorAuth: true,
            sessionTimeout: 30,
            dataRetention: 90,
            apiKey: '',
            serverUrl: 'https://api.nirbhaya.com',
        });
        setHasChanges(false);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>Settings</Typography>
                    <Typography variant="body2" color="text.secondary">Configure system preferences and admin account</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {hasChanges && (
                        <Button variant="outlined" onClick={handleReset} startIcon={<RefreshIcon />}>
                            Reset
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                        onClick={handleSave}
                        disabled={loading || !hasChanges}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Box>
            </Box>

            {saved && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => dispatch(clearSaved())}>
                    Settings saved successfully!
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    <Card sx={{ border: '1px solid', borderColor: 'divider', position: 'sticky', top: 80 }}>
                        <Box sx={{ p: 2 }}>
                            <Tabs orientation="vertical" value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ '.MuiTab-root': { justifyContent: 'flex-start', textTransform: 'none', minHeight: 44 } }}>
                                <Tab icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Profile" />
                                <Tab icon={<SettingsIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="General" />
                                <Tab icon={<NotificationsIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Notifications" />
                                <Tab icon={<SecurityIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Security" />
                                <Tab icon={<ShieldIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Privacy" />
                                <Tab icon={<StorageIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Data" />
                                <Tab icon={<CodeIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="API" />
                            </Tabs>
                        </Box>
                    </Card>
                </Grid>

                <Grid item xs={12} md={9}>
                    <TabPanel value={activeTab} index={0}>
                        <SettingsSection title="Profile Settings" icon={<PersonIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 28 }}>A</Avatar>
                                    <Tooltip title="Change photo">
                                        <IconButton sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'background.paper', '&:hover': { bgcolor: 'background.default' } }} size="small">
                                            <PhotoCameraIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <Box>
                                    <Typography variant="h6" fontWeight={600}>{user?.name || 'Admin User'}</Typography>
                                    <Typography variant="body2" color="text.secondary">{user?.email || 'admin@nirbhaya.com'}</Typography>
                                    <Chip label="System Administrator" size="small" sx={{ mt: 1, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', fontWeight: 600 }} />
                                </Box>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="First Name" defaultValue={user?.firstName || 'Admin'} size="small" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Last Name" defaultValue={user?.lastName || 'User'} size="small" />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Email" value={user?.email || 'admin@nirbhaya.com'} disabled size="small" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Phone" defaultValue="+91 98765 43210" size="small" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Role" value="System Administrator" disabled size="small" />
                                </Grid>
                            </Grid>
                        </SettingsSection>

                        <SettingsSection title="Change Password" icon={<LockIcon />}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField fullWidth type="password" label="Current Password" size="small" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth type="password" label="New Password" size="small" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth type="password" label="Confirm New Password" size="small" />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button variant="outlined" size="small">Update Password</Button>
                                </Grid>
                            </Grid>
                        </SettingsSection>
                    </TabPanel>

                    <TabPanel value={activeTab} index={1}>
                        <SettingsSection title="General Settings" icon={<SettingsIcon />}>
                            <SettingRow label="Site Name" description="Display name for the admin panel">
                                <TextField size="small" value={localSettings.siteName} onChange={(e) => handleChange('siteName', e.target.value)} sx={{ width: 250 }} />
                            </SettingRow>
                            <SettingRow label="Site Description" description="Brief description of the platform">
                                <TextField size="small" value={localSettings.siteDescription} onChange={(e) => handleChange('siteDescription', e.target.value)} sx={{ width: 300 }} />
                            </SettingRow>
                            <SettingRow label="Language" description="Default interface language">
                                <TextField select size="small" value={localSettings.language} onChange={(e) => handleChange('language', e.target.value)} SelectProps={{ native: true }} sx={{ width: 150 }}>
                                    <option value="en">English</option>
                                    <option value="hi">Hindi</option>
                                    <option value="ta">Tamil</option>
                                    <option value="te">Telugu</option>
                                </TextField>
                            </SettingRow>
                            <SettingRow label="Theme" description="Interface color scheme">
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip icon={<DarkModeIcon />} label="Dark" onClick={() => handleChange('theme', 'dark')} variant={localSettings.theme === 'dark' ? 'filled' : 'outlined'} color={localSettings.theme === 'dark' ? 'primary' : 'default'} />
                                    <Chip icon={<LightModeIcon />} label="Light" onClick={() => handleChange('theme', 'light')} variant={localSettings.theme === 'light' ? 'filled' : 'outlined'} color={localSettings.theme === 'light' ? 'primary' : 'default'} />
                                </Box>
                            </SettingRow>
                            <SettingRow label="Timezone" description="Default timezone for timestamps">
                                <TextField select size="small" value="Asia/Kolkata" SelectProps={{ native: true }} sx={{ width: 200 }}>
                                    <option value="Asia/Kolkata">IST (UTC+5:30)</option>
                                    <option value="UTC">UTC</option>
                                </TextField>
                            </SettingRow>
                        </SettingsSection>

                        <SettingsSection title="Maintenance Mode" icon={<ShieldIcon />}>
                            <SettingRow label="Enable Maintenance Mode" description="When enabled, users will see a maintenance message">
                                <Switch checked={localSettings.maintenanceMode} onChange={(e) => handleChange('maintenanceMode', e.target.checked)} />
                            </SettingRow>
                            <Box sx={{ mt: 2, p: 2, bgcolor: alpha('#f59e0b', 0.1), borderRadius: 2, border: '1px solid', borderColor: alpha('#f59e0b', 0.3) }}>
                                <Typography variant="body2" color="warning.main" fontWeight={500}>Warning</Typography>
                                <Typography variant="caption" color="text.secondary">Enabling maintenance mode will prevent all users from accessing the platform except administrators.</Typography>
                            </Box>
                        </SettingsSection>
                    </TabPanel>

                    <TabPanel value={activeTab} index={2}>
                        <SettingsSection title="Notification Preferences" icon={<NotificationsIcon />}>
                            <SettingRow label="Email Notifications" description="Receive important updates via email">
                                <Switch checked={localSettings.emailNotifications} onChange={(e) => handleChange('emailNotifications', e.target.checked)} />
                            </SettingRow>
                            <SettingRow label="SOS Alerts" description="Instant alerts for emergency situations">
                                <Switch checked={localSettings.sosAlerts} onChange={(e) => handleChange('sosAlerts', e.target.checked)} />
                            </SettingRow>
                            <SettingRow label="Push Notifications" description="Browser push notifications">
                                <Switch checked={localSettings.pushNotifications} onChange={(e) => handleChange('pushNotifications', e.target.checked)} />
                            </SettingRow>
                            <SettingRow label="Weekly Reports" description="Summary of platform activity">
                                <Switch checked={localSettings.weeklyReports} onChange={(e) => handleChange('weeklyReports', e.target.checked)} />
                            </SettingRow>
                        </SettingsSection>

                        <SettingsSection title="Alert Sound" icon={<ActiveIcon />}>
                            <SettingRow label="Alert Sound" description="Play sound for new SOS alerts">
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip icon={<ActiveIcon />} label="Enabled" onClick={() => handleChange('alertSound', true)} variant={localSettings.alertSound ? 'filled' : 'outlined'} color={localSettings.alertSound ? 'primary' : 'default'} />
                                    <Chip icon={<MutedIcon />} label="Muted" onClick={() => handleChange('alertSound', false)} variant={!localSettings.alertSound ? 'filled' : 'outlined'} color={!localSettings.alertSound ? 'error' : 'default'} />
                                </Box>
                            </SettingRow>
                        </SettingsSection>
                    </TabPanel>

                    <TabPanel value={activeTab} index={3}>
                        <SettingsSection title="Security Settings" icon={<SecurityIcon />}>
                            <SettingRow label="Two-Factor Authentication" description="Add an extra layer of security">
                                <Switch checked={localSettings.twoFactorAuth} onChange={(e) => handleChange('twoFactorAuth', e.target.checked)} />
                            </SettingRow>
                            <SettingRow label="Session Timeout" description="Auto logout after inactivity">
                                <TextField select size="small" value={localSettings.sessionTimeout} onChange={(e) => handleChange('sessionTimeout', e.target.value)} SelectProps={{ native: true }} sx={{ width: 150 }}>
                                    <option value={15}>15 minutes</option>
                                    <option value={30}>30 minutes</option>
                                    <option value={60}>1 hour</option>
                                    <option value={120}>2 hours</option>
                                </TextField>
                            </SettingRow>
                            <SettingRow label="Login History" description="Track login activity">
                                <Button size="small" variant="outlined">View History</Button>
                            </SettingRow>
                        </SettingsSection>

                        <SettingsSection title="Password Policy" icon={<LockIcon />}>
                            <SettingRow label="Minimum Password Length" description="Minimum 8 characters required">
                                <TextField type="number" size="small" value={8} disabled sx={{ width: 80 }} />
                            </SettingRow>
                            <SettingRow label="Password Expiry" description="Force password change">
                                <TextField select size="small" value={90} SelectProps={{ native: true }} sx={{ width: 150 }}>
                                    <option value={30}>30 days</option>
                                    <option value={90}>90 days</option>
                                    <option value={180}>180 days</option>
                                    <option value={0}>Never</option>
                                </TextField>
                            </SettingRow>
                        </SettingsSection>
                    </TabPanel>

                    <TabPanel value={activeTab} index={4}>
                        <SettingsSection title="Data Retention" icon={<StorageIcon />}>
                            <SettingRow label="Data Retention Period" description="How long to keep user data">
                                <TextField select size="small" value={localSettings.dataRetention} onChange={(e) => handleChange('dataRetention', e.target.value)} SelectProps={{ native: true }} sx={{ width: 150 }}>
                                    <option value={30}>30 days</option>
                                    <option value={60}>60 days</option>
                                    <option value={90}>90 days</option>
                                    <option value={180}>180 days</option>
                                    <option value={365}>1 year</option>
                                </TextField>
                            </SettingRow>
                            <SettingRow label="Location History" description="Keep user location history">
                                <Switch defaultChecked />
                            </SettingRow>
                            <SettingRow label="Message History" description="Retain AI chat messages">
                                <Switch defaultChecked />
                            </SettingRow>
                        </SettingsSection>

                        <SettingsSection title="Privacy Controls" icon={<ShieldIcon />}>
                            <SettingRow label="Show User Location" description="Display user locations on map">
                                <Switch defaultChecked />
                            </SettingRow>
                            <SettingRow label="Anonymous Analytics" description="Help improve by sharing anonymized data">
                                <Switch defaultChecked />
                            </SettingRow>
                            <SettingRow label="Export User Data" description="Allow users to export their data">
                                <Switch defaultChecked />
                            </SettingRow>
                        </SettingsSection>
                    </TabPanel>

                    <TabPanel value={activeTab} index={5}>
                        <SettingsSection title="Storage Information" icon={<StorageIcon />}>
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">Storage Used</Typography>
                                    <Typography variant="body2" fontWeight={600}>42.3 GB / 100 GB</Typography>
                                </Box>
                                <Box sx={{ height: 8, bgcolor: alpha('#6366f1', 0.1), borderRadius: 4, overflow: 'hidden' }}>
                                    <Box sx={{ width: '42%', height: '100%', bgcolor: 'primary.main', borderRadius: 4 }} />
                                </Box>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={6} sm={3}>
                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha('#6366f1', 0.05) }}>
                                        <Typography variant="h5" fontWeight={700}>12.5 GB</Typography>
                                        <Typography variant="caption" color="text.secondary">User Data</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha('#ec4899', 0.05) }}>
                                        <Typography variant="h5" fontWeight={700}>8.2 GB</Typography>
                                        <Typography variant="caption" color="text.secondary">Media</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha('#10b981', 0.05) }}>
                                        <Typography variant="h5" fontWeight={700}>15.1 GB</Typography>
                                        <Typography variant="caption" color="text.secondary">Location Data</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha('#f59e0b', 0.05) }}>
                                        <Typography variant="h5" fontWeight={700}>6.5 GB</Typography>
                                        <Typography variant="caption" color="text.secondary">Logs</Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </SettingsSection>

                        <SettingsSection title="Cache Management" icon={<CloudIcon />}>
                            <SettingRow label="Clear Cache" description="Free up temporary storage">
                                <Button size="small" variant="outlined" startIcon={<RefreshIcon />}>Clear Cache</Button>
                            </SettingRow>
                            <SettingRow label="Current Cache Size" description="Temporary data stored locally">
                                <Chip label="2.4 MB" size="small" sx={{ bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }} />
                            </SettingRow>
                        </SettingsSection>
                    </TabPanel>

                    <TabPanel value={activeTab} index={6}>
                        <SettingsSection title="API Configuration" icon={<CodeIcon />}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="API Base URL" value={localSettings.serverUrl} onChange={(e) => handleChange('serverUrl', e.target.value)} size="small" />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="API Key" type="password" value={localSettings.apiKey} onChange={(e) => handleChange('apiKey', e.target.value)} size="small" />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                                        <Typography variant="body2" color="success.main">API Connected</Typography>
                                        <Typography variant="caption" color="text.secondary">Last checked 2 minutes ago</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </SettingsSection>

                        <SettingsSection title="Webhooks" icon={<CodeIcon />}>
                            <SettingRow label="Enable Webhooks" description="Receive real-time event notifications">
                                <Switch defaultChecked />
                            </SettingRow>
                            <SettingRow label="Webhook URL" description="Endpoint for event notifications">
                                <TextField size="small" placeholder="https://your-server.com/webhook" sx={{ width: 280 }} />
                            </SettingRow>
                            <SettingRow label="Test Webhook" description="Send a test notification">
                                <Button size="small" variant="outlined">Send Test</Button>
                            </SettingRow>
                        </SettingsSection>
                    </TabPanel>
                </Grid>
            </Grid>

            <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <InfoIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" fontWeight={500}>System Information</Typography>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">Version</Typography>
                        <Typography variant="body2">v2.4.1</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">Last Deployment</Typography>
                        <Typography variant="body2">Mar 15, 2026</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">Server Region</Typography>
                        <Typography variant="body2">Asia Pacific (Mumbai)</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">Uptime</Typography>
                        <Typography variant="body2" color="success.main">99.98%</Typography>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default Settings;

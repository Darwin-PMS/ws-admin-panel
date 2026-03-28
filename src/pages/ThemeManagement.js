import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    Button,
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
    Tooltip,
    Alert,
    Snackbar,
    CircularProgress,
    Grid,
    Switch,
    FormControlLabel,
} from '@mui/material';
import {
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    Star as StarIcon,
    People as PeopleIcon,
} from '@mui/icons-material';
import { adminApi } from '../services/api';

const ThemeManagement = () => {
    const [themes, setThemes] = useState([]);
    const [userPreferences, setUserPreferences] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [userPrefDialogOpen, setUserPrefDialogOpen] = useState(false);
    const [userPrefForm, setUserPrefForm] = useState({ userId: '', mode: 'dark' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchThemes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await adminApi.themes.list();
            if (response.data.success) {
                setThemes(response.data.data);
            }
        } catch (error) {
            showSnackbar('Failed to fetch themes', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStats = async () => {
        try {
            const response = await adminApi.themes.stats();
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchUserPreferences = async () => {
        try {
            const response = await adminApi.themes.getUserPreferences();
            if (response.data.success) {
                setUserPreferences(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch user preferences:', error);
        }
    };

    useEffect(() => {
        fetchThemes();
        fetchStats();
        fetchUserPreferences();
    }, [fetchThemes]);

    const handleSetDefault = async (themeId) => {
        try {
            await adminApi.themes.setDefault(themeId);
            showSnackbar('Default theme updated');
            fetchThemes();
            fetchStats();
        } catch (error) {
            showSnackbar('Failed to set default theme', 'error');
        }
    };

    const handleDelete = async (themeId) => {
        if (!window.confirm('Are you sure you want to delete this theme?')) return;
        try {
            await adminApi.themes.delete(themeId);
            showSnackbar('Theme deleted');
            fetchThemes();
            fetchStats();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'Failed to delete theme', 'error');
        }
    };

    const handleSetUserPreference = async () => {
        if (!userPrefForm.userId) {
            showSnackbar('Please enter a user ID', 'error');
            return;
        }
        try {
            await adminApi.themes.setUserPreference({
                userId: userPrefForm.userId,
                mode: userPrefForm.mode,
            });
            showSnackbar('User theme preference updated');
            setUserPrefDialogOpen(false);
            setUserPrefForm({ userId: '', mode: 'dark' });
            fetchUserPreferences();
        } catch (error) {
            showSnackbar('Failed to set user preference', 'error');
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const getModeIcon = (mode) => {
        return mode === 'light' ? <LightModeIcon /> : <DarkModeIcon />;
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Theme Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage themes and user preferences
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<PeopleIcon />}
                        onClick={() => setUserPrefDialogOpen(true)}
                    >
                        Set User Theme
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchThemes}
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            {stats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.main', color: 'white' }}>
                                        <DarkModeIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {stats.byMode?.find(m => m.mode === 'dark')?.count || 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Dark Themes
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.main', color: 'white' }}>
                                        <LightModeIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {stats.byMode?.find(m => m.mode === 'light')?.count || 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Light Themes
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.main', color: 'white' }}>
                                        <StarIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                            {stats.defaultTheme || 'None'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Default Theme
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'info.main', color: 'white' }}>
                                        <PeopleIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {userPreferences.length}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            User Preferences
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Theme</TableCell>
                                <TableCell>Mode</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Users</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={24} />
                                    </TableCell>
                                </TableRow>
                            ) : themes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No themes found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                themes.map((theme) => (
                                    <TableRow key={theme.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getModeIcon(theme.mode)}
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {theme.name}
                                                </Typography>
                                                {theme.isDefault && (
                                                    <Chip label="Default" size="small" color="primary" />
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={getModeIcon(theme.mode)}
                                                label={theme.mode}
                                                size="small"
                                                sx={{ textTransform: 'capitalize' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {theme.description || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={theme.isActive ? 'Active' : 'Inactive'}
                                                size="small"
                                                color={theme.isActive ? 'success' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {stats?.byUsers?.find(u => u.name === theme.name)?.user_count || 0}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                {!theme.isDefault && (
                                                    <Tooltip title="Set as Default">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleSetDefault(theme.id)}
                                                        >
                                                            <StarIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDelete(theme.id)}
                                                        disabled={theme.isDefault}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            <Dialog open={userPrefDialogOpen} onClose={() => setUserPrefDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Set User Theme Preference</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="User ID"
                            value={userPrefForm.userId}
                            onChange={(e) => setUserPrefForm({ ...userPrefForm, userId: e.target.value })}
                            fullWidth
                            required
                            helperText="Enter the user's ID to set their theme preference"
                        />
                        <FormControl fullWidth>
                            <InputLabel>Theme Mode</InputLabel>
                            <Select
                                value={userPrefForm.mode}
                                onChange={(e) => setUserPrefForm({ ...userPrefForm, mode: e.target.value })}
                                label="Theme Mode"
                            >
                                <MenuItem value="dark">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <DarkModeIcon fontSize="small" /> Dark
                                    </Box>
                                </MenuItem>
                                <MenuItem value="light">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LightModeIcon fontSize="small" /> Light
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUserPrefDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSetUserPreference}>
                        Set Preference
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity || 'info'} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ThemeManagement;

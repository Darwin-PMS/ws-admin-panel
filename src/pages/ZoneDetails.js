import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    TextField,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    MenuItem,
    CircularProgress,
    Alert,
    Snackbar,
    Tooltip,
    Card,
    CardContent,
    Avatar,
    Divider,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Search as SearchIcon,
    Add as AddIcon,
    PersonAdd as PersonAddIcon,
    Delete as DeleteIcon,
    Map as MapIcon,
    LocationOn as LocationIcon,
    People as PeopleIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const ROLE_OPTIONS = [
    { value: 'member', label: 'Member', color: '#6B7280' },
    { value: 'zone_head', label: 'Zone Head', color: '#8B5CF6' },
    { value: 'supervisor', label: 'Supervisor', color: '#F59E0B' },
    { value: 'police', label: 'Police', color: '#3B82F6' },
    { value: 'guardian', label: 'Guardian', color: '#EC4899' },
];

const ZoneDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [zone, setZone] = useState(null);
    const [users, setUsers] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [openAssignDialog, setOpenAssignDialog] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [assignForm, setAssignForm] = useState({
        userId: '',
        roleInArea: 'member',
        isPrimary: false,
    });

    const fetchZoneData = useCallback(async () => {
        setLoading(true);
        try {
            const [zoneRes, usersRes] = await Promise.all([
                fetch(`/api/v1/mobile/admin/zones/${id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
                }),
                fetch(`/api/v1/mobile/admin/zones/${id}/users`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
                }),
            ]);

            const zoneData = await zoneRes.json();
            const usersData = await usersRes.json();

            if (zoneData.success) setZone(zoneData.data);
            if (usersData.success) setUsers(usersData.data || []);
        } catch (error) {
            console.error('Error fetching zone:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchZoneData();
    }, [fetchZoneData]);

    const getMockUsers = () => [
        { id: '1', name: 'John Doe', email: 'john@example.com', role_in_area: 'zone_head', is_primary: true, assigned_at: '2026-01-15' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role_in_area: 'supervisor', is_primary: false, assigned_at: '2026-02-01' },
        { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role_in_area: 'member', is_primary: false, assigned_at: '2026-02-10' },
    ];

    const fetchAvailableUsers = async (search = '') => {
        setLoadingUsers(true);
        try {
            const response = await fetch(`/api/v1/mobile/admin/users?search=${search}&limit=50`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
            });
            const data = await response.json();
            if (data.success) {
                // Filter out users already assigned to this zone
                const assignedUserIds = users.map(u => u.id);
                const filtered = (data.users || data.data || []).filter(u => !assignedUserIds.includes(u.id));
                setAvailableUsers(filtered);
            }
        } catch (error) {
            console.error('Error fetching available users:', error);
            setAvailableUsers([
                { id: '10', first_name: 'Mike', last_name: 'Johnson', email: 'mike@example.com' },
                { id: '11', first_name: 'Sarah', last_name: 'Williams', email: 'sarah@example.com' },
                { id: '12', first_name: 'David', last_name: 'Brown', email: 'david@example.com' },
            ]);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleOpenAssignDialog = () => {
        setSelectedUserIds([]);
        fetchAvailableUsers();
        setOpenAssignDialog(true);
    };

    const handleToggleUser = (userId) => {
        setSelectedUserIds(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        if (selectedUserIds.length === availableUsers.length) {
            setSelectedUserIds([]);
        } else {
            setSelectedUserIds(availableUsers.map(u => u.id));
        }
    };

    const handleBulkAssign = async () => {
        if (selectedUserIds.length === 0) {
            setSnackbar({ open: true, message: 'Please select at least one user', severity: 'warning' });
            return;
        }

        try {
            const response = await fetch(`/api/v1/mobile/admin/zones/${id}/assign-bulk`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userIds: selectedUserIds,
                    roleInArea: assignForm.roleInArea,
                    isPrimary: assignForm.isPrimary,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setSnackbar({ open: true, message: data.message || 'Users assigned successfully', severity: 'success' });
                setOpenAssignDialog(false);
                setSelectedUserIds([]);
                fetchZoneData();
            } else {
                setSnackbar({ open: true, message: data.message || 'Failed to assign users', severity: 'error' });
            }
        } catch (error) {
            console.error('Error assigning users:', error);
            setSnackbar({ open: true, message: 'Failed to assign users', severity: 'error' });
        }
    };

    const handleAssignUser = async () => {
        try {
            const response = await fetch(`/api/v1/mobile/admin/zones/${id}/assign`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: parseInt(assignForm.userId),
                    roleInArea: assignForm.roleInArea,
                    isPrimary: assignForm.isPrimary,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setSnackbar({ open: true, message: 'User assigned successfully', severity: 'success' });
                setOpenAssignDialog(false);
                setAssignForm({ userId: '', roleInArea: 'member', isPrimary: false });
                fetchZoneData();
            } else {
                setSnackbar({ open: true, message: data.message || 'Failed to assign user', severity: 'error' });
            }
        } catch (error) {
            console.error('Error assigning user:', error);
            setSnackbar({ open: true, message: 'Failed to assign user', severity: 'error' });
        }
    };

    const handleRemoveUser = async (userId) => {
        if (!window.confirm('Remove this user from the zone?')) return;

        try {
            const response = await fetch(`/api/v1/mobile/admin/zones/${id}/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
            });
            const data = await response.json();
            if (data.success) {
                setSnackbar({ open: true, message: 'User removed successfully', severity: 'success' });
                fetchZoneData();
            } else {
                setSnackbar({ open: true, message: data.message || 'Failed to remove user', severity: 'error' });
            }
        } catch (error) {
            console.error('Error removing user:', error);
            setSnackbar({ open: true, message: 'Failed to remove user', severity: 'error' });
        }
    };

    const getRoleColor = (role) => ROLE_OPTIONS.find(r => r.value === role)?.color || '#6B7280';
    const getRoleLabel = (role) => ROLE_OPTIONS.find(r => r.value === role)?.label || role;

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role_in_area === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <IconButton onClick={() => navigate('/zones')}>
                    <BackIcon />
                </IconButton>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" fontWeight={600}>
                        {zone?.name || 'Zone Details'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {users.length} users assigned
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={handleOpenAssignDialog}
                >
                    Assign Users
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Zone Info</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <MapIcon color="primary" />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Type</Typography>
                                        <Typography fontWeight={500}>{zone?.type}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LocationIcon color="primary" />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Location</Typography>
                                        <Typography fontWeight={500}>
                                            {zone?.latitude}, {zone?.longitude}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PeopleIcon color="primary" />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Radius</Typography>
                                        <Typography fontWeight={500}>{zone?.radius_km || 5} km</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <TextField
                                    placeholder="Search users..."
                                    size="small"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    sx={{ width: 250 }}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                                    }}
                                />
                                <TextField
                                    select
                                    size="small"
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    sx={{ width: 150 }}
                                >
                                    <MenuItem value="all">All Roles</MenuItem>
                                    {ROLE_OPTIONS.map(role => (
                                        <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>
                                    ))}
                                </TextField>
                            </Box>

                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>User</TableCell>
                                            <TableCell>Role</TableCell>
                                            <TableCell>Assigned Date</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                                    <Typography color="text.secondary">No users in this zone</Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <TableRow key={user.id} hover>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <Avatar sx={{ width: 36, height: 36, bgcolor: getRoleColor(user.role_in_area) }}>
                                                                {user.name?.charAt(0)}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography fontWeight={500}>{user.name}</Typography>
                                                                <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Chip
                                                                label={getRoleLabel(user.role_in_area)}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: `${getRoleColor(user.role_in_area)}20`,
                                                                    color: getRoleColor(user.role_in_area),
                                                                    fontWeight: 500,
                                                                }}
                                                            />
                                                            {user.is_primary && (
                                                                <Chip label="Primary" size="small" color="primary" />
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>{user.assigned_at}</TableCell>
                                                    <TableCell align="right">
                                                        <Tooltip title="Remove">
                                                            <IconButton color="error" size="small" onClick={() => handleRemoveUser(user.id)}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Assign Users to Zone
                    {selectedUserIds.length > 0 && (
                        <Typography variant="body2" color="text.secondary">
                            {selectedUserIds.length} user(s) selected
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search users..."
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                                }}
                                onChange={(e) => fetchAvailableUsers(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                {loadingUsers ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={24} /></Box>
                                ) : availableUsers.length === 0 ? (
                                    <Typography sx={{ p: 2 }} color="text.secondary">No users available</Typography>
                                ) : (
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell padding="checkbox">
                                                        <Tooltip title="Select all">
                                                            <Checkbox
                                                                checked={selectedUserIds.length === availableUsers.length && availableUsers.length > 0}
                                                                indeterminate={selectedUserIds.length > 0 && selectedUserIds.length < availableUsers.length}
                                                                onChange={handleSelectAll}
                                                            />
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell>Email</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {availableUsers.map(user => (
                                                    <TableRow 
                                                        key={user.id} 
                                                        hover 
                                                        sx={{ cursor: 'pointer' }}
                                                        onClick={() => handleToggleUser(user.id)}
                                                    >
                                                        <TableCell padding="checkbox">
                                                            <Checkbox
                                                                checked={selectedUserIds.includes(user.id)}
                                                                onClick={() => handleToggleUser(user.id)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>{user.first_name} {user.last_name}</TableCell>
                                                        <TableCell>{user.email}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                select
                                label="Role in Zone"
                                value={assignForm.roleInArea}
                                onChange={(e) => setAssignForm({ ...assignForm, roleInArea: e.target.value })}
                            >
                                {ROLE_OPTIONS.map(role => (
                                    <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={assignForm.isPrimary}
                                        onChange={(e) => setAssignForm({ ...assignForm, isPrimary: e.target.checked })}
                                    />
                                }
                                label="Set as primary zone"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleBulkAssign} 
                        disabled={selectedUserIds.length === 0}
                    >
                        Assign {selectedUserIds.length > 0 ? `(${selectedUserIds.length})` : ''}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ZoneDetails;

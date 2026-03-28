import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    Drawer,
    Alert,
    Skeleton,
    Avatar,
    Divider,
    Paper,
    Tabs,
    Tab,
    Tooltip,
    alpha,
    ListItemIcon,
    Checkbox,
    Grid,
    LinearProgress,
    Switch,
    FormControlLabel,
    Badge,
    List,
    ListItem,
    ListItemText,
    ToggleButton,
    ToggleButtonGroup,
    Snackbar,
} from '@mui/material';
import {
    Search as SearchIcon,
    MoreVert as MoreVertIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Verified as VerifiedIcon,
    Block as BlockIcon,
    Refresh as RefreshIcon,
    CheckCircle as ActiveIcon,
    Cancel as InactiveIcon,
    FiberManualRecord as LiveIcon,
    FilterList as FilterIcon,
    FileDownload as ExportIcon,
    ViewList as ListIcon,
    GridView as GridIcon,
    LocationOn as LocationIcon,
    CalendarToday as CalendarIcon,
    AccessTime as TimeIcon,
    Security as SecurityIcon,
    FamilyRestroom as FamilyIcon,
    ChildCare as ChildCareIcon,
    TrendingUp as TrendingUpIcon,
    Download as DownloadIcon,
    PersonAdd as PersonAddIcon,
    WhatsApp as WhatsAppIcon,
    Sms as SmsIcon,
    MoreVert,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, setFilters, setSearch, setRoleFilter, setPage, setRowsPerPage, deleteUser, updateUser } from '../store/slices/usersSlice';
import { adminApi } from '../services/api';

const roleConfig = {
    system_admin: { color: '#dc2626', bg: '#fef2f2', label: 'System Admin', icon: SecurityIcon },
    agency_admin: { color: '#ea580c', bg: '#fff7ed', label: 'Agency Admin', icon: SecurityIcon },
    admin: { color: '#6366f1', bg: '#eef2ff', label: 'Admin', icon: SecurityIcon },
    supervisor: { color: '#8b5cf6', bg: '#f5f3ff', label: 'Supervisor', icon: SecurityIcon },
    woman: { color: '#ec4899', bg: '#fdf2f8', label: 'Woman', icon: PersonIcon },
    parent: { color: '#10b981', bg: '#ecfdf5', label: 'Parent', icon: FamilyIcon },
    guardian: { color: '#f59e0b', bg: '#fffbeb', label: 'Guardian', icon: FamilyIcon },
    friend: { color: '#06b6d4', bg: '#ecfeff', label: 'Friend', icon: PersonIcon },
};

const StatCard = ({ icon, label, value, color, trend }) => (
    <Paper elevation={0} sx={{ px: 2.5, py: 2, borderRadius: 2, bgcolor: alpha(color, 0.08), border: '1px solid', borderColor: alpha(color, 0.15), position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: color }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha(color, 0.15), color: color }}>
                {icon}
            </Box>
            <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color, lineHeight: 1.2 }}>
                    {value?.toLocaleString() || '0'}
                </Typography>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
            </Box>
            {trend !== undefined && (
                <Chip
                    size="small"
                    icon={<TrendingUpIcon sx={{ fontSize: 12 }} />}
                    label={`+${trend}%`}
                    sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha('#10b981', 0.1), color: '#10b981' }}
                />
            )}
        </Box>
    </Paper>
);

const UserCard = ({ user, onView, onEdit, onDelete, selected, onSelect }) => {
    const config = roleConfig[user.role] || roleConfig.friend;
    
    return (
        <Card
            sx={{
                mb: 1.5,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: '1px solid',
                borderColor: selected ? 'primary.main' : 'divider',
                bgcolor: selected ? alpha('#6366f1', 0.05) : 'background.paper',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                    borderColor: 'primary.main',
                },
            }}
            onClick={onView}
        >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ position: 'relative' }}>
                        <Avatar
                            src={user.profilePhoto}
                            sx={{ width: 48, height: 48, bgcolor: config.color, fontSize: '1.1rem', fontWeight: 700 }}
                        >
                            {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </Avatar>
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: -2,
                                right: -2,
                                width: 14,
                                height: 14,
                                borderRadius: '50%',
                                bgcolor: user.isActive ? '#10b981' : '#64748b',
                                border: '2px solid',
                                borderColor: 'background.paper',
                            }}
                        />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle1" fontWeight={600} noWrap>
                                {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email?.split('@')[0] || 'No name'}
                            </Typography>
                            <Checkbox
                                size="small"
                                checked={selected}
                                onChange={(e) => { e.stopPropagation(); onSelect(user.id); }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip
                                label={config.label}
                                size="small"
                                sx={{
                                    height: 20,
                                    fontSize: '0.65rem',
                                    bgcolor: config.bg,
                                    color: config.color,
                                    fontWeight: 600,
                                }}
                            />
                            {user.isVerified && (
                                <Chip
                                    icon={<VerifiedIcon sx={{ fontSize: 12 }} />}
                                    label="Verified"
                                    size="small"
                                    sx={{
                                        height: 20,
                                        fontSize: '0.65rem',
                                        bgcolor: alpha('#10b981', 0.1),
                                        color: '#10b981',
                                        fontWeight: 600,
                                    }}
                                />
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            {user.email && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 150 }}>
                                        {user.email}
                                    </Typography>
                                </Box>
                            )}
                            {user.phone && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                        {user.phone}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                        <Chip
                            label={user.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            sx={{
                                height: 22,
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                bgcolor: user.isActive ? alpha('#10b981', 0.1) : alpha('#64748b', 0.1),
                                color: user.isActive ? '#10b981' : '#64748b',
                            }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); }}>
                        <MoreVertIcon />
                    </IconButton>
                </Box>
            </CardContent>
        </Card>
    );
};

const Users = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { users, loading, filters, totalCount } = useSelector((state) => state.users);

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
    const [detailDrawer, setDetailDrawer] = useState({ open: false, user: null });
    const [activeTab, setActiveTab] = useState(0);
    const [selectedRows, setSelectedRows] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const columns = [
        { key: 'user', label: 'User' },
        { key: 'contact', label: 'Contact' },
        { key: 'role', label: 'Role' },
        { key: 'status', label: 'Status' },
        { key: 'verified', label: 'Verified' },
        { key: 'joined', label: 'Joined' },
        { key: 'actions', label: 'Actions' },
    ];

    const [visibleColumns, setVisibleColumns] = useState(['user', 'contact', 'role', 'status', 'verified', 'joined', 'actions']);

    const fetchUsersData = useCallback(() => {
        dispatch(fetchUsers({
            page: filters.page + 1,
            limit: filters.rowsPerPage,
            search: filters.search || undefined,
            role: filters.role !== 'all' ? filters.role : undefined,
        }));
        setLastUpdated(new Date());
    }, [dispatch, filters]);

    useEffect(() => {
        fetchUsersData();
        const interval = setInterval(fetchUsersData, 60000);
        return () => clearInterval(interval);
    }, [fetchUsersData]);

    useEffect(() => {
        setSelectedRows([]);
    }, [filters.page, filters.rowsPerPage, filters.search, filters.role]);

    const handleMenuOpen = (event, user) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleView = () => {
        handleMenuClose();
        setDetailDrawer({ open: true, user: selectedUser });
    };

    const handleEdit = () => {
        handleMenuClose();
        if (selectedUser) {
            navigate(`/users/${selectedUser.id}?edit=true`);
        }
    };

    const handleDelete = () => {
        handleMenuClose();
        setDeleteDialog({ open: true, user: selectedUser });
    };

    const confirmDelete = async () => {
        try {
            await dispatch(deleteUser(deleteDialog.user.id)).unwrap();
            setDeleteDialog({ open: false, user: null });
            setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
            fetchUsersData();
        } catch (error) {
            setSnackbar({ open: true, message: 'Failed to delete user', severity: 'error' });
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        if (newValue === 1) dispatch(setRoleFilter('woman'));
        else if (newValue === 2) dispatch(setRoleFilter('parent'));
        else if (newValue === 3) dispatch(setRoleFilter('admin'));
        else dispatch(setRoleFilter('all'));
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedRows(users.map(u => u.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (userId) => {
        setSelectedRows(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleBulkAction = (action) => {
        if (action === 'delete') {
            selectedRows.forEach(id => {
                dispatch(deleteUser(id));
            });
            setSnackbar({ open: true, message: `${selectedRows.length} users deleted`, severity: 'success' });
        } else if (action === 'export') {
            const exportData = users.filter(u => selectedRows.includes(u.id)).map(u => ({
                Name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
                Email: u.email,
                Phone: u.phone,
                Role: roleConfig[u.role]?.label || u.role,
                Status: u.isActive ? 'Active' : 'Inactive',
                Verified: u.isVerified ? 'Yes' : 'No',
            }));
            const csv = [Object.keys(exportData[0] || {}).join(','), ...exportData.map(row => Object.values(row).join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'users_export.csv';
            a.click();
            setSnackbar({ open: true, message: 'Users exported successfully', severity: 'success' });
        }
        setSelectedRows([]);
    };

    const getRoleBadge = (role) => {
        const config = roleConfig[role] || { color: '#64748b', bg: '#f1f5f9', label: role };
        return (
            <Chip
                label={config.label || role}
                size="small"
                sx={{
                    bgcolor: config.bg,
                    color: config.color,
                    fontWeight: 600,
                    fontSize: '0.7rem',
                }}
            />
        );
    };

    const stats = {
        total: totalCount || users.length,
        women: users.filter(u => u.role === 'woman').length,
        parents: users.filter(u => u.role === 'parent' || u.role === 'guardian').length,
        verified: users.filter(u => u.isVerified).length,
        active: users.filter(u => u.isActive).length,
    };

    const formatLastUpdated = () => {
        if (!lastUpdated) return '';
        const now = new Date();
        const diff = Math.floor((now - lastUpdated) / 1000);
        if (diff < 60) return 'Updated just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return `Updated ${lastUpdated.toLocaleTimeString()}`;
    };

    const isColumnVisible = (key) => visibleColumns.includes(key);

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                            <Typography variant="h4" sx={{ fontWeight: 800 }}>
                                Users
                            </Typography>
                            <Chip
                                icon={<LiveIcon sx={{ fontSize: 10 }} />}
                                label="LIVE"
                                size="small"
                                sx={{
                                    bgcolor: alpha('#10b981', 0.1),
                                    color: '#10b981',
                                    fontWeight: 700,
                                    fontSize: '0.65rem',
                                    height: 22,
                                }}
                            />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            Manage all registered users and their permissions
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Chip label={formatLastUpdated() || 'Loading...'} size="small" variant="outlined" />
                        <Button variant="outlined" startIcon={<DownloadIcon />} size="small" onClick={() => handleBulkAction('export')}>
                            Export
                        </Button>
                        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => navigate('/users/new')}>
                            Add User
                        </Button>
                    </Box>
                </Box>
            </Box>

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={4} md={2.4}>
                    <StatCard icon={<PersonIcon sx={{ fontSize: 20 }} />} label="Total Users" value={stats.total} color="#6366f1" trend={12} />
                </Grid>
                <Grid item xs={6} sm={4} md={2.4}>
                    <StatCard icon={<SecurityIcon sx={{ fontSize: 20 }} />} label="Women" value={stats.women} color="#ec4899" trend={8} />
                </Grid>
                <Grid item xs={6} sm={4} md={2.4}>
                    <StatCard icon={<FamilyIcon sx={{ fontSize: 20 }} />} label="Parents" value={stats.parents} color="#10b981" trend={15} />
                </Grid>
                <Grid item xs={6} sm={4} md={2.4}>
                    <StatCard icon={<VerifiedIcon sx={{ fontSize: 20 }} />} label="Verified" value={stats.verified} color="#f59e0b" trend={5} />
                </Grid>
                <Grid item xs={6} sm={4} md={2.4}>
                    <StatCard icon={<ActiveIcon sx={{ fontSize: 20 }} />} label="Active" value={stats.active} color="#14b8a6" />
                </Grid>
            </Grid>

            {selectedRows.length > 0 && (
                <Paper
                    sx={{
                        p: 2,
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: alpha('#6366f1', 0.08),
                        border: '1px solid',
                        borderColor: alpha('#6366f1', 0.2),
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                            label={`${selectedRows.length} selected`}
                            color="primary"
                            sx={{ fontWeight: 600 }}
                        />
                        <Button size="small" variant="outlined" onClick={() => setSelectedRows([])}>
                            Clear
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="outlined" startIcon={<ExportIcon />} onClick={() => handleBulkAction('export')}>
                            Export
                        </Button>
                        <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => handleBulkAction('delete')}>
                            Delete
                        </Button>
                    </Box>
                </Paper>
            )}

            <Card sx={{ mb: 2 }}>
                <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                        <Tabs value={activeTab} onChange={handleTabChange} sx={{ minHeight: 36 }}>
                            <Tab label={`All (${stats.total})`} sx={{ minHeight: 36, py: 1 }} />
                            <Tab label={`Women (${stats.women})`} sx={{ minHeight: 36, py: 1 }} />
                            <Tab label={`Parents (${stats.parents})`} sx={{ minHeight: 36, py: 1 }} />
                            <Tab label={`Admins`} sx={{ minHeight: 36, py: 1 }} />
                        </Tabs>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ToggleButtonGroup
                                value={viewMode}
                                exclusive
                                onChange={(e, v) => v && setViewMode(v)}
                                size="small"
                            >
                                <ToggleButton value="table">
                                    <Tooltip title="Table View"><ListIcon sx={{ fontSize: 18 }} /></Tooltip>
                                </ToggleButton>
                                <ToggleButton value="card">
                                    <Tooltip title="Card View"><GridIcon sx={{ fontSize: 18 }} /></Tooltip>
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <TextField
                            placeholder="Search by name, email, or phone..."
                            value={filters.search}
                            onChange={(e) => dispatch(setSearch(e.target.value))}
                            size="small"
                            sx={{ flex: 1, minWidth: 200 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={filters.role}
                                onChange={(e) => dispatch(setRoleFilter(e.target.value))}
                                label="Role"
                            >
                                <MenuItem value="all">All Roles</MenuItem>
                                <MenuItem value="system_admin">System Admin</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                                <MenuItem value="supervisor">Supervisor</MenuItem>
                                <MenuItem value="woman">Woman</MenuItem>
                                <MenuItem value="parent">Parent</MenuItem>
                                <MenuItem value="guardian">Guardian</MenuItem>
                                <MenuItem value="friend">Friend</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Status</InputLabel>
                            <Select value="all" label="Status">
                                <MenuItem value="all">All Status</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                        <Tooltip title="Refresh">
                            <IconButton onClick={fetchUsersData} disabled={loading}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Card>

            {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

            <Card>
                {viewMode === 'table' ? (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            indeterminate={selectedRows.length > 0 && selectedRows.length < users.length}
                                            checked={users.length > 0 && selectedRows.length === users.length}
                                            onChange={handleSelectAll}
                                        />
                                    </TableCell>
                                    {isColumnVisible('user') && <TableCell>User</TableCell>}
                                    {isColumnVisible('contact') && <TableCell>Contact</TableCell>}
                                    {isColumnVisible('role') && <TableCell>Role</TableCell>}
                                    {isColumnVisible('status') && <TableCell>Status</TableCell>}
                                    {isColumnVisible('verified') && <TableCell>Verified</TableCell>}
                                    {isColumnVisible('joined') && <TableCell>Joined</TableCell>}
                                    {isColumnVisible('actions') && <TableCell align="right">Actions</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading && users.length === 0 ? (
                                    [...Array(5)].map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell><Skeleton /></TableCell>
                                            {[...Array(6)].map((_, i) => <TableCell key={i}><Skeleton /></TableCell>)}
                                        </TableRow>
                                    ))
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                            <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                            <Typography variant="h6" color="text.secondary">No users found</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {filters.search ? 'Try a different search term' : 'No users match your filters'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow
                                            key={user.id}
                                            hover
                                            selected={selectedRows.includes(user.id)}
                                            sx={{ cursor: 'pointer' }}
                                            onClick={() => setDetailDrawer({ open: true, user })}
                                        >
                                            <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedRows.includes(user.id)}
                                                    onChange={() => handleSelectRow(user.id)}
                                                />
                                            </TableCell>
                                            {isColumnVisible('user') && (
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar
                                                            src={user.profilePhoto}
                                                            sx={{ bgcolor: roleConfig[user.role]?.color || 'primary.main' }}
                                                        >
                                                            {user.firstName?.charAt(0) || user.email?.charAt(0)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'No name'}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                ID: {user.id?.slice(0, 8)}...
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                            )}
                                            {isColumnVisible('contact') && (
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                        {user.email && (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                                <Typography variant="caption">{user.email}</Typography>
                                                            </Box>
                                                        )}
                                                        {user.phone && (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                                <Typography variant="caption">{user.phone}</Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            )}
                                            {isColumnVisible('role') && <TableCell>{getRoleBadge(user.role)}</TableCell>}
                                            {isColumnVisible('status') && (
                                                <TableCell>
                                                    <Chip
                                                        label={user.isActive ? 'Active' : 'Inactive'}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: user.isActive ? alpha('#10b981', 0.1) : alpha('#64748b', 0.1),
                                                            color: user.isActive ? '#10b981' : '#64748b',
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                </TableCell>
                                            )}
                                            {isColumnVisible('verified') && (
                                                <TableCell>
                                                    {user.isVerified ? (
                                                        <Chip
                                                            icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
                                                            label="Verified"
                                                            size="small"
                                                            sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 600 }}
                                                        />
                                                    ) : (
                                                        <Chip label="Pending" size="small" sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 600 }} />
                                                    )}
                                                </TableCell>
                                            )}
                                            {isColumnVisible('joined') && (
                                                <TableCell>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                                                    </Typography>
                                                </TableCell>
                                            )}
                                            {isColumnVisible('actions') && (
                                                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                                    <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                                                        <MoreVertIcon />
                                                    </IconButton>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <CardContent sx={{ p: 2 }}>
                        {loading ? (
                            [...Array(4)].map((_, i) => (
                                <Card key={i} sx={{ mb: 1.5 }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Skeleton variant="circular" width={48} height={48} />
                                            <Box sx={{ flex: 1 }}>
                                                <Skeleton width="50%" />
                                                <Skeleton width="30%" />
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))
                        ) : users.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">No users found</Typography>
                            </Box>
                        ) : (
                            users.map((user) => (
                                <UserCard
                                    key={user.id}
                                    user={user}
                                    selected={selectedRows.includes(user.id)}
                                    onSelect={handleSelectRow}
                                    onView={() => setDetailDrawer({ open: true, user })}
                                    onEdit={() => navigate(`/users/${user.id}?edit=true`)}
                                    onDelete={() => { setDeleteDialog({ open: true, user }); }}
                                />
                            ))
                        )}
                    </CardContent>
                )}
                <TablePagination
                    component="div"
                    count={totalCount}
                    page={filters.page}
                    onPageChange={(e, newPage) => dispatch(setPage(newPage))}
                    rowsPerPage={filters.rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        dispatch(setRowsPerPage(parseInt(e.target.value, 10)));
                        dispatch(setPage(0));
                    }}
                />
            </Card>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleView}>
                    <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
                    View Details
                </MenuItem>
                <MenuItem onClick={handleEdit}>
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    Edit User
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                    <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                    Delete User
                </MenuItem>
            </Menu>

            <Drawer
                anchor="bottom"
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, user: null })}
                PaperProps={{ sx: { borderRadius: '16px 16px 0 0', p: 3 } }}
            >
                <Typography variant="h6" sx={{ mb: 2 }}>Delete User</Typography>
                <Alert severity="error" sx={{ mb: 3 }}>
                    Are you sure you want to delete <strong>{deleteDialog.user?.firstName} {deleteDialog.user?.lastName}</strong>? This action cannot be undone.
                </Alert>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button fullWidth variant="outlined" onClick={() => setDeleteDialog({ open: false, user: null })}>
                        Cancel
                    </Button>
                    <Button fullWidth variant="contained" color="error" onClick={confirmDelete}>
                        Delete User
                    </Button>
                </Box>
            </Drawer>

            <Drawer
                anchor="right"
                open={detailDrawer.open}
                onClose={() => setDetailDrawer({ open: false, user: null })}
                PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}
            >
                {detailDrawer.user && (
                    <Box>
                        <Box sx={{ p: 3, bgcolor: roleConfig[detailDrawer.user.role]?.color || 'primary.main', color: 'white' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.2)', fontSize: '1.5rem' }}>
                                        {detailDrawer.user.firstName?.charAt(0) || detailDrawer.user.email?.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" fontWeight={700}>
                                            {detailDrawer.user.firstName ? `${detailDrawer.user.firstName} ${detailDrawer.user.lastName || ''}` : 'No name'}
                                        </Typography>
                                        <Chip
                                            label={roleConfig[detailDrawer.user.role]?.label || detailDrawer.user.role}
                                            size="small"
                                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mt: 0.5 }}
                                        />
                                    </Box>
                                </Box>
                                <IconButton sx={{ color: 'white' }} onClick={() => setDetailDrawer({ open: false, user: null })}>
                                    ×
                                </IconButton>
                            </Box>
                        </Box>

                        <Box sx={{ p: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Contact Information
                            </Typography>
                            
                            <List dense sx={{ mb: 2 }}>
                                <ListItem sx={{ px: 0 }}>
                                    <ListItemIcon sx={{ minWidth: 36 }}><EmailIcon color="action" /></ListItemIcon>
                                    <ListItemText primary={detailDrawer.user.email || 'Not provided'} />
                                    {detailDrawer.user.email && (
                                        <IconButton size="small" onClick={() => window.open(`mailto:${detailDrawer.user.email}`)}>
                                            <SmsIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </ListItem>
                                <ListItem sx={{ px: 0 }}>
                                    <ListItemIcon sx={{ minWidth: 36 }}><PhoneIcon color="action" /></ListItemIcon>
                                    <ListItemText primary={detailDrawer.user.phone || 'Not provided'} />
                                    {detailDrawer.user.phone && (
                                        <IconButton size="small" onClick={() => window.open(`tel:${detailDrawer.user.phone}`)}>
                                            <PhoneIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </ListItem>
                                {detailDrawer.user.whatsapp && (
                                    <ListItem sx={{ px: 0 }}>
                                        <ListItemIcon sx={{ minWidth: 36 }}><WhatsAppIcon color="action" /></ListItemIcon>
                                        <ListItemText primary={detailDrawer.user.whatsapp} />
                                        <IconButton size="small" onClick={() => window.open(`https://wa.me/${detailDrawer.user.whatsapp.replace(/\D/g, '')}`)}>
                                            <WhatsAppIcon fontSize="small" />
                                        </IconButton>
                                    </ListItem>
                                )}
                            </List>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Account Status
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <Chip
                                    icon={detailDrawer.user.isActive ? <ActiveIcon sx={{ fontSize: 16 }} /> : <InactiveIcon sx={{ fontSize: 16 }} />}
                                    label={detailDrawer.user.isActive ? 'Active' : 'Inactive'}
                                    sx={{
                                        bgcolor: detailDrawer.user.isActive ? alpha('#10b981', 0.1) : alpha('#64748b', 0.1),
                                        color: detailDrawer.user.isActive ? '#10b981' : '#64748b',
                                        fontWeight: 600,
                                    }}
                                />
                                <Chip
                                    icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
                                    label={detailDrawer.user.isVerified ? 'Verified' : 'Pending'}
                                    sx={{
                                        bgcolor: detailDrawer.user.isVerified ? alpha('#10b981', 0.1) : alpha('#f59e0b', 0.1),
                                        color: detailDrawer.user.isVerified ? '#10b981' : '#f59e0b',
                                        fontWeight: 600,
                                    }}
                                />
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Account Details
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">User ID</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                    {detailDrawer.user.id}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary">Joined</Typography>
                                    <Typography variant="body2">
                                        {detailDrawer.user.createdAt ? new Date(detailDrawer.user.createdAt).toLocaleDateString() : 'Unknown'}
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary">Last Login</Typography>
                                    <Typography variant="body2">
                                        {detailDrawer.user.lastLogin ? new Date(detailDrawer.user.lastLogin).toLocaleString() : 'Never'}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<ViewIcon />}
                                    onClick={() => {
                                        setDetailDrawer({ open: false, user: null });
                                        navigate(`/users/${detailDrawer.user.id}`);
                                    }}
                                >
                                    Full Profile
                                </Button>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<EditIcon />}
                                    onClick={() => {
                                        setDetailDrawer({ open: false, user: null });
                                        navigate(`/users/${detailDrawer.user.id}?edit=true`);
                                    }}
                                >
                                    Edit
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Drawer>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
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

export default Users;

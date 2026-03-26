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
    FilterList as FilterIcon,
    CheckCircle as ActiveIcon,
    Cancel as InactiveIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, setFilters, setSearch, setRoleFilter, setPage, setRowsPerPage, deleteUser } from '../store/slices/usersSlice';

const roleConfig = {
    system_admin: { color: '#dc2626', bg: '#fef2f2', label: 'System Admin' },
    agency_admin: { color: '#ea580c', bg: '#fff7ed', label: 'Agency Admin' },
    admin: { color: '#6366f1', bg: '#eef2ff', label: 'Admin' },
    supervisor: { color: '#8b5cf6', bg: '#f5f3ff', label: 'Supervisor' },
    woman: { color: '#ec4899', bg: '#fdf2f8', label: 'Woman' },
    parent: { color: '#10b981', bg: '#ecfdf5', label: 'Parent' },
    guardian: { color: '#f59e0b', bg: '#fffbeb', label: 'Guardian' },
    friend: { color: '#06b6d4', bg: '#ecfeff', label: 'Friend' },
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

    const fetchUsersData = useCallback(() => {
        dispatch(fetchUsers({
            page: filters.page + 1,
            limit: filters.rowsPerPage,
            search: filters.search || undefined,
            role: filters.role !== 'all' ? filters.role : undefined,
        }));
    }, [dispatch, filters]);

    useEffect(() => {
        fetchUsersData();
    }, [fetchUsersData]);

    const handleMenuOpen = (event, user) => {
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
            fetchUsersData();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        if (newValue === 1) dispatch(setRoleFilter('woman'));
        else if (newValue === 2) dispatch(setRoleFilter('parent'));
        else dispatch(setRoleFilter('all'));
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
        parents: users.filter(u => u.role === 'parent').length,
        verified: users.filter(u => u.isVerified).length,
    };

    return (
        <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                            Users
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage all registered users and their permissions
                        </Typography>
                    </Box>
                    <Button variant="contained" startIcon={<AddIcon />}>
                        Add User
                    </Button>
                </Box>
            </Box>

            {/* Quick Stats */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                {[
                    { label: 'Total', value: stats.total, color: '#6366f1' },
                    { label: 'Women', value: stats.women, color: '#ec4899' },
                    { label: 'Parents', value: stats.parents, color: '#10b981' },
                    { label: 'Verified', value: stats.verified, color: '#f59e0b' },
                ].map((stat) => (
                    <Paper
                        key={stat.label}
                        elevation={0}
                        sx={{ px: 2.5, py: 1.5, borderRadius: 2, bgcolor: alpha(stat.color, 0.1) }}
                    >
                        <Typography variant="h5" sx={{ fontWeight: 800, color: stat.color }}>
                            {loading ? <Skeleton width={30} /> : stat.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                    </Paper>
                ))}
            </Box>

            {/* Filters Card */}
            <Card sx={{ mb: 2 }}>
                <Box sx={{ p: 2 }}>
                    <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                        <Tab label="All Users" />
                        <Tab label="Women" />
                        <Tab label="Parents" />
                        <Tab label="Admins" />
                    </Tabs>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                            placeholder="Search by name, email, or phone..."
                            value={filters.search}
                            onChange={(e) => dispatch(setSearch(e.target.value))}
                            sx={{ flex: 1, minWidth: 250 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <FormControl sx={{ minWidth: 150 }}>
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
                        <Tooltip title="Refresh">
                            <IconButton onClick={fetchUsersData} disabled={loading}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Card>

            {/* Users Table */}
            <Card sx={{ flex: 1, overflow: 'hidden' }}>
                <TableContainer sx={{ height: '100%' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Contact</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Verified</TableCell>
                                <TableCell>Joined</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && users.length === 0 ? (
                                [...Array(5)].map((_, index) => (
                                    <TableRow key={index}>
                                        {[...Array(7)].map((_, i) => (
                                            <TableCell key={i}><Skeleton /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary">No users found</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {filters.search ? 'Try a different search term' : 'No users match your filters'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} hover>
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
                                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={user.isActive ? <ActiveIcon sx={{ fontSize: 16 }} /> : <InactiveIcon sx={{ fontSize: 16 }} />}
                                                label={user.isActive ? 'Active' : 'Inactive'}
                                                size="small"
                                                sx={{
                                                    bgcolor: user.isActive ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                                                    color: user.isActive ? '#10b981' : '#ef4444',
                                                    fontWeight: 600,
                                                    '& .MuiChip-icon': {
                                                        color: 'inherit',
                                                    },
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {user.isVerified ? (
                                                <Chip
                                                    icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
                                                    label="Verified"
                                                    size="small"
                                                    sx={{
                                                        bgcolor: alpha('#10b981', 0.1),
                                                        color: '#10b981',
                                                        fontWeight: 600,
                                                    }}
                                                />
                                            ) : (
                                                <Chip
                                                    label="Pending"
                                                    size="small"
                                                    sx={{
                                                        bgcolor: alpha('#f59e0b', 0.1),
                                                        color: '#f59e0b',
                                                        fontWeight: 600,
                                                    }}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption" color="text.secondary">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                                                <MoreVertIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
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

            {/* Actions Menu */}
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

            {/* Delete Confirmation */}
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

            {/* User Detail Drawer */}
            <Drawer
                anchor="right"
                open={detailDrawer.open}
                onClose={() => setDetailDrawer({ open: false, user: null })}
                PaperProps={{ sx: { width: 400 } }}
            >
                {detailDrawer.user && (
                    <Box>
                        <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant="h6">User Details</Typography>
                                <IconButton sx={{ color: 'white' }} onClick={() => setDetailDrawer({ open: false, user: null })}>
                                    ×
                                </IconButton>
                            </Box>
                        </Box>
                        <Box sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Avatar sx={{ width: 64, height: 64, bgcolor: roleConfig[detailDrawer.user.role]?.color || 'primary.main', fontSize: '1.5rem' }}>
                                    {detailDrawer.user.firstName?.charAt(0) || detailDrawer.user.email?.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" fontWeight={700}>
                                        {detailDrawer.user.firstName ? `${detailDrawer.user.firstName} ${detailDrawer.user.lastName || ''}` : 'No name'}
                                    </Typography>
                                    {getRoleBadge(detailDrawer.user.role)}
                                </Box>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>EMAIL</Typography>
                                <Typography variant="body2">{detailDrawer.user.email || 'Not provided'}</Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>PHONE</Typography>
                                <Typography variant="body2">{detailDrawer.user.phone || 'Not provided'}</Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>STATUS</Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    <Chip
                                        icon={detailDrawer.user.isActive ? <ActiveIcon sx={{ fontSize: 16 }} /> : <InactiveIcon sx={{ fontSize: 16 }} />}
                                        label={detailDrawer.user.isActive ? 'Active' : 'Inactive'}
                                        size="small"
                                        sx={{
                                            bgcolor: detailDrawer.user.isActive ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                                            color: detailDrawer.user.isActive ? '#10b981' : '#ef4444',
                                        }}
                                    />
                                </Box>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>VERIFICATION</Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    <Chip
                                        icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
                                        label={detailDrawer.user.isVerified ? 'Verified' : 'Pending'}
                                        size="small"
                                        sx={{
                                            bgcolor: detailDrawer.user.isVerified ? alpha('#10b981', 0.1) : alpha('#f59e0b', 0.1),
                                            color: detailDrawer.user.isVerified ? '#10b981' : '#f59e0b',
                                        }}
                                    />
                                </Box>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>JOINED</Typography>
                                <Typography variant="body2">
                                    {detailDrawer.user.createdAt ? new Date(detailDrawer.user.createdAt).toLocaleString() : 'Unknown'}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button fullWidth variant="outlined" startIcon={<ViewIcon />} onClick={() => {
                                    setDetailDrawer({ open: false, user: null });
                                    navigate(`/users/${detailDrawer.user.id}`);
                                }}>
                                    Full Profile
                                </Button>
                                <Button fullWidth variant="outlined" startIcon={<EditIcon />} onClick={() => {
                                    setDetailDrawer({ open: false, user: null });
                                    navigate(`/users/${detailDrawer.user.id}?edit=true`);
                                }}>
                                    Edit
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Drawer>
        </Box>
    );
};

export default Users;

import React, { useEffect } from 'react';
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
    Select,
    Drawer,
    Alert,
    Skeleton,
} from '@mui/material';
import {
    Search as SearchIcon,
    MoreVert as MoreVertIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, setFilters, setSearch, setRoleFilter, setPage, setRowsPerPage, deleteUser } from '../store/slices/usersSlice';

// Role colors will be fetched from API configuration
const roleColors = {
    woman: '#ec4899',
    parent: '#10b981',
    guardian: '#f59e0b',
    admin: '#6366f1',
};

const Users = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { users, loading, filters, totalCount } = useSelector((state) => state.users);

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [deleteDialog, setDeleteDialog] = React.useState({ open: false, user: null });

    const fetchUsersData = React.useCallback(() => {
        dispatch(fetchUsers({
            page: filters.page + 1,
            limit: filters.rowsPerPage,
            search: filters.search || undefined,
            role: filters.role !== 'all' ? filters.role : undefined,
        }));
    }, [dispatch, filters]);

    React.useEffect(() => {
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
        if (selectedUser) {
            navigate(`/users/${selectedUser.id}`);
        }
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
            fetchUsersData(); // Refresh the list
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            (user.firstName || '').toLowerCase().includes(filters.search.toLowerCase()) ||
            (user.lastName || '').toLowerCase().includes(filters.search.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(filters.search.toLowerCase());
        const matchesRole = filters.role === 'all' || user.role === filters.role;
        return matchesSearch && matchesRole;
    });

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Users
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage all registered users
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />}>
                    Add User
                </Button>
            </Box>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                            placeholder="Search users..."
                            value={filters.search}
                            onChange={(e) => dispatch(setSearch(e.target.value))}
                            sx={{ flex: 1, minWidth: 250 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <FormControl sx={{ minWidth: 150 }}>
                            <Select
                                value={filters.role}
                                onChange={(e) => dispatch(setRoleFilter(e.target.value))}
                                displayEmpty
                            >
                                <MenuItem value="all">All Roles</MenuItem>
                                <MenuItem value="woman">Women</MenuItem>
                                <MenuItem value="parent">Parents</MenuItem>
                                <MenuItem value="guardian">Guardians</MenuItem>
                                <MenuItem value="admin">Admins</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Verified</TableCell>
                                <TableCell>Joined</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                [...Array(5)].map((_, index) => (
                                    <TableRow key={index}>
                                        {[...Array(8)].map((_, i) => (
                                            <TableCell key={i}><Skeleton /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No users found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.slice(filters.page * filters.rowsPerPage, filters.page * filters.rowsPerPage + filters.rowsPerPage).map((user) => (
                                        <TableRow key={user.id} hover>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {user.firstName} {user.lastName}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.phone}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: `${roleColors[user.role]}20`,
                                                        color: roleColors[user.role],
                                                        fontWeight: 500,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.isActive ? 'Active' : 'Inactive'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: user.isActive ? 'success.main' : 'error.main',
                                                        color: 'white',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.isVerified ? 'Verified' : 'Pending'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: user.isVerified ? 'success.main' : 'warning.main',
                                                        color: 'white',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>{user.createdAt}</TableCell>
                                            <TableCell align="right">
                                                <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                                                    <MoreVertIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )
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
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleView}>
                    <ViewIcon sx={{ mr: 1 }} fontSize="small" />
                    View Details
                </MenuItem>
                <MenuItem onClick={handleEdit}>
                    <EditIcon sx={{ mr: 1 }} fontSize="small" />
                    Edit User
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                    <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
                    Delete User
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Drawer */}
            <Drawer
                anchor="bottom"
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, user: null })}
            >
                <Box sx={{ p: 3, width: 400 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Confirm Delete</Typography>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Are you sure you want to delete {deleteDialog.user?.firstName} {deleteDialog.user?.lastName}? This action cannot be undone.
                    </Alert>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button onClick={() => setDeleteDialog({ open: false, user: null })}>Cancel</Button>
                        <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
                    </Box>
                </Box>
            </Drawer>
        </Box>
    );
};

export default Users;

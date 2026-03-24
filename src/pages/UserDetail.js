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
    Avatar,
    TextField,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    CalendarToday as CalendarIcon,
    Security as SecurityIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserById, updateUser, clearSelectedUser, deleteUser } from '../store/slices/usersSlice';

const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { selectedUser: user, loading, error } = useSelector((state) => state.users);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [localError, setLocalError] = useState(null);

    const fetchUser = useCallback(() => {
        dispatch(fetchUserById(id));
    }, [dispatch, id]);

    useEffect(() => {
        fetchUser();
        return () => {
            dispatch(clearSelectedUser());
        };
    }, [fetchUser, dispatch]);

    // Sync user data to form
    useEffect(() => {
        if (user) {
            setFormData(user);
        }
    }, [user]);

    const handleSave = async () => {
        try {
            await dispatch(updateUser({ id, data: formData })).unwrap();
            setEditMode(false);
        } catch (err) {
            console.log('Error updating user:', err);
            setLocalError('Failed to update user');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await dispatch(deleteUser(id)).unwrap();
                navigate('/users');
            } catch (err) {
                console.log('Error deleting user:', err);
                setLocalError('Failed to delete user');
            }
        }
    };

    const roleColors = {
        woman: '#ec4899',
        parent: '#10b981',
        guardian: '#f59e0b',
        admin: '#6366f1',
    };

    if (loading && !user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/users')}
                        startIcon={<ArrowBackIcon />}
                    >
                        Back
                    </Button>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        User Details
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchUser}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                    {!editMode ? (
                        <>
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={() => setEditMode(true)}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={handleDelete}
                            >
                                Delete
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outlined"
                                onClick={() => setEditMode(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSave}
                                disabled={loading}
                            >
                                Save Changes
                            </Button>
                        </>
                    )}
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {localError && <Alert severity="error" sx={{ mb: 2 }}>{localError}</Alert>}

            <Grid container spacing={3}>
                {/* Profile Card */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <Avatar
                                sx={{
                                    width: 120,
                                    height: 120,
                                    mx: 'auto',
                                    mb: 2,
                                    bgcolor: roleColors[user.role],
                                    fontSize: 48,
                                }}
                            >
                                {user.firstName[0]}{user.lastName[0]}
                            </Avatar>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                {user.firstName} {user.lastName}
                            </Typography>
                            <Chip
                                label={user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                                sx={{
                                    bgcolor: `${roleColors[user.role]}20`,
                                    color: roleColors[user.role],
                                    fontWeight: 600,
                                    mb: 2,
                                }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <Chip
                                    label={user.isActive ? 'Active' : 'Inactive'}
                                    size="small"
                                    sx={{
                                        bgcolor: user.isActive ? 'success.main' : 'error.main',
                                        color: 'white',
                                    }}
                                />
                                <Chip
                                    label={user.isVerified ? 'Verified' : 'Pending'}
                                    size="small"
                                    sx={{
                                        bgcolor: user.isVerified ? 'success.main' : 'warning.main',
                                        color: 'white',
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Details Card */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                User Information
                            </Typography>

                            {editMode ? (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="First Name"
                                            value={formData.firstName || ''}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Last Name"
                                            value={formData.lastName || ''}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            value={formData.email || ''}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Phone"
                                            value={formData.phone || ''}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="Role"
                                            value={formData.role || 'woman'}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            SelectProps={{ native: true }}
                                        >
                                            <option value="woman">Woman</option>
                                            <option value="parent">Parent</option>
                                            <option value="guardian">Guardian</option>
                                            <option value="admin">Admin</option>
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="Status"
                                            value={formData.isActive ? 'active' : 'inactive'}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                                            SelectProps={{ native: true }}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </TextField>
                                    </Grid>
                                </Grid>
                            ) : (
                                <Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <EmailIcon color="action" fontSize="small" />
                                                <Typography variant="body2" color="text.secondary">
                                                    Email
                                                </Typography>
                                            </Box>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {user.email}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <PhoneIcon color="action" fontSize="small" />
                                                <Typography variant="body2" color="text.secondary">
                                                    Phone
                                                </Typography>
                                            </Box>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {user.phone}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <CalendarIcon color="action" fontSize="small" />
                                                <Typography variant="body2" color="text.secondary">
                                                    Joined Date
                                                </Typography>
                                            </Box>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {user.createdAt}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <SecurityIcon color="action" fontSize="small" />
                                                <Typography variant="body2" color="text.secondary">
                                                    Role
                                                </Typography>
                                            </Box>
                                            <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                                                {user.role}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                    {/* Statistics Card */}
                    <Card sx={{ mt: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                Statistics
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                            {user.familyMembers}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Family Members
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                                            {user.children}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Children
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                                            12
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Chats
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                                            5
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Alerts
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default UserDetail;

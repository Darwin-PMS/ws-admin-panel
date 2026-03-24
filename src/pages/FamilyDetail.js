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
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Divider,
    IconButton,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Person as PersonIcon,
    LocationOn as LocationIcon,
    Refresh as RefreshIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
} from '@mui/icons-material';
import { adminApi } from '../services/api';

const roleColors = {
    owner: '#6366f1',
    admin: '#10b981',
    member: '#f59e0b',
    parent: '#ec4899',
    guardian: '#8b5cf6',
};

const FamilyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [family, setFamily] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFamily = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminApi.getFamilyById(id);
            if (response.data.success) {
                setFamily(response.data.family);
                setMembers(response.data.members || []);
            } else {
                setError('Family not found');
            }
        } catch (err) {
            console.error('Error fetching family:', err);
            setError('Failed to fetch family details');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchFamily();
    }, [fetchFamily]);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this family? All family data will be lost.')) {
            try {
                await adminApi.deleteFamily(id);
                navigate('/families');
            } catch (err) {
                console.error('Error deleting family:', err);
                setError('Failed to delete family');
            }
        }
    };

    const getMemberRoleColor = (role) => {
        return roleColors[role?.toLowerCase()] || '#6366f1';
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error && !family) {
        return (
            <Box>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button onClick={() => navigate('/families')}>Back to Families</Button>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/families')}
                        startIcon={<ArrowBackIcon />}
                    >
                        Back
                    </Button>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {family?.name || 'Family Details'}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchFamily}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Family Information</Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Family Name</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {family?.name || 'Not specified'}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary">Description</Typography>
                                    <Typography variant="body2">
                                        {family?.description || 'No description'}
                                    </Typography>
                                </Box>

                                <Divider />

                                <Box>
                                    <Typography variant="caption" color="text.secondary">Created By</Typography>
                                    <Typography variant="body1">
                                        {family?.creator_first_name && family?.creator_last_name
                                            ? `${family.creator_first_name} ${family.creator_last_name}`
                                            : family?.creator_email || 'Unknown'}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary">Status</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Chip
                                            label={family?.status === 'active' ? 'Active' : 'Inactive'}
                                            size="small"
                                            sx={{
                                                bgcolor: family?.status === 'active' ? 'success.main' : 'text.secondary',
                                                color: 'white',
                                                fontWeight: 500
                                            }}
                                        />
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary">Created At</Typography>
                                    <Typography variant="body2">
                                        {family?.created_at ? new Date(family.created_at).toLocaleDateString() : 'Unknown'}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary">Members Count</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                        {members.length}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Quick Stats</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Total Members</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{members.length}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Owners</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {members.filter(m => m.role === 'owner').length}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Parents</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {members.filter(m => m.role === 'parent').length}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Guardians</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {members.filter(m => m.role === 'guardian').length}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Family Members</Typography>
                                <Button size="small" variant="outlined">
                                    Add Member
                                </Button>
                            </Box>

                            {members.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No members found
                                    </Typography>
                                </Box>
                            ) : (
                                <List>
                                    {members.map((member, index) => (
                                        <React.Fragment key={member.user_id || member.id || index}>
                                            <ListItem
                                                secondaryAction={
                                                    <Box>
                                                        <IconButton size="small">
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton size="small" color="error">
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Box>
                                                }
                                            >
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: getMemberRoleColor(member.role) }}>
                                                        <PersonIcon />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={`${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Unknown User'}
                                                    secondary={
                                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                                            {member.email && (
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                    <EmailIcon sx={{ fontSize: 14 }} />
                                                                    <Typography variant="caption">{member.email}</Typography>
                                                                </Box>
                                                            )}
                                                            {member.phone && (
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                    <PhoneIcon sx={{ fontSize: 14 }} />
                                                                    <Typography variant="caption">{member.phone}</Typography>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    }
                                                />
                                                <Chip
                                                    label={member.role || 'Member'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: `${getMemberRoleColor(member.role)}20`,
                                                        color: getMemberRoleColor(member.role),
                                                        fontWeight: 500,
                                                        mr: 2
                                                    }}
                                                />
                                            </ListItem>
                                            {index < members.length - 1 && <Divider variant="inset" component="li" />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default FamilyDetail;

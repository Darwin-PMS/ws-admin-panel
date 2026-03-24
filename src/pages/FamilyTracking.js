import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Chip,
    CircularProgress,
    Alert,
    TextField,
    InputAdornment,
    IconButton,
    Tooltip,
    Badge,
} from '@mui/material';
import {
    Search as SearchIcon,
    Group as GroupIcon,
    LocationOn as LocationIcon,
    Refresh as RefreshIcon,
    Person as PersonIcon,
    Navigation as NavigationIcon,
    MyLocation as MyLocationIcon,
} from '@mui/icons-material';
import { adminApi } from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedFamily } from '../store/slices/trackingSlice';

const FamilyTracking = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { locations, selectedFamily } = useSelector((state) => state.tracking);
    const [families, setFamilies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [familyMembers, setFamilyMembers] = useState({});

    const fetchFamilies = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminApi.getFamilies({ status: 'active', limit: 100 });
            if (response.data.success) {
                setFamilies(response.data.families || response.data.data || []);
            } else {
                setFamilies(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching families:', err);
            setError('Failed to fetch families');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFamilies();
    }, [fetchFamilies]);

    const handleTrackFamily = async (family) => {
        try {
            dispatch(setSelectedFamily(family));
            const response = await adminApi.getFamilyLocations(family.id);
            if (response.data.locations) {
                setFamilyMembers((prev) => ({ ...prev, [family.id]: response.data.locations }));
            }
            navigate('/tracking/live');
        } catch (err) {
            console.error('Error tracking family:', err);
            setError('Failed to load family locations');
        }
    };

    const getMemberCount = async (familyId) => {
        try {
            const response = await adminApi.getFamilyById(familyId);
            return response.data.members?.length || 0;
        } catch {
            return 0;
        }
    };

    const filteredFamilies = families.filter((family) =>
        family.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        family.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getFamilyMemberCount = (familyId) => {
        const members = familyMembers[familyId];
        if (Array.isArray(members)) return members.length;
        return '-';
    };

    const getFamilyOnlineCount = (familyId) => {
        const members = familyMembers[familyId];
        if (!Array.isArray(members)) return '-';
        return members.filter((m) => m.last_updated && 
            (Date.now() - new Date(m.last_updated).getTime()) < 300000).length;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <GroupIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Family Tracking
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchFamilies}
                >
                    Refresh
                </Button>
            </Box>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Select a family to view all members' real-time locations on the map.
                        Click "Track" to see family members on the live tracking map.
                    </Typography>
                    <TextField
                        fullWidth
                        placeholder="Search families..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </CardContent>
            </Card>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {filteredFamilies.length === 0 ? (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                            {searchTerm ? 'No families found matching your search.' : 'No families available.'}
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {filteredFamilies.map((family) => (
                        <Grid item xs={12} sm={6} md={4} key={family.id}>
                            <Card sx={{ 
                                height: '100%',
                                transition: 'all 0.2s',
                                border: selectedFamily?.id === family.id ? '2px solid' : 'none',
                                borderColor: 'primary.main',
                            }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                <GroupIcon />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    {family.name}
                                                </Typography>
                                                <Chip
                                                    label={family.status === 'active' ? 'Active' : 'Inactive'}
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: '0.7rem',
                                                        bgcolor: family.status === 'active' ? 'success.main' : 'text.secondary',
                                                        color: 'white',
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>

                                    {family.description && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {family.description}
                                        </Typography>
                                    )}

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Members
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {getFamilyMemberCount(family.id)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Online Now
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main' }}>
                                                {getFamilyOnlineCount(family.id)}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<LocationIcon />}
                                            onClick={() => handleTrackFamily(family)}
                                        >
                                            Track
                                        </Button>
                                        <Tooltip title="View Details">
                                            <IconButton
                                                onClick={() => navigate(`/families/${family.id}`)}
                                            >
                                                <PersonIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default FamilyTracking;

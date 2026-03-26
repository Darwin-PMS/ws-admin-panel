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
    LinearProgress,
    Collapse,
    Divider,
} from '@mui/material';
import {
    Search as SearchIcon,
    Group as GroupIcon,
    LocationOn as LocationIcon,
    Refresh as RefreshIcon,
    Person as PersonIcon,
    Navigation as NavigationIcon,
    MyLocation as MyLocationIcon,
    FamilyRestroom as FamilyRestroomIcon,
    ExitToApp as LeaveIcon,
    Warning as WarningIcon,
    CheckCircle as CheckIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { adminApi } from '../services/api';
import { demoFamiliesData } from '../services/demoDataService';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedFamily } from '../store/slices/trackingSlice';
import UserDetailDrawer from '../components/Tracking/UserDetailDrawer';

const FamilyTracking = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { locations, selectedFamily } = useSelector((state) => state.tracking);
    const [families, setFamilies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [familyMembers, setFamilyMembers] = useState({});
    const [membersLoading, setMembersLoading] = useState({});
    const [expandedFamily, setExpandedFamily] = useState(null);
    const [useDemoData, setUseDemoData] = useState(false);
    
    // Drawer state
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const fetchFamilies = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminApi.getFamilies();
            
            if (response.data && (response.data.success === true || response.data.families || response.data.data)) {
                const allFamilies = response.data.families || response.data.data || [];
                const activeFamilies = allFamilies.filter(f => f.status === 'active' || f.status === undefined);
                setFamilies(activeFamilies);
                setUseDemoData(false);
            } else if (response.data && Array.isArray(response.data)) {
                setFamilies(response.data.filter(f => f.status === 'active' || f.status === undefined));
                setUseDemoData(false);
            } else {
                throw new Error('Invalid response data');
            }
        } catch (err) {
            console.warn('API unavailable or error, using demo data:', err.message || err);
            setError(null);
            setUseDemoData(true);
            const demoFamilies = [];
            const familyNames = ['Sharma Family', 'Patel Family', 'Singh Family', 'Kumar Family', 'Williams Family'];
            const firstNames = ['Rahul', 'Priya', 'Amit', 'Sunita', 'Vikram'];
            const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Verma'];
            const relations = ['Father', 'Mother', 'Son', 'Daughter', 'Spouse'];
            const cities = [
                { city: 'Delhi', lat: 28.6139, lng: 77.2090 },
                { city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
                { city: 'Bangalore', lat: 12.9716, lng: 77.5946 },
            ];
            
            familyNames.forEach((name, index) => {
                const memberCount = Math.floor(Math.random() * 3) + 2;
                const members = [];
                for (let i = 0; i < memberCount; i++) {
                    const loc = cities[Math.floor(Math.random() * cities.length)];
                    const isOnline = Math.random() > 0.3;
                    members.push({
                        id: `member-${index}-${i}`,
                        user_id: `user-${index}-${i}`,
                        first_name: firstNames[i % firstNames.length],
                        last_name: lastNames[i % lastNames.length],
                        name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
                        relation: relations[i % relations.length],
                        is_online: isOnline,
                        latitude: loc.lat + (Math.random() - 0.5) * 0.05,
                        longitude: loc.lng + (Math.random() - 0.5) * 0.05,
                        address: loc.city,
                        last_updated: isOnline ? new Date().toISOString() : new Date(Date.now() - 3600000).toISOString(),
                    });
                }
                demoFamilies.push({
                    id: index + 1,
                    name: name,
                    status: 'active',
                    member_count: memberCount,
                    members: members,
                });
            });
            
            setFamilies(demoFamilies);
            console.log('Loaded demo families:', demoFamilies.length);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFamilies();
    }, [fetchFamilies]);

    // Load members for all families on mount
    useEffect(() => {
        families.forEach(async (family) => {
            if (!familyMembers[family.id]) {
                loadFamilyMembers(family.id);
            }
        });
    }, [families]);

    const handleTrackFamily = async (family) => {
        try {
            dispatch(setSelectedFamily(family));
            const response = await adminApi.getFamilyLocations(family.id);
            if (response.data.locations || response.data.members) {
                setFamilyMembers((prev) => ({
                    ...prev,
                    [family.id]: response.data.locations || response.data.members
                }));
            }
            navigate('/tracking/live');
        } catch (err) {
            console.error('Error tracking family:', err);
            setError('Failed to load family locations');
        }
    };

    const loadFamilyMembers = async (familyId) => {
        if (familyMembers[familyId]) return;
        
        setMembersLoading(prev => ({ ...prev, [familyId]: true }));
        try {
            const response = await adminApi.getFamilyById(familyId).catch(() => {
                // Use demo data as fallback
                const demoFamily = demoFamiliesData.getFamilyById(familyId);
                return { data: demoFamily || { members: [] } };
            });
            
            if (response.data.success || response.data.members || response.data.family_members) {
                const members = response.data.members || response.data.family_members || [];
                setFamilyMembers(prev => ({ ...prev, [familyId]: members }));
            }
        } catch (err) {
            console.warn('Using demo family members:', err.message);
            // Try demo data
            const demoFamily = demoFamiliesData.getFamilyById(familyId);
            if (demoFamily?.members) {
                setFamilyMembers(prev => ({ ...prev, [familyId]: demoFamily.members }));
            }
        } finally {
            setMembersLoading(prev => ({ ...prev, [familyId]: false }));
        }
    };

    const handleToggleExpand = (familyId) => {
        if (expandedFamily === familyId) {
            setExpandedFamily(null);
        } else {
            setExpandedFamily(familyId);
            loadFamilyMembers(familyId);
        }
    };

    const handleOpenUserDrawer = (userId) => {
        setSelectedUserId(userId);
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedUserId(null);
    };

    const filteredFamilies = families.filter((family) =>
        family.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        family.family_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        family.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getFamilyMemberCount = (familyId) => {
        const members = familyMembers[familyId];
        if (Array.isArray(members)) return members.length;
        
        // Try to get from family object
        const family = families.find(f => f.id === familyId);
        if (family?.members) return family.members.length;
        if (family?.member_count) return family.member_count;
        return 0;
    };

    const getFamilyOnlineCount = (familyId) => {
        const members = familyMembers[familyId];
        if (Array.isArray(members)) {
            return members.filter((m) => m.is_online || (m.last_updated && 
                (Date.now() - new Date(m.last_updated).getTime()) < 300000)).length;
        }
        
        // Try from family object
        const family = families.find(f => f.id === familyId);
        if (family?.members) {
            return family.members.filter((m) => m.is_online).length;
        }
        return 0;
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
                    {useDemoData && (
                        <Chip 
                            label="Demo Data" 
                            color="warning" 
                            size="small"
                            sx={{ ml: 1 }}
                        />
                    )}
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
                        {useDemoData 
                            ? 'Showing demo data. Connect to backend API for real data.'
                            : 'Select a family to view all members\' real-time locations on the map.'
                        }
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
                                                    {family.name || family.family_name || 'Family'}
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

                                    {(family.description || family.head_name) && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {family.description || `Head: ${family.head_name}`}
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

                                    {membersLoading[family.id] && (
                                        <LinearProgress sx={{ mb: 2 }} />
                                    )}

                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<LocationIcon />}
                                            onClick={() => handleTrackFamily(family)}
                                        >
                                            Track
                                        </Button>
                                        <Tooltip title={expandedFamily === family.id ? 'Collapse' : 'View Members'}>
                                            <IconButton
                                                onClick={() => handleToggleExpand(family.id)}
                                            >
                                                {expandedFamily === family.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="View Details">
                                            <IconButton
                                                onClick={() => navigate(`/families/${family.id}`)}
                                            >
                                                <PersonIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>

                                    {/* Expandable Members List */}
                                    <Collapse in={expandedFamily === family.id}>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Family Members</Typography>
                                        {familyMembers[family.id]?.length > 0 ? (
                                            <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                                                {familyMembers[family.id].map((member, idx) => (
                                                    <ListItem
                                                        key={idx}
                                                        sx={{
                                                            cursor: 'pointer',
                                                            '&:hover': { bgcolor: 'action.hover' },
                                                            borderRadius: 1,
                                                            mb: 0.5
                                                        }}
                                                        onClick={() => handleOpenUserDrawer(member.id || member.user_id)}
                                                    >
                                                        <ListItemAvatar>
                                                            <Avatar
                                                                src={member.profile_photo || member.avatar || `https://i.pravatar.cc/150?u=${member.id}`}
                                                                sx={{ width: 32, height: 32 }}
                                                            >
                                                                <PersonIcon />
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={member.name || member.first_name ? `${member.first_name} ${member.last_name || ''}` : 'Member'}
                                                            secondary={member.relation || member.relationship || 'Member'}
                                                        />
                                                        {member.is_online || (member.last_updated &&
                                                            (Date.now() - new Date(member.last_updated).getTime()) < 300000) ? (
                                                            <Chip
                                                                size="small"
                                                                label="Online"
                                                                color="success"
                                                                sx={{ height: 20, fontSize: '0.65rem' }}
                                                            />
                                                        ) : (
                                                            <Chip
                                                                size="small"
                                                                label="Offline"
                                                                sx={{ height: 20, fontSize: '0.65rem' }}
                                                            />
                                                        )}
                                                    </ListItem>
                                                ))}
                                            </List>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                                No members found
                                            </Typography>
                                        )}
                                    </Collapse>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <UserDetailDrawer
                open={drawerOpen}
                onClose={handleCloseDrawer}
                userId={selectedUserId}
            />
        </Box>
    );
};

export default FamilyTracking;
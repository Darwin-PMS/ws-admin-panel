import React, { useEffect, useCallback, useState } from 'react';
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
    Grid,
    Skeleton,
    Drawer,
    FormControl,
    InputLabel,
    Select,
    Divider,
    Alert,
    CircularProgress,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    alpha,
    Tooltip,
    Badge,
} from '@mui/material';
import {
    Search as SearchIcon,
    MoreVert as MoreVertIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    FamilyRestroom as FamilyIcon,
    Person as PersonIcon,
    Refresh as RefreshIcon,
    Close as CloseIcon,
    Verified as VerifiedIcon,
    Groups as GroupsIcon,
    PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchFamilies,
    setSearch,
    setPage,
    setRowsPerPage,
    deleteFamily,
    createFamily,
    updateFamily,
    fetchFamilyById,
    clearSelectedFamily
} from '../store/slices/familiesSlice';

const FamilyManagement = () => {
    const dispatch = useDispatch();
    const { families, loading, filters, totalCount, selectedFamily, familyMembers } = useSelector((state) => state.families);

    const page = filters.page;
    const rowsPerPage = filters.rowsPerPage;
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedFamilyForMenu, setSelectedFamilyForMenu] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, family: null });
    const [createDialog, setCreateDialog] = useState({ open: false, loading: false });
    const [editDialog, setEditDialog] = useState({ open: false, loading: false, family: null });
    const [viewDialog, setViewDialog] = useState({ open: false, loading: false });

    const [formData, setFormData] = useState({ name: '', description: '', status: 'active' });
    const [formErrors, setFormErrors] = useState({});

    const fetchFamiliesData = useCallback(() => {
        dispatch(fetchFamilies());
    }, [dispatch]);

    useEffect(() => {
        fetchFamiliesData();
    }, [fetchFamiliesData]);

    useEffect(() => {
        return () => {
            dispatch(clearSelectedFamily());
        };
    }, [dispatch]);

    const handleMenuOpen = (event, family) => {
        setAnchorEl(event.currentTarget);
        setSelectedFamilyForMenu(family);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDelete = () => {
        handleMenuClose();
        setDeleteDialog({ open: true, family: selectedFamilyForMenu });
    };

    const confirmDelete = async () => {
        try {
            await dispatch(deleteFamily(deleteDialog.family?.id)).unwrap();
            setDeleteDialog({ open: false, family: null });
            fetchFamiliesData();
        } catch (err) {
            console.error('Error deleting family:', err);
        }
    };

    const handleViewOpen = async () => {
        handleMenuClose();
        if (selectedFamilyForMenu) {
            setViewDialog({ open: true, loading: true });
            try {
                await dispatch(fetchFamilyById(selectedFamilyForMenu.id));
            } catch (err) {
                console.error('Error fetching family details:', err);
            }
            setViewDialog({ open: true, loading: false });
        }
    };

    const handleViewClose = () => {
        setViewDialog({ open: false, loading: false });
        dispatch(clearSelectedFamily());
    };

    const handleCreateOpen = () => {
        setFormData({ name: '', description: '', status: 'active' });
        setFormErrors({});
        setCreateDialog({ open: true, loading: false });
    };

    const handleCreateClose = () => {
        setCreateDialog({ open: false, loading: false });
        setFormErrors({});
    };

    const handleCreateSubmit = async () => {
        if (!formData.name?.trim()) {
            setFormErrors({ name: 'Family name is required' });
            return;
        }
        setCreateDialog(prev => ({ ...prev, loading: true }));
        try {
            await dispatch(createFamily(formData)).unwrap();
            handleCreateClose();
            fetchFamiliesData();
        } catch (err) {
            console.error('Error creating family:', err);
            setFormErrors({ submit: err.message || 'Failed to create family' });
        } finally {
            setCreateDialog(prev => ({ ...prev, loading: false }));
        }
    };

    const handleEditOpen = () => {
        handleMenuClose();
        if (selectedFamilyForMenu) {
            setFormData({
                name: selectedFamilyForMenu.name || '',
                description: selectedFamilyForMenu.description || '',
                status: selectedFamilyForMenu.status || 'active',
            });
            setFormErrors({});
            setEditDialog({ open: true, loading: false, family: selectedFamilyForMenu });
        }
    };

    const handleEditClose = () => {
        setEditDialog({ open: false, loading: false, family: null });
        setFormErrors({});
    };

    const handleEditSubmit = async () => {
        if (!formData.name?.trim()) {
            setFormErrors({ name: 'Family name is required' });
            return;
        }
        setEditDialog(prev => ({ ...prev, loading: true }));
        try {
            await dispatch(updateFamily({ id: editDialog.family?.id, data: formData })).unwrap();
            handleEditClose();
            fetchFamiliesData();
        } catch (err) {
            console.error('Error updating family:', err);
            setFormErrors({ submit: err.message || 'Failed to update family' });
        } finally {
            setEditDialog(prev => ({ ...prev, loading: false }));
        }
    };

    const filteredFamilies = families.filter(family =>
        (family.name || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (family.creatorName || '').toLowerCase().includes(filters.search.toLowerCase())
    );

    const totalMembers = families.reduce((acc, f) => acc + (f.memberCount || 0), 0);
    const activeFamilies = families.filter(f => f.status === 'active').length;

    return (
        <Box sx={{ minHeight: 'calc(100vh - 120px)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>Family Management</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">Manage family groups and their members</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button 
                        variant="outlined" 
                        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />} 
                        onClick={fetchFamiliesData} 
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />} 
                        onClick={handleCreateOpen}
                        sx={{ fontWeight: 600 }}
                    >
                        Create Family
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: 'primary.main', boxShadow: 1 }
                        }}
                    >
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: alpha('#6366f1', 0.1),
                                color: '#6366f1',
                            }}
                        >
                            <GroupsIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#6366f1', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : families.length}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Total Families</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: 'secondary.main', boxShadow: 1 }
                        }}
                    >
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: alpha('#ec4899', 0.1),
                                color: '#ec4899',
                            }}
                        >
                            <PersonIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#ec4899', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : totalMembers}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Total Members</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: 'success.main', boxShadow: 1 }
                        }}
                    >
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: alpha('#10b981', 0.1),
                                color: '#10b981',
                            }}
                        >
                            <VerifiedIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : activeFamilies}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Active Families</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: 'warning.main', boxShadow: 1 }
                        }}
                    >
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: alpha('#f59e0b', 0.1),
                                color: '#f59e0b',
                            }}
                        >
                            <PersonAddIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : families.length > 0 ? Math.round(totalMembers / families.length) : 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Avg Members</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Card sx={{ mb: 3 }}>
                <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search by family name or creator..."
                        value={filters.search}
                        onChange={(e) => dispatch(setSearch(e.target.value))}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                            endAdornment: filters.search && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => dispatch(setSearch(''))}>
                                        <CloseIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ maxWidth: 400 }}
                    />
                    <Chip
                        label={`${filteredFamilies.length} ${filteredFamilies.length === 1 ? 'family' : 'families'}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                    />
                </Box>
            </Card>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'background.default' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Family</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Creator</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Members</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && families.length === 0 ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        {[...Array(6)].map((_, j) => (
                                            <TableCell key={j}><Skeleton /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : filteredFamilies.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <Box
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                borderRadius: '50%',
                                                bgcolor: filters.search ? alpha('#f59e0b', 0.1) : alpha('#6366f1', 0.1),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mx: 'auto',
                                                mb: 2,
                                            }}
                                        >
                                            {filters.search ? (
                                                <SearchIcon sx={{ fontSize: 48, color: '#f59e0b' }} />
                                            ) : (
                                                <FamilyIcon sx={{ fontSize: 48, color: '#6366f1' }} />
                                            )}
                                        </Box>
                                        <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                                            {filters.search ? 'No Matching Families' : 'No Families Yet'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {filters.search 
                                                ? `No families match "${filters.search}"` 
                                                : 'Create your first family to get started'}
                                        </Typography>
                                        {filters.search ? (
                                            <Button variant="text" onClick={() => dispatch(setSearch(''))}>
                                                Clear Search
                                            </Button>
                                        ) : (
                                            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateOpen}>
                                                Create Family
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredFamilies.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((family) => (
                                    <TableRow 
                                        key={family.id} 
                                        hover
                                        sx={{ 
                                            cursor: 'pointer',
                                            transition: 'background-color 0.15s',
                                            '&:hover': { bgcolor: alpha('#6366f1', 0.04) }
                                        }}
                                        onClick={() => {
                                            setSelectedFamilyForMenu(family);
                                            handleViewOpen();
                                        }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar 
                                                    sx={{ 
                                                        bgcolor: family.status === 'active' ? 'primary.main' : 'grey.400',
                                                        width: 40,
                                                        height: 40,
                                                    }}
                                                >
                                                    <FamilyIcon />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {family.name || 'Unnamed Family'}
                                                    </Typography>
                                                    {family.code && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                                            {family.code}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{family.creatorName || 'Unknown'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                icon={<PersonIcon sx={{ fontSize: 14 }} />} 
                                                label={family.memberCount || 0} 
                                                size="small" 
                                                variant="outlined"
                                                sx={{ fontWeight: 500 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={(family.status || 'active').charAt(0).toUpperCase() + (family.status || 'active').slice(1)} 
                                                size="small"
                                                sx={{ 
                                                    bgcolor: family.status === 'active' ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                                                    color: family.status === 'active' ? '#10b981' : '#ef4444',
                                                    fontWeight: 600,
                                                }} 
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption" color="text.secondary">
                                                {family.createdAt ? new Date(family.createdAt).toLocaleDateString() : 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                            <Tooltip title="More actions">
                                                <IconButton onClick={(e) => handleMenuOpen(e, family)}>
                                                    <MoreVertIcon />
                                                </IconButton>
                                            </Tooltip>
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
                    page={page}
                    onPageChange={(e, newPage) => dispatch(setPage(newPage))}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => { dispatch(setRowsPerPage(parseInt(e.target.value, 10))); dispatch(setPage(0)); }}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                />
            </Card>

            <Menu 
                anchorEl={anchorEl} 
                open={Boolean(anchorEl)} 
                onClose={handleMenuClose}
                PaperProps={{ sx: { borderRadius: 2, minWidth: 160 } }}
            >
                <MenuItem onClick={handleViewOpen} sx={{ borderRadius: 1, mx: 1, mb: 0.5 }}>
                    <ViewIcon sx={{ mr: 1.5, fontSize: 20 }} /> View Details
                </MenuItem>
                <MenuItem onClick={handleEditOpen} sx={{ borderRadius: 1, mx: 1, mb: 0.5 }}>
                    <EditIcon sx={{ mr: 1.5, fontSize: 20 }} /> Edit
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main', borderRadius: 1, mx: 1 }}>
                    <DeleteIcon sx={{ mr: 1.5, fontSize: 20 }} /> Delete
                </MenuItem>
            </Menu>

            <Drawer
                anchor="bottom"
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, family: null })}
                PaperProps={{ sx: { borderRadius: '16px 16px 0 0', p: 3 } }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' }}>
                        <DeleteIcon />
                    </Box>
                    <Box>
                        <Typography variant="h6">Delete Family</Typography>
                        <Typography variant="caption" color="text.secondary">
                            This action cannot be undone
                        </Typography>
                    </Box>
                </Box>
                <Alert severity="error" sx={{ mb: 3 }}>
                    Are you sure you want to delete "{deleteDialog.family?.name}"? All family data will be permanently removed.
                </Alert>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Button 
                            fullWidth 
                            variant="outlined"
                            onClick={() => setDeleteDialog({ open: false, family: null })}
                        >
                            Cancel
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button 
                            fullWidth 
                            variant="contained" 
                            color="error" 
                            onClick={confirmDelete}
                            disabled={loading}
                        >
                            Delete
                        </Button>
                    </Grid>
                </Grid>
            </Drawer>

            <Drawer 
                anchor="right" 
                open={createDialog.open} 
                onClose={handleCreateClose}
                PaperProps={{ sx: { width: { xs: '100%', sm: 450 } } }}
            >
                <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }}>
                                <AddIcon />
                            </Box>
                            <Typography variant="h6">Create Family</Typography>
                        </Box>
                        <IconButton onClick={handleCreateClose}><CloseIcon /></IconButton>
                    </Box>
                    
                    {formErrors.submit && (
                        <Alert severity="error" sx={{ mb: 2 }}>{formErrors.submit}</Alert>
                    )}
                    
                    <Box sx={{ flex: 1 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField 
                                    fullWidth 
                                    label="Family Name" 
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    error={!!formErrors.name} 
                                    helperText={formErrors.name} 
                                    required
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField 
                                    fullWidth 
                                    label="Description" 
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} 
                                    multiline 
                                    rows={3}
                                    size="small"
                                    placeholder="Optional description for this family group"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select 
                                        value={formData.status} 
                                        label="Status"
                                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                    >
                                        <MenuItem value="active">
                                            <Chip label="Active" size="small" sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981' }} />
                                        </MenuItem>
                                        <MenuItem value="inactive">
                                            <Chip label="Inactive" size="small" sx={{ bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' }} />
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                        <Button 
                            onClick={handleCreateClose} 
                            disabled={createDialog.loading} 
                            fullWidth
                            variant="outlined"
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="contained" 
                            onClick={handleCreateSubmit} 
                            disabled={createDialog.loading}
                            startIcon={createDialog.loading && <CircularProgress size={18} color="inherit" />} 
                            fullWidth
                        >
                            {createDialog.loading ? 'Creating...' : 'Create Family'}
                        </Button>
                    </Box>
                </Box>
            </Drawer>

            <Drawer 
                anchor="right" 
                open={editDialog.open} 
                onClose={handleEditClose}
                PaperProps={{ sx: { width: { xs: '100%', sm: 450 } } }}
            >
                <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b' }}>
                                <EditIcon />
                            </Box>
                            <Typography variant="h6">Edit Family</Typography>
                        </Box>
                        <IconButton onClick={handleEditClose}><CloseIcon /></IconButton>
                    </Box>
                    
                    {formErrors.submit && (
                        <Alert severity="error" sx={{ mb: 2 }}>{formErrors.submit}</Alert>
                    )}
                    
                    <Box sx={{ flex: 1 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField 
                                    fullWidth 
                                    label="Family Name" 
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    error={!!formErrors.name} 
                                    helperText={formErrors.name} 
                                    required
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField 
                                    fullWidth 
                                    label="Description" 
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} 
                                    multiline 
                                    rows={3}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select 
                                        value={formData.status} 
                                        label="Status"
                                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                    >
                                        <MenuItem value="active">
                                            <Chip label="Active" size="small" sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981' }} />
                                        </MenuItem>
                                        <MenuItem value="inactive">
                                            <Chip label="Inactive" size="small" sx={{ bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' }} />
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                        <Button 
                            onClick={handleEditClose} 
                            disabled={editDialog.loading} 
                            fullWidth
                            variant="outlined"
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="contained" 
                            onClick={handleEditSubmit} 
                            disabled={editDialog.loading}
                            startIcon={editDialog.loading && <CircularProgress size={18} color="inherit" />} 
                            fullWidth
                        >
                            {editDialog.loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Box>
                </Box>
            </Drawer>

            <Drawer 
                anchor="right" 
                open={viewDialog.open} 
                onClose={handleViewClose}
                PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}
            >
                {viewDialog.loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                    </Box>
                ) : selectedFamily ? (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ 
                            p: 3, 
                            borderBottom: 1, 
                            borderColor: 'divider',
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            position: 'sticky',
                            top: 0,
                            bgcolor: 'background.paper',
                            zIndex: 1,
                        }}>
                            <Typography variant="h6">Family Details</Typography>
                            <IconButton onClick={handleViewClose}><CloseIcon /></IconButton>
                        </Box>

                        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                            <Card variant="outlined" sx={{ mb: 3 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <Avatar 
                                            sx={{ 
                                                width: 64, 
                                                height: 64, 
                                                bgcolor: selectedFamily.status === 'active' ? 'primary.main' : 'grey.400',
                                                fontSize: '1.5rem'
                                            }}
                                        >
                                            <FamilyIcon sx={{ fontSize: 32 }} />
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                                {selectedFamily.name || 'Unnamed Family'}
                                            </Typography>
                                            <Chip 
                                                label={(selectedFamily.status || 'active').charAt(0).toUpperCase() + (selectedFamily.status || 'active').slice(1)} 
                                                size="small"
                                                sx={{ 
                                                    mt: 0.5,
                                                    bgcolor: selectedFamily.status === 'active' ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                                                    color: selectedFamily.status === 'active' ? '#10b981' : '#ef4444',
                                                    fontWeight: 600,
                                                }} 
                                            />
                                        </Box>
                                    </Box>
                                    {selectedFamily.code && (
                                        <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                Family Code
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, letterSpacing: 1 }}>
                                                {selectedFamily.code}
                                            </Typography>
                                        </Paper>
                                    )}
                                    {selectedFamily.description && (
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedFamily.description}
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>

                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={6}>
                                    <Paper 
                                        variant="outlined" 
                                        sx={{ 
                                            p: 2.5, 
                                            textAlign: 'center',
                                            borderRadius: 2,
                                            transition: 'all 0.2s',
                                            '&:hover': { borderColor: 'primary.main' }
                                        }}
                                    >
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                            {selectedFamily.memberCount || 0}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">Members</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6}>
                                    <Paper 
                                        variant="outlined" 
                                        sx={{ 
                                            p: 2.5, 
                                            textAlign: 'center',
                                            borderRadius: 2,
                                            transition: 'all 0.2s',
                                            '&:hover': { borderColor: 'secondary.main' }
                                        }}
                                    >
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                                            {selectedFamily.locationCount || 0}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">Locations</Typography>
                                    </Paper>
                                </Grid>
                            </Grid>

                            <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>CREATOR</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                        <PersonIcon sx={{ fontSize: 18 }} />
                                    </Avatar>
                                    <Typography variant="body2" fontWeight={500}>
                                        {selectedFamily.creatorName || 'Unknown'}
                                    </Typography>
                                </Box>
                            </Paper>

                            <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>CREATED</Typography>
                                </Box>
                                <Typography variant="body2">
                                    {selectedFamily.createdAt ? new Date(selectedFamily.createdAt).toLocaleString() : 'N/A'}
                                </Typography>
                            </Paper>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Family Members ({familyMembers.length})
                                </Typography>
                            </Box>

                            {familyMembers.length > 0 ? (
                                <List 
                                    dense 
                                    sx={{ 
                                        bgcolor: 'background.default', 
                                        borderRadius: 2,
                                        overflow: 'hidden'
                                    }}
                                >
                                    {familyMembers.map((member, index) => (
                                        <React.Fragment key={member.id || index}>
                                            <ListItem sx={{ py: 1.5 }}>
                                                <ListItemAvatar>
                                                    <Avatar 
                                                        sx={{ 
                                                            width: 36, 
                                                            height: 36, 
                                                            bgcolor: 'primary.main',
                                                            fontSize: '0.875rem'
                                                        }}
                                                    >
                                                        {(member.name || 'U').charAt(0)}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {member.name || 'Unknown'}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                                            {member.email && (
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {member.email}
                                                                </Typography>
                                                            )}
                                                            {member.phone && (
                                                                <Typography variant="caption" color="text.secondary">
                                                                    • {member.phone}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    }
                                                />
                                                <Chip 
                                                    label={member.role || 'Member'} 
                                                    size="small" 
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.7rem' }}
                                                />
                                            </ListItem>
                                            {index < familyMembers.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            ) : (
                                <Paper 
                                    variant="outlined" 
                                    sx={{ 
                                        p: 3, 
                                        textAlign: 'center',
                                        borderRadius: 2,
                                        bgcolor: 'background.default'
                                    }}
                                >
                                    <PersonIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        No members in this family
                                    </Typography>
                                </Paper>
                            )}
                        </Box>

                        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Button 
                                        fullWidth 
                                        variant="outlined" 
                                        onClick={handleViewClose}
                                    >
                                        Close
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button 
                                        variant="contained" 
                                        startIcon={<EditIcon />} 
                                        onClick={() => {
                                            setSelectedFamilyForMenu(selectedFamily);
                                            setFormData({
                                                name: selectedFamily.name || '',
                                                description: selectedFamily.description || '',
                                                status: selectedFamily.status || 'active',
                                            });
                                            handleViewClose();
                                            setTimeout(() => {
                                                setEditDialog({ open: true, loading: false, family: selectedFamily });
                                            }, 100);
                                        }} 
                                        fullWidth
                                    >
                                        Edit
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ p: 4 }}>
                        <Alert severity="error">Failed to load family details</Alert>
                    </Box>
                )}
            </Drawer>
        </Box>
    );
};

export default FamilyManagement;

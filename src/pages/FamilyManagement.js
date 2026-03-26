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

    // View Details
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

    // Create
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

    // Edit
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

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Families</Typography>
                    <Typography variant="body2" color="text.secondary">Manage family groups and their members</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchFamiliesData} disabled={loading}>Refresh</Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateOpen}>Create Family</Button>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Card><CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {loading ? <Skeleton variant="circular" width={48} height={48} /> : (
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.main', color: 'white' }}><FamilyIcon /></Box>
                        )}
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>{loading ? <Skeleton width={40} /> : families.length}</Typography>
                            <Typography variant="body2" color="text.secondary">Total Families</Typography>
                        </Box>
                    </CardContent></Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card><CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {loading ? <Skeleton variant="circular" width={48} height={48} /> : (
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'secondary.main', color: 'white' }}><PersonIcon /></Box>
                        )}
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>{loading ? <Skeleton width={40} /> : totalMembers}</Typography>
                            <Typography variant="body2" color="text.secondary">Total Members</Typography>
                        </Box>
                    </CardContent></Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card><CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {loading ? <Skeleton variant="circular" width={48} height={48} /> : (
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.main', color: 'white' }}><VerifiedIcon /></Box>
                        )}
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>{loading ? <Skeleton width={40} /> : families.filter(f => f.status === 'active').length}</Typography>
                            <Typography variant="body2" color="text.secondary">Active Families</Typography>
                        </Box>
                    </CardContent></Card>
                </Grid>
            </Grid>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <TextField
                        fullWidth
                        placeholder="Search by family name or creator..."
                        value={filters.search}
                        onChange={(e) => dispatch(setSearch(e.target.value))}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                    />
                </CardContent>
            </Card>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Family</TableCell>
                                <TableCell>Creator</TableCell>
                                <TableCell>Members</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && families.length === 0 ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        {[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}
                                    </TableRow>
                                ))
                            ) : filteredFamilies.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <FamilyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                        <Typography variant="body1" color="text.secondary">
                                            {filters.search ? 'No families match your search' : 'No families found'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredFamilies.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((family) => (
                                    <TableRow key={family.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ bgcolor: 'primary.main' }}><FamilyIcon /></Avatar>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{family.name || 'Unnamed Family'}</Typography>
                                                    {family.code && <Typography variant="caption" color="text.secondary">Code: {family.code}</Typography>}
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell><Typography variant="body2">{family.creatorName || 'Unknown'}</Typography></TableCell>
                                        <TableCell>
                                            <Chip icon={<PersonIcon sx={{ fontSize: 16 }} />} label={family.memberCount || 0} size="small" color="primary" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={(family.status || 'active').charAt(0).toUpperCase() + (family.status || 'active').slice(1)} size="small"
                                                sx={{ bgcolor: family.status === 'active' ? 'success.main' : 'error.main', color: 'white', fontWeight: 600 }} />
                                        </TableCell>
                                        <TableCell><Typography variant="caption" color="text.secondary">{family.createdAt || 'N/A'}</Typography></TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={(e) => handleMenuOpen(e, family)}><MoreVertIcon /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div" count={totalCount} page={page}
                    onPageChange={(e, newPage) => dispatch(setPage(newPage))}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => { dispatch(setRowsPerPage(parseInt(e.target.value, 10))); dispatch(setPage(0)); }}
                />
            </Card>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleViewOpen}><ViewIcon sx={{ mr: 1 }} fontSize="small" /> View Details</MenuItem>
                <MenuItem onClick={handleEditOpen}><EditIcon sx={{ mr: 1 }} fontSize="small" /> Edit</MenuItem>
                <Divider />
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}><DeleteIcon sx={{ mr: 1 }} fontSize="small" /> Delete</MenuItem>
            </Menu>

            {/* Delete Dialog */}
            <Drawer anchor="bottom" open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, family: null })}>
                <Box sx={{ p: 3, width: 400 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Confirm Delete</Typography>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        Are you sure you want to delete "{deleteDialog.family?.name}"? This action cannot be undone.
                    </Alert>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button onClick={() => setDeleteDialog({ open: false, family: null })}>Cancel</Button>
                        <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
                    </Box>
                </Box>
            </Drawer>

            {/* Create Dialog */}
            <Drawer anchor="right" open={createDialog.open} onClose={handleCreateClose}>
                <Box sx={{ width: 450, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">Create Family</Typography>
                        <IconButton onClick={handleCreateClose}><CloseIcon /></IconButton>
                    </Box>
                    {formErrors.submit && <Alert severity="error" sx={{ mb: 2 }}>{formErrors.submit}</Alert>}
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Family Name" value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                error={!!formErrors.name} helperText={formErrors.name} required />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Description" value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} multiline rows={3} />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select value={formData.status} label="Status"
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}>
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Button onClick={handleCreateClose} disabled={createDialog.loading} fullWidth>Cancel</Button>
                        <Button variant="contained" onClick={handleCreateSubmit} disabled={createDialog.loading}
                            startIcon={createDialog.loading && <CircularProgress size={20} />} fullWidth>
                            {createDialog.loading ? 'Creating...' : 'Create'}
                        </Button>
                    </Box>
                </Box>
            </Drawer>

            {/* Edit Dialog */}
            <Drawer anchor="right" open={editDialog.open} onClose={handleEditClose}>
                <Box sx={{ width: 450, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">Edit Family</Typography>
                        <IconButton onClick={handleEditClose}><CloseIcon /></IconButton>
                    </Box>
                    {formErrors.submit && <Alert severity="error" sx={{ mb: 2 }}>{formErrors.submit}</Alert>}
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Family Name" value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                error={!!formErrors.name} helperText={formErrors.name} required />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Description" value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} multiline rows={3} />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select value={formData.status} label="Status"
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}>
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Button onClick={handleEditClose} disabled={editDialog.loading} fullWidth>Cancel</Button>
                        <Button variant="contained" onClick={handleEditSubmit} disabled={editDialog.loading}
                            startIcon={editDialog.loading && <CircularProgress size={20} />} fullWidth>
                            {editDialog.loading ? 'Saving...' : 'Save'}
                        </Button>
                    </Box>
                </Box>
            </Drawer>

            {/* View Details Dialog */}
            <Drawer anchor="right" open={viewDialog.open} onClose={handleViewClose}>
                <Box sx={{ width: 500, p: 3, height: '100%', overflow: 'auto' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">Family Details</Typography>
                        <IconButton onClick={handleViewClose}><CloseIcon /></IconButton>
                    </Box>

                    {viewDialog.loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                    ) : selectedFamily ? (
                        <>
                            <Card variant="outlined" sx={{ mb: 3 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                                            <FamilyIcon sx={{ fontSize: 28 }} />
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedFamily.name || 'Unnamed Family'}</Typography>
                                            <Chip label={(selectedFamily.status || 'active').toUpperCase()} size="small"
                                                sx={{ bgcolor: selectedFamily.status === 'active' ? 'success.main' : 'error.main', color: 'white', fontWeight: 600, mt: 0.5 }} />
                                        </Box>
                                    </Box>
                                    {selectedFamily.code && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                            Family Code: {selectedFamily.code}
                                        </Typography>
                                    )}
                                    {selectedFamily.description && (
                                        <Typography variant="body2" color="text.secondary">{selectedFamily.description}</Typography>
                                    )}
                                </CardContent>
                            </Card>

                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={6}>
                                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>{selectedFamily.memberCount || 0}</Typography>
                                        <Typography variant="caption" color="text.secondary">Members</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6}>
                                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>{selectedFamily.locationCount || 0}</Typography>
                                        <Typography variant="caption" color="text.secondary">Locations</Typography>
                                    </Paper>
                                </Grid>
                            </Grid>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>Creator</Typography>
                                <Typography variant="body2">{selectedFamily.creatorName || 'Unknown'}</Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>Created</Typography>
                                <Typography variant="body2">{selectedFamily.createdAt || 'N/A'}</Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" sx={{ mb: 2 }}>Family Members ({familyMembers.length})</Typography>

                            {familyMembers.length > 0 ? (
                                <List dense>
                                    {familyMembers.map((member, index) => (
                                        <React.Fragment key={member.id || index}>
                                            <ListItem>
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                        <PersonIcon />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={member.name || 'Unknown'}
                                                    secondary={
                                                        <>
                                                            {member.email && <Typography variant="caption" display="block">{member.email}</Typography>}
                                                            {member.phone && <Typography variant="caption" display="block">{member.phone}</Typography>}
                                                            <Chip label={member.role || 'Member'} size="small" sx={{ mt: 0.5 }} />
                                                        </>
                                                    }
                                                />
                                            </ListItem>
                                            {index < familyMembers.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            ) : (
                                <Typography variant="body2" color="text.secondary">No members found</Typography>
                            )}

                            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                                <Button onClick={handleViewClose} fullWidth variant="outlined">Close</Button>
                                <Button variant="contained" startIcon={<EditIcon />} onClick={() => {
                                    handleViewClose();
                                    setSelectedFamilyForMenu(selectedFamily);
                                    setFormData({
                                        name: selectedFamily.name || '',
                                        description: selectedFamily.description || '',
                                        status: selectedFamily.status || 'active',
                                    });
                                    setEditDialog({ open: true, loading: false, family: selectedFamily });
                                }} fullWidth>Edit</Button>
                            </Box>
                        </>
                    ) : (
                        <Alert severity="error">Failed to load family details</Alert>
                    )}
                </Box>
            </Drawer>
        </Box>
    );
};

export default FamilyManagement;

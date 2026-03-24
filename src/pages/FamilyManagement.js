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
    const { families, loading, filters, totalCount, selectedFamily, error } = useSelector((state) => state.families);

    // Use Redux filters for pagination
    const page = filters.page;
    const rowsPerPage = filters.rowsPerPage;
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedFamilyForMenu, setSelectedFamilyForMenu] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, family: null });

    // CRUD Dialogs
    const [createDialog, setCreateDialog] = useState({ open: false, loading: false });
    const [editDialog, setEditDialog] = useState({ open: false, loading: false, family: null });
    const [viewDialog, setViewDialog] = useState({ open: false, family: null, loading: false });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        owner: '',
        ownerEmail: '',
        ownerPhone: '',
        members: 2,
        children: 0,
        address: '',
        status: 'active',
    });

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
            await dispatch(deleteFamily(deleteDialog.family.id)).unwrap();
            setDeleteDialog({ open: false, family: null });
            fetchFamiliesData();
        } catch (error) {
            console.error('Error deleting family:', error);
        }
    };

    // Create Family handlers
    const handleCreateOpen = () => {
        setFormData({
            name: '',
            owner: '',
            ownerEmail: '',
            ownerPhone: '',
            members: 2,
            children: 0,
            address: '',
            status: 'active',
        });
        setFormErrors({});
        setCreateDialog({ open: true, loading: false });
    };

    const handleCreateClose = () => {
        setCreateDialog({ open: false, loading: false });
        setFormErrors({});
    };

    const validateForm = (data) => {
        const errors = {};
        if (!data.name.trim()) errors.name = 'Family name is required';
        if (!data.owner.trim()) errors.owner = 'Owner name is required';
        if (!data.ownerEmail.trim()) {
            errors.ownerEmail = 'Owner email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.ownerEmail)) {
            errors.ownerEmail = 'Invalid email format';
        }
        if (!data.ownerPhone.trim()) {
            errors.ownerPhone = 'Owner phone is required';
        } else if (!/^\+?[\d\s-]{10,}$/.test(data.ownerPhone.replace(/\s/g, ''))) {
            errors.ownerPhone = 'Invalid phone format';
        }
        if (data.members < 1) errors.members = 'At least 1 member is required';
        if (data.children < 0) errors.children = 'Children count cannot be negative';
        return errors;
    };

    const handleCreateSubmit = async () => {
        const errors = validateForm(formData);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setCreateDialog({ ...createDialog, loading: true });

        try {
            const newFamily = {
                name: formData.name,
                owner: formData.owner,
                ownerEmail: formData.ownerEmail,
                ownerPhone: formData.ownerPhone,
                members: parseInt(formData.members, 10),
                children: parseInt(formData.children, 10),
                address: formData.address,
                status: formData.status,
                createdAt: new Date().toLocaleDateString(),
            };

            await dispatch(createFamily(newFamily)).unwrap();
            handleCreateClose();
            fetchFamiliesData();
        } catch (error) {
            console.error('Error creating family:', error);
            setFormErrors({ submit: error.message || 'Failed to create family' });
        } finally {
            setCreateDialog({ ...createDialog, loading: false });
        }
    };

    // Edit Family handlers
    const handleEditOpen = () => {
        handleMenuClose();
        if (selectedFamilyForMenu) {
            setFormData({
                name: selectedFamilyForMenu.name || '',
                owner: selectedFamilyForMenu.owner || '',
                ownerEmail: selectedFamilyForMenu.ownerEmail || '',
                ownerPhone: selectedFamilyForMenu.ownerPhone || '',
                members: selectedFamilyForMenu.members || 2,
                children: selectedFamilyForMenu.children || 0,
                address: selectedFamilyForMenu.address || '',
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
        const errors = validateForm(formData);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setEditDialog({ ...editDialog, loading: true });

        try {
            const updatedFamily = {
                name: formData.name,
                owner: formData.owner,
                ownerEmail: formData.ownerEmail,
                ownerPhone: formData.ownerPhone,
                members: parseInt(formData.members, 10),
                children: parseInt(formData.children, 10),
                address: formData.address,
                status: formData.status,
            };

            await dispatch(updateFamily({ id: editDialog.family.id, data: updatedFamily })).unwrap();
            handleEditClose();
            fetchFamiliesData();
        } catch (error) {
            console.error('Error updating family:', error);
            setFormErrors({ submit: error.message || 'Failed to update family' });
        } finally {
            setEditDialog({ ...editDialog, loading: false });
        }
    };

    // View Details handlers
    const handleViewOpen = async () => {
        handleMenuClose();
        if (selectedFamilyForMenu) {
            setViewDialog({ open: true, family: selectedFamilyForMenu, loading: true });
            try {
                await dispatch(fetchFamilyById(selectedFamilyForMenu.id)).unwrap();
            } catch (error) {
                console.error('Error fetching family details:', error);
            } finally {
                setViewDialog({ ...viewDialog, loading: false });
            }
        }
    };

    const handleViewClose = () => {
        setViewDialog({ open: false, family: null, loading: false });
        dispatch(clearSelectedFamily());
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const filteredFamilies = families.filter(family =>
        (family.name || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (family.owner || '').toLowerCase().includes(filters.search.toLowerCase())
    );

    const totalMembers = families.reduce((acc, f) => acc + (f.members || 0), 0);
    const totalChildren = families.reduce((acc, f) => acc + (f.children || 0), 0);

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Families
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage family groups and their members
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchFamiliesData} disabled={loading}>
                        Refresh
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateOpen}>
                        Create Family
                    </Button>
                </Box>
            </Box>

            {/* Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {loading ? <Skeleton variant="circular" width={48} height={48} /> : (
                                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.main', color: 'white' }}>
                                    <FamilyIcon />
                                </Box>
                            )}
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {loading ? <Skeleton width={40} /> : families.length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Families
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {loading ? <Skeleton variant="circular" width={48} height={48} /> : (
                                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'secondary.main', color: 'white' }}>
                                    <PersonIcon />
                                </Box>
                            )}
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {loading ? <Skeleton width={40} /> : totalMembers}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Members
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {loading ? <Skeleton variant="circular" width={48} height={48} /> : (
                                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.main', color: 'white' }}>
                                    <PersonIcon />
                                </Box>
                            )}
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {loading ? <Skeleton width={40} /> : totalChildren}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Children
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Search */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <TextField
                        fullWidth
                        placeholder="Search families..."
                        value={filters.search}
                        onChange={(e) => dispatch(setSearch(e.target.value))}
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

            {/* Families Table */}
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Family Name</TableCell>
                                <TableCell>Owner</TableCell>
                                <TableCell>Members</TableCell>
                                <TableCell>Children</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredFamilies.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((family) => (
                                <TableRow key={family.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <FamilyIcon color="primary" />
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {family.name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{family.owner}</TableCell>
                                    <TableCell>
                                        <Chip label={family.members} size="small" color="primary" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={family.children} size="small" color="secondary" variant="outlined" />
                                    </TableCell>
                                    <TableCell>{family.createdAt}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={family.status}
                                            size="small"
                                            sx={{
                                                bgcolor: family.status === 'active' ? 'success.main' : 'error.main',
                                                color: 'white',
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={(e) => handleMenuOpen(e, family)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredFamilies.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body1" color="text.secondary">
                                            No families found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
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
                <MenuItem onClick={handleViewOpen}>
                    <ViewIcon sx={{ mr: 1 }} fontSize="small" />
                    View Details
                </MenuItem>
                <MenuItem onClick={handleEditOpen}>
                    <EditIcon sx={{ mr: 1 }} fontSize="small" />
                    Edit Family
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                    <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
                    Delete Family
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Drawer */}
            <Drawer
                anchor="bottom"
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, family: null })}
            >
                <Box sx={{ p: 3, width: 400 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Confirm Delete</Typography>
                    <Typography sx={{ mb: 3 }}>
                        Are you sure you want to delete the family "{deleteDialog.family?.name}"? This action cannot be undone.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button onClick={() => setDeleteDialog({ open: false, family: null })}>Cancel</Button>
                        <Button onClick={confirmDelete} color="error" variant="contained">
                            Delete
                        </Button>
                    </Box>
                </Box>
            </Drawer>

            {/* Create Family Drawer */}
            <Drawer
                anchor="right"
                open={createDialog.open}
                onClose={handleCreateClose}
            >
                <Box sx={{ width: 500, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">Create New Family</Typography>
                        <IconButton onClick={handleCreateClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    {formErrors.submit && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {formErrors.submit}
                        </Alert>
                    )}
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Family Name"
                                value={formData.name}
                                onChange={(e) => handleFormChange('name', e.target.value)}
                                error={!!formErrors.name}
                                helperText={formErrors.name}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Owner Name"
                                value={formData.owner}
                                onChange={(e) => handleFormChange('owner', e.target.value)}
                                error={!!formErrors.owner}
                                helperText={formErrors.owner}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Owner Email"
                                type="email"
                                value={formData.ownerEmail}
                                onChange={(e) => handleFormChange('ownerEmail', e.target.value)}
                                error={!!formErrors.ownerEmail}
                                helperText={formErrors.ownerEmail}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Owner Phone"
                                value={formData.ownerPhone}
                                onChange={(e) => handleFormChange('ownerPhone', e.target.value)}
                                error={!!formErrors.ownerPhone}
                                helperText={formErrors.ownerPhone}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Number of Members"
                                type="number"
                                value={formData.members}
                                onChange={(e) => handleFormChange('members', e.target.value)}
                                error={!!formErrors.members}
                                helperText={formErrors.members}
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Number of Children"
                                type="number"
                                value={formData.children}
                                onChange={(e) => handleFormChange('children', e.target.value)}
                                error={!!formErrors.children}
                                helperText={formErrors.children}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Address"
                                multiline
                                rows={2}
                                value={formData.address}
                                onChange={(e) => handleFormChange('address', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={formData.status}
                                    label="Status"
                                    onChange={(e) => handleFormChange('status', e.target.value)}
                                >
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Button onClick={handleCreateClose} disabled={createDialog.loading} fullWidth>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateSubmit}
                            variant="contained"
                            disabled={createDialog.loading}
                            startIcon={createDialog.loading && <CircularProgress size={20} />}
                            fullWidth
                        >
                            {createDialog.loading ? 'Creating...' : 'Create Family'}
                        </Button>
                    </Box>
                </Box>
            </Drawer>

            {/* Edit Family Drawer */}
            <Drawer
                anchor="right"
                open={editDialog.open}
                onClose={handleEditClose}
            >
                <Box sx={{ width: 500, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">Edit Family</Typography>
                        <IconButton onClick={handleEditClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    {formErrors.submit && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {formErrors.submit}
                        </Alert>
                    )}
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Family Name"
                                value={formData.name}
                                onChange={(e) => handleFormChange('name', e.target.value)}
                                error={!!formErrors.name}
                                helperText={formErrors.name}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Owner Name"
                                value={formData.owner}
                                onChange={(e) => handleFormChange('owner', e.target.value)}
                                error={!!formErrors.owner}
                                helperText={formErrors.owner}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Owner Email"
                                type="email"
                                value={formData.ownerEmail}
                                onChange={(e) => handleFormChange('ownerEmail', e.target.value)}
                                error={!!formErrors.ownerEmail}
                                helperText={formErrors.ownerEmail}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Owner Phone"
                                value={formData.ownerPhone}
                                onChange={(e) => handleFormChange('ownerPhone', e.target.value)}
                                error={!!formErrors.ownerPhone}
                                helperText={formErrors.ownerPhone}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Number of Members"
                                type="number"
                                value={formData.members}
                                onChange={(e) => handleFormChange('members', e.target.value)}
                                error={!!formErrors.members}
                                helperText={formErrors.members}
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Number of Children"
                                type="number"
                                value={formData.children}
                                onChange={(e) => handleFormChange('children', e.target.value)}
                                error={!!formErrors.children}
                                helperText={formErrors.children}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Address"
                                multiline
                                rows={2}
                                value={formData.address}
                                onChange={(e) => handleFormChange('address', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={formData.status}
                                    label="Status"
                                    onChange={(e) => handleFormChange('status', e.target.value)}
                                >
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Button onClick={handleEditClose} disabled={editDialog.loading} fullWidth>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditSubmit}
                            variant="contained"
                            disabled={editDialog.loading}
                            startIcon={editDialog.loading && <CircularProgress size={20} />}
                            fullWidth
                        >
                            {editDialog.loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Box>
                </Box>
            </Drawer>

            {/* View Details Drawer */}
            <Drawer
                anchor="right"
                open={viewDialog.open}
                onClose={handleViewClose}
            >
                <Box sx={{ width: 500, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">Family Details</Typography>
                        <IconButton onClick={handleViewClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    {viewDialog.loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'primary.main', color: 'white' }}>
                                        <FamilyIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                            {viewDialog.family?.name}
                                        </Typography>
                                        <Chip
                                            label={viewDialog.family?.status}
                                            size="small"
                                            sx={{
                                                mt: 0.5,
                                                bgcolor: viewDialog.family?.status === 'active' ? 'success.main' : 'error.main',
                                                color: 'white',
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">Owner</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {viewDialog.family?.owner || 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">Owner Email</Typography>
                                <Typography variant="body1">
                                    {viewDialog.family?.ownerEmail || 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">Owner Phone</Typography>
                                <Typography variant="body1">
                                    {viewDialog.family?.ownerPhone || 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">Created Date</Typography>
                                <Typography variant="body1">
                                    {viewDialog.family?.createdAt || 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">Members</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {viewDialog.family?.members || 0}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">Children</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {viewDialog.family?.children || 0}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary">Address</Typography>
                                <Typography variant="body1">
                                    {viewDialog.family?.address || 'N/A'}
                                </Typography>
                            </Grid>
                        </Grid>
                    )}
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Button onClick={handleViewClose} fullWidth>Close</Button>
                        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => {
                            handleViewClose();
                            setSelectedFamilyForMenu(viewDialog.family);
                            setEditDialog({ open: true, loading: false, family: viewDialog.family });
                            setFormData({
                                name: viewDialog.family?.name || '',
                                owner: viewDialog.family?.owner || '',
                                ownerEmail: viewDialog.family?.ownerEmail || '',
                                ownerPhone: viewDialog.family?.ownerPhone || '',
                                members: viewDialog.family?.members || 2,
                                children: viewDialog.family?.children || 0,
                                address: viewDialog.family?.address || '',
                                status: viewDialog.family?.status || 'active',
                            });
                        }} fullWidth>
                            Edit
                        </Button>
                    </Box>
                </Box>
            </Drawer>
        </Box>
    );
};

export default FamilyManagement;

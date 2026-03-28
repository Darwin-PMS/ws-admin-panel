import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, IconButton, TextField, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Grid, MenuItem, CircularProgress, Alert, Snackbar, Tooltip, Card, CardContent } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon, Map as MapIcon, People as PeopleIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchZones, createZone, updateZone, deleteZone, setSearch, setTypeFilter } from '../store/slices/zonesSlice';

const ZONE_TYPES = [
    { value: 'zone', label: 'Zone', color: '#8B5CF6' },
    { value: 'district', label: 'District', color: '#3B82F6' },
    { value: 'city', label: 'City', color: '#10B981' },
    { value: 'ward', label: 'Ward', color: '#F59E0B' },
    { value: 'village', label: 'Village', color: '#EC4899' },
];

const ZoneManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { zones, loading, error, filters } = useSelector(state => state.zones);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingZone, setEditingZone] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [formData, setFormData] = useState({ name: '', type: 'zone', code: '', latitude: '', longitude: '', radius_km: '5' });

    useEffect(() => { dispatch(fetchZones()); }, [dispatch]);

    const handleOpenDialog = (zone = null) => {
        setEditingZone(zone);
        setFormData(zone ? {
            name: zone.name || '', type: zone.type || 'zone', code: zone.code || '',
            latitude: (zone.lat ?? zone.latitude)?.toString() || '', longitude: (zone.lng ?? zone.longitude)?.toString() || '', radius_km: zone.radius_km?.toString() || '5',
        } : { name: '', type: 'zone', code: '', latitude: '', longitude: '', radius_km: '5' });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => { setOpenDialog(false); setEditingZone(null); };

    const handleSave = async () => {
        const payload = {
            name: formData.name, type: formData.type, code: formData.code || undefined,
            lat: parseFloat(formData.latitude) || null, lng: parseFloat(formData.longitude) || null, radius_km: parseFloat(formData.radius_km) || 5,
        };
        try {
            const result = await dispatch(editingZone ? updateZone({ id: editingZone.id, data: payload }) : createZone(payload));
            if (result.meta.requestStatus === 'fulfilled') {
                setSnackbar({ open: true, message: editingZone ? 'Zone updated successfully' : 'Zone created successfully', severity: 'success' });
                handleCloseDialog();
            } else {
                setSnackbar({ open: true, message: result.payload || 'Failed to save zone', severity: 'error' });
            }
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to save zone', severity: 'error' });
        }
    };

    const handleDelete = async (zoneId) => {
        if (!window.confirm('Are you sure you want to delete this zone?')) return;
        try {
            const result = await dispatch(deleteZone(zoneId));
            if (result.meta.requestStatus === 'fulfilled') {
                setSnackbar({ open: true, message: 'Zone deleted successfully', severity: 'success' });
            } else {
                setSnackbar({ open: true, message: result.payload || 'Failed to delete zone', severity: 'error' });
            }
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to delete zone', severity: 'error' });
        }
    };

    const getTypeColor = (type) => ZONE_TYPES.find(t => t.value === type)?.color || '#6B7280';
    const filteredZones = zones.filter(zone =>
        (zone.name?.toLowerCase().includes(filters.search.toLowerCase()) || zone.code?.toLowerCase().includes(filters.search.toLowerCase())) &&
        (filters.type === 'all' || zone.type === filters.type)
    );

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight={600}>Zone Management</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Add Zone</Button>
            </Box>

            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField placeholder="Search zones..." size="small" value={filters.search} onChange={(e) => dispatch(setSearch(e.target.value))} sx={{ width: 300 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
                    <TextField select size="small" value={filters.type} onChange={(e) => dispatch(setTypeFilter(e.target.value))} sx={{ width: 150 }}>
                        <MenuItem value="all">All Types</MenuItem>
                        {ZONE_TYPES.map(type => <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>)}
                    </TextField>
                    <Box sx={{ flex: 1 }} />
                    <Tooltip title="Refresh"><IconButton onClick={() => dispatch(fetchZones())}><RefreshIcon /></IconButton></Tooltip>
                </CardContent>
            </Card>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Zone Name</TableCell><TableCell>Type</TableCell><TableCell>Code</TableCell>
                                <TableCell>Location</TableCell><TableCell>Radius</TableCell><TableCell>Users</TableCell>
                                <TableCell>Status</TableCell><TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredZones.length === 0 ? (
                                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}><Typography color="text.secondary">No zones found</Typography></TableCell></TableRow>
                            ) : (
                                filteredZones.map((zone) => (
                                    <TableRow key={zone.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <MapIcon sx={{ color: getTypeColor(zone.type), fontSize: 20 }} />
                                                <Typography fontWeight={500}>{zone.name}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={ZONE_TYPES.find(t => t.value === zone.type)?.label || zone.type} size="small"
                                                sx={{ bgcolor: `${getTypeColor(zone.type)}20`, color: getTypeColor(zone.type), fontWeight: 500 }} />
                                        </TableCell>
                                        <TableCell>{zone.code || '-'}</TableCell>
                                        <TableCell><Typography variant="body2" color="text.secondary">{zone.lat != null ? Number(zone.lat).toFixed(4) : 'N/A'}, {zone.lng != null ? Number(zone.lng).toFixed(4) : 'N/A'}</Typography></TableCell>
                                        <TableCell>{zone.radius_km || 5} km</TableCell>
                                        <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PeopleIcon fontSize="small" color="action" />{zone.user_count || 0}</Box></TableCell>
                                        <TableCell><Chip label={zone.is_active ? 'Active' : 'Inactive'} size="small" color={zone.is_active ? 'success' : 'default'} /></TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="View Details"><IconButton size="small" onClick={() => navigate(`/zones/${zone.id}`, { state: { zone } })}><ViewIcon /></IconButton></Tooltip>
                                            <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpenDialog(zone)}><EditIcon /></IconButton></Tooltip>
                                            <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(zone.id)}><DeleteIcon /></IconButton></Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingZone ? 'Edit Zone' : 'Create New Zone'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}><TextField fullWidth label="Zone Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth select label="Zone Type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                            {ZONE_TYPES.map(type => <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>)}
                        </TextField></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Zone Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="e.g., ND-001" /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Latitude" type="number" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} required placeholder="28.6139" /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Longitude" type="number" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} required placeholder="77.2090" /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Radius (km)" type="number" value={formData.radius_km} onChange={(e) => setFormData({ ...formData, radius_km: e.target.value })} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={!formData.name || !formData.latitude || !formData.longitude}>
                        {editingZone ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default ZoneManagement;
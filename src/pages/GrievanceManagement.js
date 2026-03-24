import React, { useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Chip,
    IconButton,
    TextField,
    Drawer,
    CircularProgress,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    CardActions,
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Visibility as VisibilityIcon,
    Delete as DeleteIcon,
    Warning as WarningIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchGrievances,
    fetchGrievanceStats,
    updateGrievanceStatus,
    deleteGrievance,
    setStatusFilter,
    setPriorityFilter,
    setPage,
    setRowsPerPage,
} from '../store/slices/grievanceSlice';

const statusColors = {
    pending: '#f59e0b',
    in_progress: '#3b82f6',
    resolved: '#10b981',
    rejected: '#ef4444',
};

const priorityColors = {
    low: '#6b7280',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444',
};

const GrievanceManagement = () => {
    const dispatch = useDispatch();
    const { grievances, stats, loading, filters, totalCount } = useSelector((state) => state.grievance);

    const [viewDialog, setViewDialog] = React.useState({ open: false, data: null });
    const [updateDialog, setUpdateDialog] = React.useState({ open: false, data: null });
    const [updateForm, setUpdateForm] = React.useState({
        status: '',
        priority: '',
        resolution_notes: '',
    });
    const [localError, setLocalError] = React.useState(null);
    const [localSuccess, setLocalSuccess] = React.useState(null);

    const fetchData = React.useCallback(() => {
        dispatch(fetchGrievances());
    }, [dispatch]);

    const fetchStats = React.useCallback(() => {
        dispatch(fetchGrievanceStats());
    }, [dispatch]);

    useEffect(() => {
        fetchData();
        fetchStats();
    }, [fetchData, fetchStats, filters.status, filters.priority, filters.page, filters.rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        dispatch(setPage(newPage));
    };

    const handleChangeRowsPerPage = (event) => {
        dispatch(setRowsPerPage(parseInt(event.target.value, 10)));
    };

    const openViewDialog = (data) => {
        setViewDialog({ open: true, data });
    };

    const closeViewDialog = () => {
        setViewDialog({ open: false, data: null });
    };

    const openUpdateDialog = (data) => {
        setUpdateForm({
            status: data.status,
            priority: data.priority,
            resolution_notes: data.resolution_notes || '',
        });
        setUpdateDialog({ open: true, data });
    };

    const closeUpdateDialog = () => {
        setUpdateDialog({ open: false, data: null });
        setUpdateForm({ status: '', priority: '', resolution_notes: '' });
    };

    const handleUpdate = async () => {
        try {
            setLocalError(null);
            setLocalSuccess(null);
            await dispatch(updateGrievanceStatus({
                id: updateDialog.data.id,
                data: updateForm
            })).unwrap();
            setLocalSuccess('Grievance updated successfully');
            closeUpdateDialog();
            fetchData();
            fetchStats();
        } catch (err) {
            setLocalError(err || 'Update failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this grievance?')) return;
        try {
            setLocalError(null);
            setLocalSuccess(null);
            await dispatch(deleteGrievance(id)).unwrap();
            setLocalSuccess('Grievance deleted successfully');
            fetchData();
            fetchStats();
        } catch (err) {
            setLocalError(err || 'Delete failed');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Grievance Management</Typography>
                    <Typography variant="body2" color="text.secondary">View and manage user complaints</Typography>
                </Box>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => { fetchData(); fetchStats(); }}>
                    Refresh
                </Button>
            </Box>

            {localError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setLocalError(null)}>{localError}</Alert>}
            {localSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setLocalSuccess(null)}>{localSuccess}</Alert>}

            {/* Stats Cards */}
            {stats && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={2}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                    {stats.total}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">Total</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: statusColors.pending }}>
                                    {stats.pending}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">Pending</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: statusColors.in_progress }}>
                                    {stats.inProgress}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">In Progress</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: statusColors.resolved }}>
                                    {stats.resolved}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">Resolved</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: priorityColors.urgent }}>
                                    {stats.urgent}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">Urgent</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: statusColors.rejected }}>
                                    {stats.rejected}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">Rejected</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Filters */}
            <Card sx={{ mb: 3, p: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Status</InputLabel>
                        <Select value={filters.status} onChange={(e) => dispatch(setStatusFilter(e.target.value))} label="Status">
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="in_progress">In Progress</MenuItem>
                            <MenuItem value="resolved">Resolved</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Priority</InputLabel>
                        <Select value={filters.priority} onChange={(e) => dispatch(setPriorityFilter(e.target.value))} label="Priority">
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="urgent">Urgent</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Card>

            {/* Table */}
            <Card>
                <CardContent>
                    {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}
                    {!loading && (
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Title</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Priority</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {grievances.map((g) => (
                                        <TableRow key={g.id} hover>
                                            <TableCell sx={{ maxWidth: 100 }}>{g.id?.substring(0, 8)}...</TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {g.user_first_name} {g.user_last_name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {g.user_email}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 200 }}>
                                                <Typography variant="body2" noWrap>{g.title}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={g.status?.replace('_', ' ')} size="small"
                                                    sx={{ bgcolor: `${statusColors[g.status]}20`, color: statusColors[g.status], textTransform: 'capitalize' }} />
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={g.priority} size="small"
                                                    sx={{ bgcolor: `${priorityColors[g.priority]}20`, color: priorityColors[g.priority], textTransform: 'capitalize' }} />
                                            </TableCell>
                                            <TableCell>{g.category || '-'}</TableCell>
                                            <TableCell>{new Date(g.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <IconButton size="small" onClick={() => openViewDialog(g)}><VisibilityIcon /></IconButton>
                                                <IconButton size="small" color="primary" onClick={() => openUpdateDialog(g)}>Edit</IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDelete(g.id)}><DeleteIcon /></IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {grievances.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                                <Typography color="text.secondary">No grievances found</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={totalCount}
                                rowsPerPage={filters.rowsPerPage}
                                page={filters.page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* View Drawer */}
            <Drawer
                anchor="right"
                open={viewDialog.open}
                onClose={closeViewDialog}
            >
                <Box sx={{ width: 500, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">Grievance Details</Typography>
                        <IconButton onClick={closeViewDialog}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    {viewDialog.data && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Chip label={viewDialog.data.status?.replace('_', ' ')} size="small"
                                    sx={{ bgcolor: `${statusColors[viewDialog.data.status]}20`, color: statusColors[viewDialog.data.status] }} />
                                <Chip label={viewDialog.data.priority} size="small"
                                    sx={{ bgcolor: `${priorityColors[viewDialog.data.priority]}20`, color: priorityColors[viewDialog.data.priority] }} />
                                <Typography variant="caption" color="text.secondary">
                                    {viewDialog.data.category || 'Uncategorized'}
                                </Typography>
                            </Box>
                            <Typography variant="h6">{viewDialog.data.title}</Typography>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Submitted By</Typography>
                                <Typography>{viewDialog.data.user_first_name} {viewDialog.data.user_last_name}</Typography>
                                <Typography variant="caption" color="text.secondary">{viewDialog.data.user_email}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                                <Typography variant="body2">{viewDialog.data.description}</Typography>
                            </Box>
                            {viewDialog.data.resolution_notes && (
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Resolution Notes</Typography>
                                    <Typography variant="body2">{viewDialog.data.resolution_notes}</Typography>
                                </Box>
                            )}
                            <Typography variant="caption" color="text.secondary">
                                Submitted: {new Date(viewDialog.data.created_at).toLocaleString()}
                            </Typography>
                        </Box>
                    )}
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Button onClick={closeViewDialog} fullWidth>Close</Button>
                        <Button variant="contained" onClick={() => { closeViewDialog(); openUpdateDialog(viewDialog.data); }} fullWidth>
                            Edit Status
                        </Button>
                    </Box>
                </Box>
            </Drawer>

            {/* Update Drawer */}
            <Drawer
                anchor="right"
                open={updateDialog.open}
                onClose={closeUpdateDialog}
            >
                <Box sx={{ width: 450, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">Update Grievance</Typography>
                        <IconButton onClick={closeUpdateDialog}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select value={updateForm.status} onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })} label="Status">
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="in_progress">In Progress</MenuItem>
                                <MenuItem value="resolved">Resolved</MenuItem>
                                <MenuItem value="rejected">Rejected</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Priority</InputLabel>
                            <Select value={updateForm.priority} onChange={(e) => setUpdateForm({ ...updateForm, priority: e.target.value })} label="Priority">
                                <MenuItem value="low">Low</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                                <MenuItem value="urgent">Urgent</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField fullWidth label="Resolution Notes" multiline rows={4}
                            value={updateForm.resolution_notes}
                            onChange={(e) => setUpdateForm({ ...updateForm, resolution_notes: e.target.value })}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Button onClick={closeUpdateDialog} fullWidth>Cancel</Button>
                        <Button variant="contained" onClick={handleUpdate} disabled={loading} fullWidth>
                            {loading ? 'Updating...' : 'Update'}
                        </Button>
                    </Box>
                </Box>
            </Drawer>
        </Box>
    );
};

export default GrievanceManagement;

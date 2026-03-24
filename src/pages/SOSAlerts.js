import React, { useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    FormControl,
    Select,
    MenuItem,
    Drawer,
    Alert,
    TextField,
    Skeleton,
    IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import {
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    LocationOn as LocationIcon,
    AccessTime as TimeIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAlerts, resolveAlert, setStatusFilter, setPage, setRowsPerPage } from '../store/slices/alertsSlice';

// Status colors
const statusColors = {
    active: '#ef4444',
    resolved: '#10b981',
};

const typeColors = {
    emergency: '#ef4444',
    distress: '#f59e0b',
    test: '#6366f1',
    medical: '#ec4899',
};

const SOSAlerts = () => {
    const dispatch = useDispatch();
    const { alerts, loading, filters, error, totalCount } = useSelector((state) => state.alerts);

    const [detailDialog, setDetailDialog] = React.useState({ open: false, alert: null });
    const [resolveDialog, setResolveDialog] = React.useState({ open: false, alert: null });

    const fetchAlertsData = React.useCallback(() => {
        dispatch(fetchAlerts({
            status: filters.status !== 'all' ? filters.status : undefined,
        }));
    }, [dispatch, filters.status]);

    React.useEffect(() => {
        fetchAlertsData();
    }, [fetchAlertsData]);

    const handleResolve = async () => {
        try {
            await dispatch(resolveAlert(resolveDialog.alert.id)).unwrap();
            setResolveDialog({ open: false, alert: null });
            fetchAlertsData();
        } catch (error) {
            console.error('Error resolving alert:', error);
        }
    };

    const filteredAlerts = alerts.filter(alert =>
        filters.status === 'all' || alert.status === filters.status
    );

    const activeAlerts = alerts.filter(a => a.status === 'active').length;
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved').length;

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        SOS Alerts
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {activeAlerts} active alerts requiring attention
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchAlertsData}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Card sx={{ flex: 1 }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'error.main', color: 'white' }}>
                            <WarningIcon />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                {loading ? <Skeleton width={40} /> : activeAlerts}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Active Alerts
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
                <Card sx={{ flex: 1 }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.main', color: 'white' }}>
                            <CheckCircleIcon />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                {loading ? <Skeleton width={40} /> : resolvedAlerts}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Resolved
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
                <Card sx={{ flex: 1 }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.main', color: 'white' }}>
                            <WarningIcon />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                {loading ? <Skeleton width={40} /> : alerts.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Alerts
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* Filter */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <FormControl sx={{ minWidth: 200 }}>
                        <Select
                            value={filters.status}
                            onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                            displayEmpty
                        >
                            <MenuItem value="all">All Status</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="resolved">Resolved</MenuItem>
                        </Select>
                    </FormControl>
                </CardContent>
            </Card>

            {/* Alerts Table */}
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Status</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Message</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>Time</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAlerts.slice(filters.page * filters.rowsPerPage, filters.page * filters.rowsPerPage + filters.rowsPerPage).map((alert) => (
                                <TableRow key={alert.id} hover>
                                    <TableCell>
                                        <Chip
                                            label={(alert.status || '').toUpperCase()}
                                            size="small"
                                            sx={{
                                                bgcolor: `${statusColors[alert.status]}20`,
                                                color: statusColors[alert.status],
                                                fontWeight: 600,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {alert.userName}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={alert.type}
                                            size="small"
                                            sx={{
                                                bgcolor: `${typeColors[alert.type]}20`,
                                                color: typeColors[alert.type],
                                                fontWeight: 500,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {alert.message}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <LocationIcon fontSize="small" color="action" />
                                            <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {alert.location}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <TimeIcon fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                {alert.createdAt}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                            <Button
                                                size="small"
                                                onClick={() => setDetailDialog({ open: true, alert })}
                                            >
                                                View
                                            </Button>
                                            {alert.status === 'active' && (
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="success"
                                                    onClick={() => setResolveDialog({ open: true, alert })}
                                                >
                                                    Resolve
                                                </Button>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
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

            {/* Detail Drawer */}
            <Drawer
                anchor="right"
                open={detailDialog.open}
                onClose={() => setDetailDialog({ open: false, alert: null })}
            >
                <Box sx={{ width: 450, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">SOS Alert Details</Typography>
                        <IconButton onClick={() => setDetailDialog({ open: false, alert: null })}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    {detailDialog.alert && (
                        <Box>
                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                <Chip
                                    label={(detailDialog.alert.status || '').toUpperCase()}
                                    sx={{
                                        bgcolor: `${statusColors[detailDialog.alert.status]}20`,
                                        color: statusColors[detailDialog.alert.status],
                                        fontWeight: 600,
                                    }}
                                />
                                <Chip
                                    label={detailDialog.alert.type}
                                    sx={{
                                        bgcolor: `${typeColors[detailDialog.alert.type]}20`,
                                        color: typeColors[detailDialog.alert.type],
                                        fontWeight: 500,
                                    }}
                                />
                            </Box>
                            <TextField
                                fullWidth
                                label="User"
                                value={detailDialog.alert.userName}
                                disabled
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Message"
                                value={detailDialog.alert.message}
                                disabled
                                multiline
                                rows={2}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Location"
                                value={detailDialog.alert.location}
                                disabled
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Time"
                                value={detailDialog.alert.createdAt}
                                disabled
                            />
                        </Box>
                    )}
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Button onClick={() => setDetailDialog({ open: false, alert: null })} fullWidth>Close</Button>
                        {detailDialog.alert?.status === 'active' && (
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => {
                                    setResolveDialog({ open: true, alert: detailDialog.alert });
                                    setDetailDialog({ open: false, alert: null });
                                }}
                                fullWidth
                            >
                                Resolve
                            </Button>
                        )}
                    </Box>
                </Box>
            </Drawer>

            {/* Resolve Drawer */}
            <Drawer
                anchor="bottom"
                open={resolveDialog.open}
                onClose={() => setResolveDialog({ open: false, alert: null })}
            >
                <Box sx={{ p: 3, width: 400 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Resolve Alert</Typography>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Are you sure you want to mark this SOS alert as resolved?
                    </Alert>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button onClick={() => setResolveDialog({ open: false, alert: null })}>Cancel</Button>
                        <Button variant="contained" color="success" onClick={handleResolve}>
                            Mark as Resolved
                        </Button>
                    </Box>
                </Box>
            </Drawer>
        </Box>
    );
};

export default SOSAlerts;

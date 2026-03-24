import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Tooltip,
    Alert,
    Snackbar,
    CircularProgress,
    Grid,
    LinearProgress,
} from '@mui/material';
import {
    Map as MapIcon,
    Route as RouteIcon,
    Warning as WarningIcon,
    Security as SecurityIcon,
    Refresh as RefreshIcon,
    FilterList as FilterIcon,
    ShowChart as ChartIcon,
} from '@mui/icons-material';
import { adminApi } from '../services/api';

const SafeRouteManagement = () => {
    const [routes, setRoutes] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [totalCount, setTotalCount] = useState(0);
    const [filter, setFilter] = useState({ userId: '', minScore: '', maxScore: '' });
    const [analyzeDialogOpen, setAnalyzeDialogOpen] = useState(false);
    const [analyzeForm, setAnalyzeForm] = useState({
        userId: '',
        originLat: '',
        originLng: '',
        originName: '',
        destLat: '',
        destLng: '',
        destName: '',
        mode: 'walking'
    });
    const [analyzeResult, setAnalyzeResult] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchRoutes = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page: page + 1, limit: rowsPerPage };
            if (filter.userId) params.userId = filter.userId;
            if (filter.minScore) params.minScore = filter.minScore;
            if (filter.maxScore) params.maxScore = filter.maxScore;
            
            const response = await adminApi.get('/admin/safe-route/all', { params });
            if (response.data.success) {
                setRoutes(response.data.data);
                setTotalCount(response.data.total);
            }
        } catch (error) {
            showSnackbar('Failed to fetch routes', 'error');
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, filter]);

    const fetchStats = async () => {
        try {
            const response = await adminApi.get('/admin/safe-route/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    useEffect(() => {
        fetchRoutes();
        fetchStats();
    }, [fetchRoutes]);

    const handleAnalyze = async () => {
        setAnalyzing(true);
        try {
            const response = await adminApi.post('/mobile/safe-route/analyze', analyzeForm);
            if (response.data.success) {
                setAnalyzeResult(response.data.data);
                fetchRoutes();
                fetchStats();
            } else {
                showSnackbar(response.data.message || 'Analysis failed', 'error');
            }
        } catch (error) {
            showSnackbar('Failed to analyze route', 'error');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleAnalyzeForUser = async () => {
        if (!analyzeForm.userId) {
            showSnackbar('Please enter a user ID', 'error');
            return;
        }
        await handleAnalyze();
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const getSafetyColor = (score) => {
        if (score >= 80) return '#10B981';
        if (score >= 60) return '#F59E0B';
        return '#EF4444';
    };

    const getSafetyLabel = (score) => {
        if (score >= 80) return 'Safe';
        if (score >= 60) return 'Moderate';
        return 'Caution';
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Safe Route Analysis
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Monitor and analyze route safety across users
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<RouteIcon />}
                    onClick={() => setAnalyzeDialogOpen(true)}
                >
                    Analyze Route
                </Button>
            </Box>

            {stats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.main', color: 'white' }}>
                                        <RouteIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {stats.totalRoutes}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Routes Analyzed
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#10B981', color: 'white' }}>
                                        <SecurityIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {stats.avgSafetyScore}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Avg Safety Score
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#6366f1', color: 'white' }}>
                                        <ChartIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {stats.safePercentage}%
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Safe Routes
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#EF4444', color: 'white' }}>
                                        <WarningIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {stats.unsafeRoutes}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Unsafe Routes
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <FilterIcon color="action" />
                        <TextField
                            label="User ID"
                            value={filter.userId}
                            onChange={(e) => setFilter({ ...filter, userId: e.target.value })}
                            size="small"
                            sx={{ minWidth: 200 }}
                        />
                        <TextField
                            label="Min Score"
                            type="number"
                            value={filter.minScore}
                            onChange={(e) => setFilter({ ...filter, minScore: e.target.value })}
                            size="small"
                            sx={{ width: 120 }}
                        />
                        <TextField
                            label="Max Score"
                            type="number"
                            value={filter.maxScore}
                            onChange={(e) => setFilter({ ...filter, maxScore: e.target.value })}
                            size="small"
                            sx={{ width: 120 }}
                        />
                        <Button variant="outlined" onClick={fetchRoutes} startIcon={<RefreshIcon />}>
                            Apply
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Origin</TableCell>
                                <TableCell>Destination</TableCell>
                                <TableCell>Mode</TableCell>
                                <TableCell>Safety Score</TableCell>
                                <TableCell>Distance</TableCell>
                                <TableCell>Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={24} />
                                    </TableCell>
                                </TableRow>
                            ) : routes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No route analysis found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                routes.map((route) => (
                                    <TableRow key={route.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {route.user?.name || route.user_id}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {route.user?.email}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {route.origin?.name || route.origin_name || 'Unknown'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {route.destination?.name || route.dest_name || 'Unknown'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={route.mode} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={`${route.safetyScore || route.safety_score}%`}
                                                size="small"
                                                sx={{
                                                    bgcolor: `${getSafetyColor(route.safetyScore || route.safety_score)}20`,
                                                    color: getSafetyColor(route.safetyScore || route.safety_score),
                                                    fontWeight: 600
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {route.distance || 0} km
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(route.createdAt || route.created_at).toLocaleDateString()}
                                            </Typography>
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
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </Card>

            <Dialog open={analyzeDialogOpen} onClose={() => setAnalyzeDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Analyze Route for User</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Target User ID (leave empty for own analysis)"
                            value={analyzeForm.userId}
                            onChange={(e) => setAnalyzeForm({ ...analyzeForm, userId: e.target.value })}
                            fullWidth
                        />
                        <Typography variant="subtitle2">Origin</Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Latitude"
                                type="number"
                                value={analyzeForm.originLat}
                                onChange={(e) => setAnalyzeForm({ ...analyzeForm, originLat: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Longitude"
                                type="number"
                                value={analyzeForm.originLng}
                                onChange={(e) => setAnalyzeForm({ ...analyzeForm, originLng: e.target.value })}
                                fullWidth
                            />
                        </Box>
                        <TextField
                            label="Origin Name"
                            value={analyzeForm.originName}
                            onChange={(e) => setAnalyzeForm({ ...analyzeForm, originName: e.target.value })}
                            fullWidth
                        />
                        <Typography variant="subtitle2">Destination</Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Latitude"
                                type="number"
                                value={analyzeForm.destLat}
                                onChange={(e) => setAnalyzeForm({ ...analyzeForm, destLat: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Longitude"
                                type="number"
                                value={analyzeForm.destLng}
                                onChange={(e) => setAnalyzeForm({ ...analyzeForm, destLng: e.target.value })}
                                fullWidth
                            />
                        </Box>
                        <TextField
                            label="Destination Name"
                            value={analyzeForm.destName}
                            onChange={(e) => setAnalyzeForm({ ...analyzeForm, destName: e.target.value })}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Travel Mode</InputLabel>
                            <Select
                                value={analyzeForm.mode}
                                onChange={(e) => setAnalyzeForm({ ...analyzeForm, mode: e.target.value })}
                                label="Travel Mode"
                            >
                                <MenuItem value="walking">Walking</MenuItem>
                                <MenuItem value="driving">Driving</MenuItem>
                                <MenuItem value="transit">Transit</MenuItem>
                            </Select>
                        </FormControl>

                        {analyzeResult && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                <Typography variant="h6" sx={{ mb: 1 }}>
                                    Analysis Result
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Typography variant="h3" sx={{ color: getSafetyColor(analyzeResult.safetyScore) }}>
                                        {analyzeResult.safetyScore}%
                                    </Typography>
                                    <Chip
                                        label={getSafetyLabel(analyzeResult.safetyScore)}
                                        sx={{
                                            bgcolor: `${getSafetyColor(analyzeResult.safetyScore)}20`,
                                            color: getSafetyColor(analyzeResult.safetyScore)
                                        }}
                                    />
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    {analyzeResult.distance} km • ~{analyzeResult.estimatedTime} min
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAnalyzeDialogOpen(false)}>Close</Button>
                    <Button
                        variant="contained"
                        onClick={handleAnalyzeForUser}
                        disabled={analyzing}
                    >
                        {analyzing ? <CircularProgress size={20} /> : 'Analyze'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SafeRouteManagement;

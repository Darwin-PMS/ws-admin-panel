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
    alpha,
    Avatar,
    CircularProgress as CircularProgressIcon,
} from '@mui/material';
import {
    Map as MapIcon,
    Route as RouteIcon,
    Warning as WarningIcon,
    Security as SecurityIcon,
    Refresh as RefreshIcon,
    FilterList as FilterIcon,
    ShowChart as ChartIcon,
    PlayArrow as AnalyzeIcon,
    DirectionsWalk as WalkIcon,
    DirectionsCar as DriveIcon,
    Train as TransitIcon,
    Speed as SpeedIcon,
    LocationOn as LocationIcon,
    AccessTime as TimeIcon,
    Straighten as DistanceIcon,
    CheckCircle as SafeIcon,
    Error as UnsafeIcon,
    TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { adminApi } from '../services/api';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip as ChartTooltip,
    Legend,
} from 'chart.js';

ChartJS.register(ArcElement, ChartTooltip, Legend);

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
            
            const response = await adminApi.safeRoute.list(params);
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
            const response = await adminApi.safeRoute.stats();
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

    const getSafetyIcon = (score) => {
        if (score >= 80) return <SafeIcon />;
        return <UnsafeIcon />;
    };

    const getModeIcon = (mode) => {
        switch (mode) {
            case 'walking': return <WalkIcon />;
            case 'driving': return <DriveIcon />;
            case 'transit': return <TransitIcon />;
            default: return <RouteIcon />;
        }
    };

    const safetyChartData = stats ? {
        labels: ['Safe Routes', 'Moderate Routes', 'Caution Routes'],
        datasets: [{
            data: [
                Math.round((stats.safePercentage || 0) * stats.totalRoutes / 100),
                Math.round(((100 - stats.safePercentage - (stats.unsafeRoutes || 0) / stats.totalRoutes * 100) || 30) * stats.totalRoutes / 100),
                stats.unsafeRoutes || 0,
            ],
            backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
            borderWidth: 0,
        }],
    } : null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#94a3b8',
                    padding: 20,
                    usePointStyle: true,
                }
            },
        },
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                        Safe Route Analysis
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Monitor and analyze route safety across the platform
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                        variant="outlined" 
                        startIcon={<RefreshIcon />} 
                        onClick={() => { fetchRoutes(); fetchStats(); }}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AnalyzeIcon />}
                        onClick={() => setAnalyzeDialogOpen(true)}
                        sx={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            },
                        }}
                    >
                        Analyze Route
                    </Button>
                </Box>
            </Box>

            {stats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ 
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
                            border: '1px solid',
                            borderColor: alpha('#6366f1', 0.2),
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: '#6366f1', width: 56, height: 56 }}>
                                        <RouteIcon sx={{ fontSize: 28 }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h3" sx={{ fontWeight: 800, color: '#6366f1' }}>
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
                        <Card sx={{ 
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                            border: '1px solid',
                            borderColor: alpha('#10B981', 0.2),
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: '#10B981', width: 56, height: 56 }}>
                                        <SpeedIcon sx={{ fontSize: 28 }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h3" sx={{ fontWeight: 800, color: '#10B981' }}>
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
                        <Card sx={{ 
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
                            border: '1px solid',
                            borderColor: alpha('#F59E0B', 0.2),
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: '#F59E0B', width: 56, height: 56 }}>
                                        <TrendingIcon sx={{ fontSize: 28 }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h3" sx={{ fontWeight: 800, color: '#F59E0B' }}>
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
                        <Card sx={{ 
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                            border: '1px solid',
                            borderColor: alpha('#EF4444', 0.2),
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: '#EF4444', width: 56, height: 56 }}>
                                        <WarningIcon sx={{ fontSize: 28 }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h3" sx={{ fontWeight: 800, color: '#EF4444' }}>
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

            {stats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                                    Safety Distribution
                                </Typography>
                                <Box sx={{ height: 220 }}>
                                    <Doughnut data={safetyChartData} options={chartOptions} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                                    Safety Score Overview
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', height: 200 }}>
                                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                display: 'inline-flex',
                                                mb: 2,
                                            }}
                                        >
                                            <CircularProgressIcon
                                                variant="determinate"
                                                value={100}
                                                size={120}
                                                thickness={4}
                                                sx={{ color: alpha('#10B981', 0.2) }}
                                            />
                                            <CircularProgressIcon
                                                variant="determinate"
                                                value={stats.avgSafetyScore}
                                                size={120}
                                                thickness={4}
                                                sx={{ 
                                                    color: getSafetyColor(stats.avgSafetyScore),
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: 0,
                                                }}
                                            />
                                            <Box
                                                sx={{
                                                    top: 0,
                                                    left: 0,
                                                    bottom: 0,
                                                    right: 0,
                                                    position: 'absolute',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexDirection: 'column',
                                                }}
                                            >
                                                <Typography variant="h3" fontWeight={800}>
                                                    {stats.avgSafetyScore}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography variant="body1" fontWeight={600}>
                                            Average Safety Score
                                        </Typography>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ mb: 3 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2" color="text.secondary">Safe (80-100)</Typography>
                                                <Typography variant="body2" fontWeight={600} color="#10B981">{stats.safePercentage}%</Typography>
                                            </Box>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={stats.safePercentage} 
                                                sx={{ 
                                                    height: 8, 
                                                    borderRadius: 4,
                                                    bgcolor: alpha('#10B981', 0.2),
                                                    '& .MuiLinearProgress-bar': { bgcolor: '#10B981', borderRadius: 4 }
                                                }} 
                                            />
                                        </Box>
                                        <Box sx={{ mb: 3 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2" color="text.secondary">Moderate (60-79)</Typography>
                                                <Typography variant="body2" fontWeight={600} color="#F59E0B">{Math.max(0, 100 - stats.safePercentage - (stats.unsafeRoutes / stats.totalRoutes * 100 || 0)).toFixed(0)}%</Typography>
                                            </Box>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={Math.max(0, 100 - stats.safePercentage - (stats.unsafeRoutes / stats.totalRoutes * 100 || 0))} 
                                                sx={{ 
                                                    height: 8, 
                                                    borderRadius: 4,
                                                    bgcolor: alpha('#F59E0B', 0.2),
                                                    '& .MuiLinearProgress-bar': { bgcolor: '#F59E0B', borderRadius: 4 }
                                                }} 
                                            />
                                        </Box>
                                        <Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2" color="text.secondary">Caution (0-59)</Typography>
                                                <Typography variant="body2" fontWeight={600} color="#EF4444">{(stats.unsafeRoutes / stats.totalRoutes * 100 || 0).toFixed(0)}%</Typography>
                                            </Box>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={stats.unsafeRoutes / stats.totalRoutes * 100 || 0} 
                                                sx={{ 
                                                    height: 8, 
                                                    borderRadius: 4,
                                                    bgcolor: alpha('#EF4444', 0.2),
                                                    '& .MuiLinearProgress-bar': { bgcolor: '#EF4444', borderRadius: 4 }
                                                }} 
                                            />
                                        </Box>
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
                            <TableRow sx={{ bgcolor: 'background.default' }}>
                                <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Origin</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Destination</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Mode</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Safety Score</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Distance</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
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
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <RouteIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                            No Route Analysis Found
                                        </Typography>
                                        <Typography variant="body2" color="text.disabled">
                                            Click "Analyze Route" to start safety analysis
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                routes.map((route) => {
                                    const score = route.safetyScore || route.safety_score;
                                    return (
                                        <TableRow key={route.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{ bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', width: 36, height: 36 }}>
                                                        {(route.user?.name || 'U')[0].toUpperCase()}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {route.user?.name || route.user_id}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {route.user?.email}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    <Typography variant="body2">
                                                        {route.origin?.name || route.origin_name || 'Unknown'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <LocationIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                                    <Typography variant="body2">
                                                        {route.destination?.name || route.dest_name || 'Unknown'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    icon={getModeIcon(route.mode)}
                                                    label={route.mode} 
                                                    size="small" 
                                                    variant="outlined"
                                                    sx={{ textTransform: 'capitalize' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box
                                                        sx={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: '50%',
                                                            bgcolor: getSafetyColor(score),
                                                        }}
                                                    />
                                                    <Chip
                                                        label={`${score}%`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: alpha(getSafetyColor(score), 0.1),
                                                            color: getSafetyColor(score),
                                                            fontWeight: 700,
                                                        }}
                                                        icon={getSafetyIcon(score)}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <DistanceIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    <Typography variant="body2">
                                                        {route.distance || 0} km
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(route.createdAt || route.created_at).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
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
                    rowsPerPageOptions={[10, 25, 50, 100]}
                />
            </Card>

            <Dialog open={analyzeDialogOpen} onClose={() => setAnalyzeDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AnalyzeIcon color="primary" />
                    Analyze Route for User
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Target User ID (leave empty for own analysis)"
                            value={analyzeForm.userId}
                            onChange={(e) => setAnalyzeForm({ ...analyzeForm, userId: e.target.value })}
                            fullWidth
                        />
                        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationIcon color="primary" /> Origin
                        </Typography>
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
                        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationIcon color="error" /> Destination
                        </Typography>
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
                            <Card sx={{ bgcolor: 'background.default', border: 1, borderColor: 'divider' }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ChartIcon color="primary" /> Analysis Result
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h2" sx={{ color: getSafetyColor(analyzeResult.safetyScore), fontWeight: 800 }}>
                                                {analyzeResult.safetyScore}%
                                            </Typography>
                                            <Chip
                                                label={getSafetyLabel(analyzeResult.safetyScore)}
                                                sx={{
                                                    bgcolor: alpha(getSafetyColor(analyzeResult.safetyScore), 0.1),
                                                    color: getSafetyColor(analyzeResult.safetyScore),
                                                    fontWeight: 700,
                                                }}
                                                icon={getSafetyIcon(analyzeResult.safetyScore)}
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <DistanceIcon color="action" />
                                            <Typography variant="body2">{analyzeResult.distance} km</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <TimeIcon color="action" />
                                            <Typography variant="body2">~{analyzeResult.estimatedTime} min</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setAnalyzeDialogOpen(false)}>Close</Button>
                    <Button
                        variant="contained"
                        onClick={handleAnalyzeForUser}
                        disabled={analyzing}
                        startIcon={analyzing ? <CircularProgress size={20} /> : <AnalyzeIcon />}
                    >
                        {analyzing ? 'Analyzing...' : 'Analyze'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity || 'info'} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SafeRouteManagement;

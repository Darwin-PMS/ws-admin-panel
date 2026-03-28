import React, { useEffect, useCallback, useState, useRef } from 'react';
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
    TextField,
    InputAdornment,
    FormControl,
    Select,
    MenuItem,
    Skeleton,
    Avatar,
    Tooltip,
    IconButton,
    alpha,
    Grid,
    Paper,
    Button,
    LinearProgress,
    CircularProgress,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Divider,
} from '@mui/material';
import {
    Search as SearchIcon,
    Login as LoginIcon,
    Logout as LogoutIcon,
    Warning as WarningIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    FilterList as FilterIcon,
    Timeline as TimelineIcon,
    TrendingUp as TrendingUpIcon,
    Person as PersonIcon,
    Refresh as RefreshIcon,
    Sync as SyncIcon,
    Close as CloseIcon,
    ShowChart as ShowChartIcon,
    History as HistoryIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchActivityLogs, 
    setSearch, 
    setActionFilter, 
    setPage, 
    setRowsPerPage 
} from '../store/slices/activityLogsSlice';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    ChartTooltip,
    Legend,
    Filler
);

const actionConfig = {
    login: { icon: LoginIcon, color: '#10b981', bg: '#ecfdf5', label: 'Logins' },
    logout: { icon: LogoutIcon, color: '#6366f1', bg: '#eef2ff', label: 'Logouts' },
    sos: { icon: WarningIcon, color: '#ef4444', bg: '#fef2f2', label: 'SOS Alerts' },
    edit: { icon: EditIcon, color: '#f59e0b', bg: '#fffbeb', label: 'Edits' },
    delete: { icon: DeleteIcon, color: '#ef4444', bg: '#fef2f2', label: 'Deletions' },
    create: { icon: AddIcon, color: '#8b5cf6', bg: '#f5f3ff', label: 'Creations' },
};

const ActivityLogs = () => {
    const dispatch = useDispatch();
    const { logs, loading, filters, totalCount } = useSelector((state) => state.activityLogs);

    const page = filters.page;
    const rowsPerPage = filters.rowsPerPage;
    const [refreshCountdown, setRefreshCountdown] = useState(30);
    const [showChart, setShowChart] = useState(true);
    const countdownRef = useRef(null);

    const fetchLogs = useCallback(() => {
        dispatch(fetchActivityLogs());
        setRefreshCountdown(30);
    }, [dispatch]);

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 30000);
        return () => clearInterval(interval);
    }, [fetchLogs]);

    useEffect(() => {
        if (loading) return;
        countdownRef.current = setInterval(() => {
            setRefreshCountdown((prev) => (prev > 0 ? prev - 1 : 30));
        }, 1000);
        return () => clearInterval(countdownRef.current);
    }, [loading]);

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            (log.user_name || '').toLowerCase().includes(filters.search.toLowerCase()) ||
            (log.description || '').toLowerCase().includes(filters.search.toLowerCase());
        const matchesAction = filters.action === 'all' || log.action === filters.action;
        return matchesSearch && matchesAction;
    });

    const actionCounts = logs.reduce((acc, log) => {
        const action = log.action || 'other';
        acc[action] = (acc[action] || 0) + 1;
        return acc;
    }, {});

    const totalLogs = logs.length;
    const uniqueUsers = [...new Set(logs.map(l => l.user_name).filter(Boolean))].length;

    const chartData = {
        labels: ['Logins', 'Logouts', 'SOS', 'Edits', 'Deletes', 'Creates', 'Other'],
        datasets: [
            {
                label: 'Activity',
                data: [
                    actionCounts.login || 0,
                    actionCounts.logout || 0,
                    actionCounts.sos || 0,
                    actionCounts.edit || 0,
                    actionCounts.delete || 0,
                    actionCounts.create || 0,
                    Math.floor(totalLogs / 7),
                ],
                fill: true,
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderColor: '#6366f1',
                borderWidth: 2,
                tension: 0.4,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#334155',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8' },
            },
            y: {
                grid: { color: 'rgba(148, 163, 184, 0.1)' },
                ticks: { color: '#94a3b8' },
                beginAtZero: true,
            },
        },
    };

    return (
        <Box sx={{ minHeight: 'calc(100vh - 120px)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            Activity Logs
                        </Typography>
                        <Chip
                            label={loading ? 'Updating...' : 'Live'}
                            size="small"
                            icon={<TimelineIcon sx={{ fontSize: 14 }} />}
                            sx={{
                                bgcolor: loading ? alpha('#f59e0b', 0.1) : alpha('#10b981', 0.1),
                                color: loading ? '#f59e0b' : '#10b981',
                                fontWeight: 600,
                                animation: !loading ? 'pulse 2s infinite' : 'none',
                            }}
                        />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Track all user activities and system events in real-time
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Paper
                        variant="outlined"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                        }}
                    >
                        <SyncIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">Next</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', minWidth: 20 }}>
                            {refreshCountdown}s
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={(refreshCountdown / 30) * 100}
                            sx={{
                                width: 40,
                                height: 4,
                                borderRadius: 2,
                                bgcolor: alpha('#6366f1', 0.1),
                                '& .MuiLinearProgress-bar': { bgcolor: '#6366f1', borderRadius: 2 },
                            }}
                        />
                    </Paper>
                    <Button 
                        variant="outlined" 
                        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />} 
                        onClick={fetchLogs}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
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
                            '&:hover': { borderColor: '#6366f1', boxShadow: 1 }
                        }}
                    >
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }}>
                            <TimelineIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#6366f1', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : totalLogs}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Total Activities</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
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
                            '&:hover': { borderColor: '#10b981', boxShadow: 1 }
                        }}
                    >
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#10b981', 0.1), color: '#10b981' }}>
                            <PersonIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : uniqueUsers}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Unique Users</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
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
                            '&:hover': { borderColor: '#ef4444', boxShadow: 1 }
                        }}
                    >
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' }}>
                            <WarningIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#ef4444', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : (actionCounts.sos || 0)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">SOS Alerts</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
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
                            '&:hover': { borderColor: '#f59e0b', boxShadow: 1 }
                        }}
                    >
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b' }}>
                            <TrendingUpIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : Math.max(1, Math.floor(totalLogs / 7))}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Daily Avg</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={8}>
                    <Card>
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ShowChartIcon sx={{ color: 'primary.main' }} />
                                <Typography variant="subtitle1" fontWeight={700}>
                                    Activity Overview
                                </Typography>
                            </Box>
                            <Button 
                                size="small" 
                                onClick={() => setShowChart(!showChart)}
                                sx={{ minWidth: 'auto' }}
                            >
                                {showChart ? 'Hide' : 'Show'}
                            </Button>
                        </Box>
                        {showChart && (
                            <CardContent sx={{ pt: 2 }}>
                                <Box sx={{ height: 220 }}>
                                    <Line data={chartData} options={chartOptions} />
                                </Box>
                            </CardContent>
                        )}
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="subtitle1" fontWeight={700}>
                                Activity Breakdown
                            </Typography>
                        </Box>
                        <List dense sx={{ p: 1 }}>
                            {Object.entries(actionConfig).map(([key, config]) => {
                                const ActionIcon = config.icon;
                                const count = actionCounts[key] || 0;
                                const percentage = totalLogs > 0 ? Math.round((count / totalLogs) * 100) : 0;
                                return (
                                    <ListItem 
                                        key={key}
                                        sx={{
                                            borderRadius: 1,
                                            mb: 0.5,
                                            '&:hover': { bgcolor: alpha(config.color, 0.05) }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: config.bg, color: config.color }}>
                                                <ActionIcon sx={{ fontSize: 16 }} />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="body2" fontWeight={500}>{config.label}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{count}</Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={percentage}
                                                    sx={{
                                                        mt: 0.5,
                                                        height: 4,
                                                        borderRadius: 2,
                                                        bgcolor: alpha(config.color, 0.1),
                                                        '& .MuiLinearProgress-bar': { bgcolor: config.color, borderRadius: 2 },
                                                    }}
                                                />
                                            }
                                        />
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Card>
                </Grid>
            </Grid>

            <Card sx={{ mb: 3 }}>
                <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        placeholder="Search by user or description..."
                        value={filters.search}
                        onChange={(e) => dispatch(setSearch(e.target.value))}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                            endAdornment: filters.search && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => dispatch(setSearch(''))}>
                                        <CloseIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ minWidth: 280 }}
                    />
                    
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <Select
                            value={filters.action}
                            onChange={(e) => dispatch(setActionFilter(e.target.value))}
                            displayEmpty
                        >
                            <MenuItem value="all">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FilterIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                    All Actions
                                </Box>
                            </MenuItem>
                            {Object.entries(actionConfig).map(([key, config]) => {
                                const ActionIcon = config.icon;
                                return (
                                    <MenuItem key={key} value={key}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <ActionIcon sx={{ fontSize: 16, color: config.color }} />
                                            {config.label} ({actionCounts[key] || 0})
                                        </Box>
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>

                    <Box sx={{ flex: 1 }} />

                    <Chip
                        label={`${filteredLogs.length} ${filteredLogs.length === 1 ? 'log' : 'logs'}`}
                        size="small"
                        variant="outlined"
                    />
                </Box>
            </Card>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'background.default' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Details</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>IP Address</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        {[...Array(5)].map((_, j) => (
                                            <TableCell key={j}><Skeleton /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : filteredLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                        <Box
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                borderRadius: '50%',
                                                bgcolor: alpha('#6366f1', 0.1),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mx: 'auto',
                                                mb: 2,
                                            }}
                                        >
                                            <HistoryIcon sx={{ fontSize: 48, color: '#6366f1' }} />
                                        </Box>
                                        <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                                            {filters.search || filters.action !== 'all' ? 'No Matching Logs' : 'No Activity Logs Yet'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {filters.search || filters.action !== 'all' 
                                                ? 'Try adjusting your search or filter criteria'
                                                : 'Activity logs will appear here as users interact with the system'}
                                        </Typography>
                                        {(filters.search || filters.action !== 'all') && (
                                            <Button 
                                                variant="text" 
                                                onClick={() => {
                                                    dispatch(setSearch(''));
                                                    dispatch(setActionFilter('all'));
                                                }}
                                            >
                                                Clear Filters
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((log) => {
                                    const config = actionConfig[log.action] || actionConfig.create;
                                    const ActionIcon = config.icon;
                                    return (
                                        <TableRow 
                                            key={log.id} 
                                            hover
                                            sx={{
                                                transition: 'background-color 0.15s',
                                                '&:hover': { bgcolor: alpha(config.color, 0.03) }
                                            }}
                                        >
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar
                                                        sx={{
                                                            width: 36,
                                                            height: 36,
                                                            bgcolor: config.bg,
                                                            color: config.color,
                                                        }}
                                                    >
                                                        <ActionIcon fontSize="small" />
                                                    </Avatar>
                                                    <Chip
                                                        label={log.action}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: config.bg,
                                                            color: config.color,
                                                            fontWeight: 600,
                                                            fontSize: '0.7rem',
                                                        }}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar 
                                                        sx={{ 
                                                            width: 28, 
                                                            height: 28, 
                                                            fontSize: '0.75rem',
                                                            bgcolor: alpha('#6366f1', 0.1),
                                                            color: '#6366f1'
                                                        }}
                                                    >
                                                        {(log.user_name || 'S')[0].toUpperCase()}
                                                    </Avatar>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {log.user_name || 'System'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography 
                                                    variant="body2" 
                                                    color="text.secondary" 
                                                    sx={{ 
                                                        maxWidth: 300,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {log.description || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={log.ip_address || '-'} 
                                                    size="small" 
                                                    variant="outlined"
                                                    sx={{ 
                                                        fontFamily: 'monospace',
                                                        fontSize: '0.7rem',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}
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
                    onPageChange={(e, newPage) => dispatch(setPage(newPage))}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        dispatch(setRowsPerPage(parseInt(e.target.value, 10)));
                        dispatch(setPage(0));
                    }}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                />
            </Card>
        </Box>
    );
};

export default ActivityLogs;

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    ToggleButton,
    ToggleButtonGroup,
    Skeleton,
    Paper,
    alpha,
    Chip,
    LinearProgress,
    IconButton,
    Tooltip,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    People as PeopleIcon,
    Chat as ChatIcon,
    Security as SecurityIcon,
    Speed as SpeedIcon,
    Refresh as RefreshIcon,
    FiberManualRecord as LiveIcon,
    Timeline as TimelineIcon,
    ShowChart as ShowChartIcon,
    PieChart as PieChartIcon,
    BarChart as BarChartIcon,
    Public as PublicIcon,
    Verified as VerifiedIcon,
    Warning as WarningIcon,
    Group as GroupIcon,
    Sms as SmsIcon,
    Download as DownloadIcon,
    Error as ErrorIcon,
    Person as PersonIcon,
    Smartphone as MobileIcon,
} from '@mui/icons-material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    Filler,
    RadarController,
    RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics, setTimeRange } from '../store/slices/analyticsSlice';
import { adminApi } from '../services/api';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, ChartTooltip, Legend, Filler,
    RadarController, RadialLinearScale
);

const chartColors = {
    primary: '#6366f1',
    secondary: '#ec4899',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
};

const chartOptions = (showLegend = true) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            display: showLegend,
            labels: {
                color: '#94a3b8',
                usePointStyle: true,
                padding: 16,
                font: { size: 11 },
            }
        },
        tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 12,
            cornerRadius: 8,
        },
    },
    scales: {
        x: {
            grid: { color: 'rgba(148, 163, 184, 0.08)' },
            ticks: { color: '#64748b', font: { size: 10 } }
        },
        y: {
            grid: { color: 'rgba(148, 163, 184, 0.08)' },
            ticks: { color: '#64718b', font: { size: 10 } }
        },
    },
    elements: { line: { tension: 0.4 }, point: { radius: 3, hoverRadius: 5 } },
});

const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'bottom', labels: { color: '#94a3b8', usePointStyle: true, padding: 12, font: { size: 10 } } },
        tooltip: { backgroundColor: '#1e293b', titleColor: '#fff', bodyColor: '#fff', padding: 12, cornerRadius: 8 },
    },
    cutout: '65%',
};

const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        r: {
            beginAtZero: true,
            max: 100,
            ticks: { display: false },
            grid: { color: 'rgba(148, 163, 184, 0.15)' },
            pointLabels: { color: '#94a3b8', font: { size: 10 } },
        },
    },
};

const StatCard = ({ title, value, subtitle, icon, color, trend, loading }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.3)})` }} />
        <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {title}
                    </Typography>
                    {loading ? (
                        <Skeleton width={80} height={36} />
                    ) : (
                        <Typography variant="h4" sx={{ fontWeight: 800, color: color || 'text.primary', letterSpacing: '-0.02em' }}>
                            {value}
                        </Typography>
                    )}
                    {subtitle && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {subtitle}
                        </Typography>
                    )}
                    {trend !== undefined && !loading && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                            {trend >= 0 ? (
                                <TrendingUpIcon sx={{ fontSize: 14, color: 'success.main' }} />
                            ) : (
                                <TrendingDownIcon sx={{ fontSize: 14, color: 'error.main' }} />
                            )}
                            <Typography variant="caption" color={trend >= 0 ? 'success.main' : 'error.main'} fontWeight={600}>
                                {trend >= 0 ? '+' : ''}{trend}% from last period
                            </Typography>
                        </Box>
                    )}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.75 }}>
                    <Box sx={{ p: 1.25, borderRadius: 2, background: alpha(color || '#6366f1', 0.12), color: color || '#6366f1' }}>
                        {icon}
                    </Box>
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const ChartCard = ({ title, subtitle, children, loading, height = 280, actions, icon }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2.5, pb: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {icon && <Box sx={{ color: 'primary.main' }}>{icon}</Box>}
                    <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ fontSize: '0.95rem' }}>{title}</Typography>
                        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
                    </Box>
                </Box>
                {actions && <Box sx={{ display: 'flex', gap: 1 }}>{actions}</Box>}
            </Box>
            {loading ? (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: height }}>
                    <CircularProgress size={24} />
                </Box>
            ) : (
                <Box sx={{ height: height }}>{children}</Box>
            )}
        </CardContent>
    </Card>
);

const BarChartSimple = ({ data = [], height = 120, barColor = chartColors.primary }) => {
    const maxValue = Math.max(...data.map(d => d.value || 0), 1);
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, height }}>
            {data.map((item, index) => (
                <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                        <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                        <Typography variant="caption" fontWeight={600}>{item.value?.toLocaleString() || 0}</Typography>
                    </Box>
                    <Box sx={{ height: 8, bgcolor: alpha(barColor, 0.1), borderRadius: 4, overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${((item.value || 0) / maxValue) * 100}%`, bgcolor: barColor, borderRadius: 4, transition: 'width 0.3s ease' }} />
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

const HorizontalBarChart = ({ data = [], height = 100, barColor = chartColors.primary }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height }}>
            {data.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="caption" sx={{ width: 60, color: 'text.secondary' }}>{item.label}</Typography>
                    <Box sx={{ flex: 1, height: 16, bgcolor: alpha(barColor, 0.1), borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ 
                            height: '100%', 
                            width: `${((item.value || 0) / Math.max(...data.map(d => d.value || 0), 1)) * 100}%`, 
                            bgcolor: item.color || barColor, 
                            borderRadius: 2, 
                            transition: 'width 0.3s ease' 
                        }} />
                    </Box>
                    <Typography variant="caption" fontWeight={600} sx={{ width: 40, textAlign: 'right' }}>{item.value?.toLocaleString() || 0}</Typography>
                </Box>
            ))}
        </Box>
    );
};

const Analytics = () => {
    const dispatch = useDispatch();
    const { analytics, loading: reduxLoading, timeRange } = useSelector((state) => state.analytics);
    const [loadingData, setLoadingData] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [error, setError] = useState(null);
    const [datePreset, setDatePreset] = useState('30days');
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        activeSessions: 0,
        sosAlerts: 0,
        messages: 0,
        newRegistrations: 0,
    });
    const [chartData, setChartData] = useState({
        userGrowth: { labels: [], newUsers: [], activeUsers: [] },
        serviceUsage: { labels: [], values: [] },
        userDistribution: { labels: [], values: [] },
        engagement: { labels: [], values: [] },
        retention: { labels: [], values: [] },
        messageTrend: { labels: [], values: [] },
        sosTrend: { labels: [], values: [] },
        featureRadar: { labels: [], values: [] },
    });
    const [topUsers, setTopUsers] = useState([]);
    const [deviceData, setDeviceData] = useState([]);
    const [locationData, setLocationData] = useState([]);
    const [trends, setTrends] = useState({});
    const [recentActivity, setRecentActivity] = useState([]);

    const fetchAnalyticsData = useCallback(async () => {
        setLoadingData(true);
        setError(null);
        
        const getMockData = () => {
            const multipliers = {
                '7days': 0.25,
                '30days': 1,
                '90days': 3,
                '12months': 12
            };
            const mult = multipliers[datePreset] || 1;
            
            return {
                stats: {
                    totalUsers: Math.floor(8542 * mult),
                    activeUsers: Math.floor(4521 * mult),
                    activeSessions: Math.floor(1420 * mult),
                    sosAlerts: Math.floor(35 + Math.random() * 20),
                    messages: Math.floor(245000 * mult),
                    newRegistrations: Math.floor(892 * mult),
                },
                userGrowth: {
                    labels: datePreset === '7days' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] 
                        : datePreset === '12months' ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                        : ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
                    newUsers: [120, 145, 132, 168, 155, 182].map(v => Math.floor(v * mult + Math.random() * 50)),
                    activeUsers: [890, 920, 875, 950, 980, 1020].map(v => Math.floor(v * mult + Math.random() * 100)),
                },
                serviceUsage: {
                    labels: ['AI Chat', 'Safety Alerts', 'Family Tracking', 'Child Care', 'Safe Routes'],
                    values: [450, 280, 190, 120, 80].map(v => Math.floor(v * mult + Math.random() * 50)),
                },
                userDistribution: {
                    labels: ['Women', 'Parents', 'Guardians', 'Friends', 'Others'],
                    values: [45, 25, 15, 10, 5],
                },
                engagement: {
                    labels: datePreset === '7days' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    values: [3200, 4100, 3800, 4500, 5200, 2800, 1900].map(v => Math.floor(v * mult)),
                },
                retention: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    values: [85, 72, 65, 58].map(v => v + Math.floor(Math.random() * 10 - 5)),
                },
                messageTrend: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
                    values: [45000, 52000, 48000, 61000, 58000, 72000].map(v => Math.floor(v * mult)),
                },
                sosTrend: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
                    values: [45, 38, 52, 28, 42, 35].map(v => v + Math.floor(Math.random() * 10 - 5)),
                },
                featureRadar: {
                    labels: ['Safety', 'AI Chat', 'Family', 'Child Care', 'Navigation', 'Emergency'],
                    values: [92, 85, 78, 65, 72, 88].map(v => v + Math.floor(Math.random() * 10)),
                },
                topUsers: [
                    { id: 1, name: 'Priya Sharma', location: 'Mumbai', sessions: Math.floor(145 * mult) },
                    { id: 2, name: 'Anita Desai', location: 'Delhi', sessions: Math.floor(132 * mult) },
                    { id: 3, name: 'Kavitha Reddy', location: 'Bangalore', sessions: Math.floor(128 * mult) },
                    { id: 4, name: 'Meera Patel', location: 'Ahmedabad', sessions: Math.floor(115 * mult) },
                    { id: 5, name: 'Sunita Singh', location: 'Jaipur', sessions: Math.floor(98 * mult) },
                ],
                devices: [
                    { label: 'Mobile', value: Math.floor(1245 * mult), color: chartColors.primary },
                    { label: 'Tablet', value: Math.floor(580 * mult), color: chartColors.secondary },
                    { label: 'Desktop', value: Math.floor(320 * mult), color: chartColors.success },
                ],
                locations: [
                    { label: 'Mumbai', value: Math.floor(2450 * mult) },
                    { label: 'Delhi', value: Math.floor(1890 * mult) },
                    { label: 'Bangalore', value: Math.floor(1450 * mult) },
                    { label: 'Chennai', value: Math.floor(980 * mult) },
                    { label: 'Hyderabad', value: Math.floor(720 * mult) },
                ],
                trends: { users: 12, sessions: 8, sos: -15, messages: 18 },
            };
        };

        try {
            dispatch(fetchAnalytics(timeRange));
            const response = await adminApi.getAnalytics({ timeRange, preset: datePreset });
            
            if (response.data?.success) {
                const data = response.data.data || {};
                
                setStats({
                    totalUsers: data.totalUsers || data.stats?.totalUsers || 0,
                    activeUsers: data.activeUsers || data.stats?.activeUsers || 0,
                    activeSessions: data.activeSessions || data.stats?.activeSessions || 0,
                    sosAlerts: data.sosAlerts || data.stats?.sosAlerts || 0,
                    messages: data.messages || data.stats?.messages || 0,
                    newRegistrations: data.newRegistrations || data.stats?.newRegistrations || 0,
                });

                setChartData({
                    userGrowth: data.userGrowth || data.charts?.userGrowth || { labels: [], newUsers: [], activeUsers: [] },
                    serviceUsage: data.serviceUsage || data.charts?.serviceUsage || { labels: [], values: [] },
                    userDistribution: data.userDistribution || data.charts?.userDistribution || { labels: [], values: [] },
                    engagement: data.engagement || data.charts?.engagement || { labels: [], values: [] },
                    retention: data.retention || data.charts?.retention || { labels: [], values: [] },
                    messageTrend: data.messageTrend || data.charts?.messageTrend || { labels: [], values: [] },
                    sosTrend: data.sosTrend || data.charts?.sosTrend || { labels: [], values: [] },
                    featureRadar: data.featureRadar || data.charts?.featureRadar || { labels: [], values: [] },
                });

                setTopUsers(data.topUsers || []);
                setDeviceData(data.devices || data.deviceBreakdown || []);
                setLocationData(data.locations || data.topLocations || []);
                setTrends(data.trends || {});
                setRecentActivity(data.recentActivity || data.activity || []);
                
                setLastUpdated(new Date());
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.warn('API unavailable, using mock data:', err.message);
            setError('Demo mode - showing sample data');
            
            const mockData = getMockData();
            
            setStats(mockData.stats);
            setChartData({
                userGrowth: mockData.userGrowth,
                serviceUsage: mockData.serviceUsage,
                userDistribution: mockData.userDistribution,
                engagement: mockData.engagement,
                retention: mockData.retention,
                messageTrend: mockData.messageTrend,
                sosTrend: mockData.sosTrend,
                featureRadar: mockData.featureRadar,
            });
            setTopUsers(mockData.topUsers);
            setDeviceData(mockData.devices);
            setLocationData(mockData.locations);
            setTrends(mockData.trends);
        } finally {
            setLoadingData(false);
        }
    }, [dispatch, timeRange, datePreset]);

    useEffect(() => {
        fetchAnalyticsData();
    }, [fetchAnalyticsData]);

    const handleTimeRangeChange = (event, newRange) => {
        if (newRange !== null) {
            dispatch(setTimeRange(newRange));
        }
    };

    const handleDatePresetChange = (event) => {
        setDatePreset(event.target.value);
    };

    const handleExport = () => {
        const exportData = {
            stats,
            chartData,
            topUsers,
            deviceData,
            locationData,
            trends,
            exportedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics_export_${datePreset}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const formatLastUpdated = () => {
        if (!lastUpdated) return '';
        const now = new Date();
        const diff = Math.floor((now - lastUpdated) / 1000);
        if (diff < 60) return 'Updated just now';
        if (diff < 3600) return `Updated ${Math.floor(diff / 60)}m ago`;
        return `Updated at ${lastUpdated.toLocaleTimeString()}`;
    };

    const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toLocaleString();
    };

    const userGrowthData = useMemo(() => ({
        labels: chartData.userGrowth?.labels || [],
        datasets: [
            {
                label: 'New Users',
                data: chartData.userGrowth?.newUsers || [],
                borderColor: chartColors.primary,
                backgroundColor: alpha(chartColors.primary, 0.1),
                fill: true,
            },
            {
                label: 'Active Users',
                data: chartData.userGrowth?.activeUsers || [],
                borderColor: chartColors.success,
                backgroundColor: alpha(chartColors.success, 0.1),
                fill: true,
            },
        ],
    }), [chartData]);

    const serviceUsageData = useMemo(() => ({
        labels: chartData.serviceUsage?.labels || [],
        datasets: [{
            label: 'Active Sessions',
            data: chartData.serviceUsage?.values || [],
            backgroundColor: [chartColors.primary, chartColors.secondary, chartColors.success, chartColors.warning, chartColors.info],
            borderRadius: 6,
        }],
    }), [chartData]);

    const userDistributionData = useMemo(() => ({
        labels: chartData.userDistribution?.labels || [],
        datasets: [{
            data: chartData.userDistribution?.values || [],
            backgroundColor: [chartColors.secondary, chartColors.success, chartColors.warning, chartColors.info, chartColors.primary],
            borderWidth: 0,
        }],
    }), [chartData]);

    const engagementData = useMemo(() => ({
        labels: chartData.engagement?.labels || [],
        datasets: [{
            label: 'Daily Active Users',
            data: chartData.engagement?.values || [],
            backgroundColor: alpha(chartColors.primary, 0.8),
            borderRadius: 6,
        }],
    }), [chartData]);

    const retentionData = useMemo(() => ({
        labels: chartData.retention?.labels || [],
        datasets: [{
            label: 'Retention Rate %',
            data: chartData.retention?.values || [],
            backgroundColor: alpha(chartColors.success, 0.8),
            borderRadius: 6,
        }],
    }), [chartData]);

    const messageTrendData = useMemo(() => ({
        labels: chartData.messageTrend?.labels || [],
        datasets: [{
            label: 'Messages',
            data: chartData.messageTrend?.values || [],
            borderColor: chartColors.secondary,
            backgroundColor: 'transparent',
            tension: 0.4,
        }],
    }), [chartData]);

    const sosTrendData = useMemo(() => ({
        labels: chartData.sosTrend?.labels || [],
        datasets: [{
            label: 'SOS Alerts',
            data: chartData.sosTrend?.values || [],
            borderColor: chartColors.danger,
            backgroundColor: alpha(chartColors.danger, 0.1),
            fill: true,
        }],
    }), [chartData]);

    const featureRadarData = useMemo(() => ({
        labels: chartData.featureRadar?.labels || [],
        datasets: [{
            label: 'Feature Usage',
            data: chartData.featureRadar?.values || [],
            backgroundColor: alpha(chartColors.primary, 0.2),
            borderColor: chartColors.primary,
            pointBackgroundColor: chartColors.primary,
        }],
    }), [chartData]);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>Analytics</Typography>
                        <Chip 
                            icon={<LiveIcon sx={{ fontSize: 12 }} />} 
                            label="LIVE" 
                            size="small" 
                            sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 700, fontSize: '0.65rem', height: 22 }} 
                        />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Comprehensive platform metrics and performance insights
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <Select
                            value={datePreset}
                            onChange={handleDatePresetChange}
                            displayEmpty
                            sx={{ fontSize: '0.875rem' }}
                        >
                            <MenuItem value="7days">Last 7 Days</MenuItem>
                            <MenuItem value="30days">Last 30 Days</MenuItem>
                            <MenuItem value="90days">Last 90 Days</MenuItem>
                            <MenuItem value="12months">Last 12 Months</MenuItem>
                        </Select>
                    </FormControl>
                    <ToggleButtonGroup value={timeRange} exclusive onChange={handleTimeRangeChange} size="small">
                        <ToggleButton value="day">Today</ToggleButton>
                        <ToggleButton value="week">Week</ToggleButton>
                        <ToggleButton value="month">Month</ToggleButton>
                        <ToggleButton value="year">Year</ToggleButton>
                    </ToggleButtonGroup>
                    <Button 
                        variant="outlined" 
                        size="small" 
                        startIcon={<DownloadIcon />}
                        onClick={handleExport}
                    >
                        Export
                    </Button>
                    <Tooltip title={lastUpdated ? formatLastUpdated() : 'Fetching...'}>
                        <span>
                            <IconButton onClick={fetchAnalyticsData} disabled={loadingData} size="small">
                                {loadingData ? <CircularProgress size={20} /> : <RefreshIcon />}
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>
            </Box>

            {error && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: alpha(chartColors.danger, 0.1), display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ErrorIcon sx={{ color: 'error.main' }} />
                    <Typography variant="body2" color="error">{error}</Typography>
                    <Button size="small" onClick={fetchAnalyticsData} sx={{ ml: 'auto' }}>Retry</Button>
                </Paper>
            )}

            {loadingData && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Users"
                        value={formatNumber(stats.totalUsers)}
                        subtitle="All registered accounts"
                        icon={<PeopleIcon />}
                        color={chartColors.primary}
                        trend={trends.users}
                        loading={loadingData}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Active Sessions"
                        value={formatNumber(stats.activeSessions)}
                        subtitle="Currently online"
                        icon={<SpeedIcon />}
                        color={chartColors.success}
                        trend={trends.sessions}
                        loading={loadingData}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="SOS Alerts"
                        value={formatNumber(stats.sosAlerts)}
                        subtitle="This period"
                        icon={<SecurityIcon />}
                        color={chartColors.danger}
                        trend={trends.sos}
                        loading={loadingData}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="AI Messages"
                        value={formatNumber(stats.messages)}
                        subtitle="Total conversations"
                        icon={<ChatIcon />}
                        color={chartColors.secondary}
                        trend={trends.messages}
                        loading={loadingData}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <ChartCard title="User Growth & Activity" subtitle="New registrations and active users over time" icon={<TimelineIcon />} loading={loadingData} height={300}>
                                <Line data={userGrowthData} options={chartOptions(true)} />
                            </ChartCard>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <ChartCard title="Service Usage" subtitle="Active sessions by feature" icon={<BarChartIcon />} loading={loadingData} height={260}>
                                <Bar data={serviceUsageData} options={chartOptions(false)} />
                            </ChartCard>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <ChartCard title="User Distribution" subtitle="By user role" icon={<PieChartIcon />} loading={loadingData} height={260}>
                                <Doughnut data={userDistributionData} options={doughnutOptions} />
                            </ChartCard>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <ChartCard title="Daily Engagement" subtitle="User activity by day" icon={<ShowChartIcon />} loading={loadingData} height={260}>
                                <Bar data={engagementData} options={chartOptions(false)} />
                            </ChartCard>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <ChartCard title="Feature Adoption" subtitle="Usage by capability" icon={<ShowChartIcon />} loading={loadingData} height={260}>
                                <Radar data={featureRadarData} options={radarOptions} />
                            </ChartCard>
                        </Grid>

                        <Grid item xs={12}>
                            <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PublicIcon sx={{ color: 'primary.main' }} />
                                            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '0.95rem' }}>Top Locations</Typography>
                                        </Box>
                                    </Box>
                                    {loadingData ? (
                                        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                            {[1,2,3,4,5].map(i => <Skeleton key={i} height={30} />)}
                                        </Box>
                                    ) : (
                                        <BarChartSimple data={locationData} height={140} barColor={chartColors.primary} />
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <MobileIcon sx={{ color: 'primary.main' }} />
                                            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '0.95rem' }}>Device Breakdown</Typography>
                                        </Box>
                                    </Box>
                                    {loadingData ? (
                                        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                            {[1,2,3].map(i => <Skeleton key={i} height={24} />)}
                                        </Box>
                                    ) : (
                                        <>
                                            <HorizontalBarChart data={deviceData} height={100} />
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                                {deviceData.map((device, index) => (
                                                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: device.color || chartColors.primary }} />
                                                        <Typography variant="caption" color="text.secondary">{device.label} {device.value}</Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <VerifiedIcon sx={{ color: 'success.main' }} />
                                            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '0.95rem' }}>User Retention</Typography>
                                        </Box>
                                        <Chip label="+5%" size="small" sx={{ bgcolor: alpha(chartColors.success, 0.1), color: chartColors.success, fontWeight: 700, fontSize: '0.65rem' }} />
                                    </Box>
                                    <Box sx={{ height: 120 }}>
                                        <Bar data={retentionData} options={{ ...chartOptions(false), plugins: { legend: { display: false } } }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <GroupIcon sx={{ color: 'primary.main' }} />
                                            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '0.95rem' }}>Top Users</Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Most active users this period</Typography>
                                    {loadingData ? (
                                        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                            {[1,2,3,4,5].map(i => <Skeleton key={i} height={40} />)}
                                        </Box>
                                    ) : topUsers.length > 0 ? (
                                        topUsers.map((user, index) => (
                                            <Box key={user.id || index} sx={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center', 
                                                py: 1, 
                                                borderBottom: '1px solid', 
                                                borderColor: 'divider', 
                                                '&:last-child': { borderBottom: 'none' } 
                                            }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: alpha(chartColors.primary, 0.1), color: chartColors.primary }}>
                                                        {user.name?.[0] || '#'}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={500}>{user.name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{user.location || user.email}</Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Typography variant="body2" fontWeight={600}>{user.sessions || user.count || 0}</Typography>
                                                    <Typography variant="caption" color="text.secondary">sessions</Typography>
                                                </Box>
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>No data available</Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <SmsIcon sx={{ color: 'secondary.main' }} />
                                            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '0.95rem' }}>Message Trend</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ height: 100 }}>
                                        <Line data={messageTrendData} options={{ ...chartOptions(false), plugins: { legend: { display: false } } }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <WarningIcon sx={{ color: 'error.main' }} />
                                            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '0.95rem' }}>SOS Trend</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ height: 100 }}>
                                        <Line data={sosTrendData} options={{ ...chartOptions(false), plugins: { legend: { display: false } } }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Analytics;

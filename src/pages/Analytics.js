import React, { useEffect, useCallback, useState } from 'react';
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
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    People as PeopleIcon,
    Chat as ChatIcon,
    Security as SecurityIcon,
    Notifications as NotificationsIcon,
    Refresh as RefreshIcon,
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
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics, setTimeRange } from '../store/slices/analyticsSlice';
import { adminApi } from '../services/api';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, ChartTooltip, Legend, Filler
);

const chartColors = {
    primary: '#6366f1',
    secondary: '#ec4899',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top', labels: { color: '#64748b', usePointStyle: true, padding: 20, font: { size: 12 } } },
        tooltip: { backgroundColor: '#1e293b', titleColor: '#fff', bodyColor: '#fff', padding: 12, cornerRadius: 8 },
    },
    scales: {
        x: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#64748b' } },
        y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#64748b' } },
    },
    elements: { line: { tension: 0.4 }, point: { radius: 4, hoverRadius: 6 } },
};

const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'right', labels: { color: '#64748b', usePointStyle: true, padding: 20, font: { size: 12 } } },
        tooltip: { backgroundColor: '#1e293b', titleColor: '#fff', bodyColor: '#fff', padding: 12, cornerRadius: 8 },
    },
    cutout: '65%',
};

const StatCard = ({ title, value, subtitle, icon, color, trend, loading }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {title}
                    </Typography>
                    {loading ? (
                        <Skeleton width={80} height={40} />
                    ) : (
                        <Typography variant="h3" sx={{ fontWeight: 800, color: color || 'text.primary' }}>
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
                                <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                            ) : (
                                <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
                            )}
                            <Typography variant="caption" color={trend >= 0 ? 'success.main' : 'error.main'} fontWeight={600}>
                                {trend >= 0 ? '+' : ''}{trend}% from last period
                            </Typography>
                        </Box>
                    )}
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(color || '#6366f1', 0.1), color: color || '#6366f1' }}>
                    {icon}
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const ChartCard = ({ title, subtitle, children, loading, height = 300 }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>{title}</Typography>
                {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
            </Box>
            {loading ? (
                <Box sx={{ height: height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ height: height }}>{children}</Box>
            )}
        </CardContent>
    </Card>
);

const Analytics = () => {
    const dispatch = useDispatch();
    const { analytics, loading, timeRange } = useSelector((state) => state.analytics);
    const [chartData, setChartData] = useState(null);
    const [loadingData, setLoadingData] = useState(true);

    const fetchAnalyticsData = useCallback(async () => {
        setLoadingData(true);
        try {
            dispatch(fetchAnalytics(timeRange));
            const response = await adminApi.getAnalytics(timeRange);
            if (response.data.success) {
                setChartData(response.data);
            }
        } catch (err) {
            console.error('Error fetching analytics:', err);
        } finally {
            setLoadingData(false);
        }
    }, [dispatch, timeRange]);

    useEffect(() => {
        fetchAnalyticsData();
    }, [fetchAnalyticsData]);

    const handleTimeRangeChange = (event, newRange) => {
        if (newRange !== null) {
            dispatch(setTimeRange(newRange));
        }
    };

    const data = chartData || analytics || {};

    const userGrowthData = {
        labels: data.userGrowth?.labels || [],
        datasets: [{
            label: 'Total Users',
            data: data.userGrowth?.data || [],
            borderColor: chartColors.primary,
            backgroundColor: alpha(chartColors.primary, 0.1),
            fill: true,
        }],
    };

    const userDistributionData = {
        labels: data.userDistribution?.labels || ['Women', 'Parents', 'Guardians', 'Friends', 'Admins'],
        datasets: [{
            data: data.userDistribution?.data || [45, 25, 15, 10, 5],
            backgroundColor: [chartColors.secondary, chartColors.success, chartColors.warning, chartColors.info, chartColors.primary],
            borderWidth: 0,
        }],
    };

    const serviceUsageData = {
        labels: data.serviceUsage?.labels || ['AI Chat', 'Safety Alerts', 'Family Tracking', 'Child Care', 'Content'],
        datasets: [{
            label: 'Active Sessions',
            data: data.serviceUsage?.data || [450, 280, 190, 120, 80],
            backgroundColor: [chartColors.primary, chartColors.secondary, chartColors.success, chartColors.warning, chartColors.info],
            borderRadius: 8,
        }],
    };

    const activityData = {
        labels: data.activity?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Daily Active Users',
            data: data.activity?.data || [320, 410, 380, 450, 520, 280, 190],
            backgroundColor: alpha(chartColors.primary, 0.8),
            borderRadius: 8,
        }],
    };

    const sosTrendData = {
        labels: data.sosTrend?.labels || [],
        datasets: [{
            label: 'SOS Alerts',
            data: data.sosTrend?.data || [],
            borderColor: chartColors.danger,
            backgroundColor: alpha(chartColors.danger, 0.1),
            fill: true,
        }],
    };

    const stats = data.stats || {};

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>Analytics</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Track usage metrics and performance insights
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <ToggleButtonGroup value={timeRange} exclusive onChange={handleTimeRangeChange} size="small">
                        <ToggleButton value="day">Today</ToggleButton>
                        <ToggleButton value="week">Week</ToggleButton>
                        <ToggleButton value="month">Month</ToggleButton>
                        <ToggleButton value="year">Year</ToggleButton>
                    </ToggleButtonGroup>
                    <Tooltip title="Refresh">
                        <IconButton onClick={fetchAnalyticsData} disabled={loadingData}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Users"
                        value={stats.totalUsers?.toLocaleString() || '0'}
                        subtitle="Registered accounts"
                        icon={<PeopleIcon />}
                        color={chartColors.primary}
                        trend={stats.userGrowth || 0}
                        loading={loadingData}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Sessions"
                        value={stats.activeSessions?.toLocaleString() || '0'}
                        subtitle="Currently online"
                        icon={<NotificationsIcon />}
                        color={chartColors.success}
                        trend={stats.sessionGrowth || 0}
                        loading={loadingData}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="SOS Alerts"
                        value={stats.sosAlerts?.toString() || '0'}
                        subtitle="This period"
                        icon={<SecurityIcon />}
                        color={chartColors.danger}
                        trend={stats.sosGrowth || 0}
                        loading={loadingData}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="AI Chat Messages"
                        value={stats.messages ? `${(stats.messages / 1000).toFixed(1)}K` : '0'}
                        subtitle="Total conversations"
                        icon={<ChatIcon />}
                        color={chartColors.secondary}
                        trend={stats.messageGrowth || 0}
                        loading={loadingData}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} lg={8}>
                    <ChartCard title="User Growth Trend" subtitle="New user registrations over time" loading={loadingData}>
                        <Line data={userGrowthData} options={chartOptions} />
                    </ChartCard>
                </Grid>
                <Grid item xs={12} lg={4}>
                    <ChartCard title="User Distribution" subtitle="By user role" loading={loadingData} height={280}>
                        <Doughnut data={userDistributionData} options={doughnutOptions} />
                    </ChartCard>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <ChartCard title="Service Usage" subtitle="Active sessions by service" loading={loadingData}>
                        <Bar data={serviceUsageData} options={chartOptions} />
                    </ChartCard>
                </Grid>
                <Grid item xs={12} md={6}>
                    <ChartCard title="Daily Active Users" subtitle="User engagement by day of week" loading={loadingData}>
                        <Bar data={activityData} options={chartOptions} />
                    </ChartCard>
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 0 }}>
                <Grid item xs={12}>
                    <ChartCard title="SOS Alerts Trend" subtitle="Emergency alerts over time" loading={loadingData} height={200}>
                        <Line data={sosTrendData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } } }} />
                    </ChartCard>
                </Grid>
            </Grid>

            {data.featureUsage && data.featureUsage.length > 0 && (
                <Card sx={{ mt: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Most Used Features</Typography>
                        <Grid container spacing={3}>
                            {data.featureUsage.map((feature, index) => (
                                <Grid item xs={12} key={feature.name || index}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="body2" fontWeight={600}>{feature.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {feature.users?.toLocaleString() || 0} users
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={feature.usage || 0}
                                                sx={{
                                                    height: 8,
                                                    borderRadius: 4,
                                                    bgcolor: alpha(feature.color || chartColors.primary, 0.1),
                                                    '& .MuiLinearProgress-bar': { bgcolor: feature.color || chartColors.primary, borderRadius: 4 },
                                                }}
                                            />
                                        </Box>
                                        <Chip
                                            label={`${feature.usage || 0}%`}
                                            size="small"
                                            sx={{
                                                bgcolor: alpha(feature.color || chartColors.primary, 0.1),
                                                color: feature.color || chartColors.primary,
                                                fontWeight: 700,
                                                minWidth: 60,
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default Analytics;

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
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Button,
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    People as PeopleIcon,
    Chat as ChatIcon,
    Security as SecurityIcon,
    Notifications as NotificationsIcon,
    Refresh as RefreshIcon,
    FiberManualRecord as LiveIcon,
    Timeline as TimelineIcon,
    ShowChart as ShowChartIcon,
    PieChart as PieChartIcon,
    BarChart as BarChartIcon,
    Public as PublicIcon,
    PhoneAndroid as MobileIcon,
    Tablet as TabletIcon,
    Computer as DesktopIcon,
    LocationOn as LocationIcon,
    Speed as SpeedIcon,
    Verified as VerifiedIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Group as GroupIcon,
    FamilyRestroom as FamilyIcon,
    ChildCare as ChildCareIcon,
    Sms as SmsIcon,
    Download as DownloadIcon,
    FileDownload as ExportIcon,
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
import { Line, Bar, Doughnut, Radar, PolarArea } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics, setTimeRange } from '../store/slices/analyticsSlice';
import { adminApi } from '../services/api';
import { DateRangePicker, ExportButton, SparklineChart, DonutChart, BarChart } from '../components/UI';

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
    purple: '#8b5cf6',
    teal: '#14b8a6',
};

const chartOptions = (showLegend = true, comparisonMode = false) => ({
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
            mode: 'index',
            intersect: false,
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
    interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
    },
});

const StatCard = ({ title, value, subtitle, icon, color, trend, loading, sparklineData, sparklineColor }) => (
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
                    {sparklineData && sparklineData.length > 0 && !loading && (
                        <SparklineChart data={sparklineData} color={sparklineColor || color || '#6366f1'} width={50} height={18} />
                    )}
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

const TopUserItem = ({ user, rank }) => (
    <ListItem sx={{ px: 1.5, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
        <ListItemAvatar>
            <Avatar sx={{ bgcolor: rank <= 3 ? alpha(chartColors.primary, 0.1) : alpha(chartColors.primary, 0.05), color: rank <= 3 ? chartColors.primary : 'text.secondary', fontSize: '0.8rem', fontWeight: 700 }}>
                #{rank}
            </Avatar>
        </ListItemAvatar>
        <ListItemText
            primary={<Typography variant="body2" fontWeight={500}>{user.name}</Typography>}
            secondary={<Typography variant="caption" color="text.secondary">{user.location}</Typography>}
        />
        <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" fontWeight={600}>{user.sessions}</Typography>
            <Typography variant="caption" color="text.secondary">sessions</Typography>
        </Box>
    </ListItem>
);

const Analytics = () => {
    const dispatch = useDispatch();
    const { analytics, loading, timeRange } = useSelector((state) => state.analytics);
    const [chartData, setChartData] = useState(null);
    const [loadingData, setLoadingData] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [comparisonMode, setComparisonMode] = useState(false);
    const [dateRange, setDateRange] = useState('month');

    const sparklineUsersData = [45, 52, 48, 61, 58, 72, 68, 80, 75, 88, 82, 95];
    const sparklineSessionsData = [120, 145, 138, 162, 155, 178, 168, 195, 182, 210, 198, 225];
    const sparklineSOSData = [5, 3, 8, 2, 6, 1, 4, 2, 3, 1, 2, 4];
    const sparklineMessagesData = [890, 920, 1100, 1250, 1180, 1320, 1450, 1380, 1520, 1680, 1750, 1900];
    const sparklineRetentionData = [85, 87, 84, 89, 91, 88, 92, 90, 93, 91, 94, 92];

    const fetchAnalyticsData = useCallback(async () => {
        setLoadingData(true);
        try {
            dispatch(fetchAnalytics(timeRange));
            const response = await adminApi.getAnalytics(timeRange);
            if (response.data.success) {
                setChartData(response.data);
            }
            setLastUpdated(new Date());
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

    const formatLastUpdated = () => {
        if (!lastUpdated) return '';
        const now = new Date();
        const diff = Math.floor((now - lastUpdated) / 1000);
        if (diff < 60) return 'Updated just now';
        if (diff < 3600) return `Updated ${Math.floor(diff / 60)}m ago`;
        return `Updated at ${lastUpdated.toLocaleTimeString()}`;
    };

    const data = chartData || analytics || {};

    const userGrowthData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'New Users',
                data: [120, 145, 132, 168, 155, 182, 175, 198, 210, 225, 218, 245],
                borderColor: chartColors.primary,
                backgroundColor: alpha(chartColors.primary, 0.1),
                fill: true,
            },
            {
                label: 'Active Users',
                data: [890, 920, 875, 950, 980, 1020, 1080, 1150, 1220, 1280, 1350, 1420],
                borderColor: chartColors.success,
                backgroundColor: alpha(chartColors.success, 0.1),
                fill: true,
            },
        ],
    };

    const userDistributionData = {
        labels: ['Women', 'Parents', 'Guardians', 'Friends', 'Others'],
        datasets: [{
            data: [45, 25, 15, 10, 5],
            backgroundColor: [chartColors.secondary, chartColors.success, chartColors.warning, chartColors.info, chartColors.primary],
            borderWidth: 0,
        }],
    };

    const serviceUsageData = {
        labels: ['AI Chat', 'Safety Alerts', 'Family Tracking', 'Child Care', 'Safe Routes'],
        datasets: [{
            label: 'Active Sessions',
            data: [450, 280, 190, 120, 80],
            backgroundColor: [chartColors.primary, chartColors.secondary, chartColors.success, chartColors.warning, chartColors.info],
            borderRadius: 6,
        }],
    };

    const deviceData = [
        { label: 'Mobile', value: 1245, color: chartColors.primary },
        { label: 'Tablet', value: 580, color: chartColors.secondary },
        { label: 'Desktop', value: 320, color: chartColors.success },
    ];

    const locationData = [
        { label: 'Mumbai', value: 2450 },
        { label: 'Delhi', value: 1890 },
        { label: 'Bangalore', value: 1450 },
        { label: 'Chennai', value: 980 },
        { label: 'Hyderabad', value: 720 },
    ];

    const sosTrendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'SOS Alerts',
            data: [45, 38, 52, 28, 42, 35],
            borderColor: chartColors.danger,
            backgroundColor: alpha(chartColors.danger, 0.1),
            fill: true,
        }],
    };

    const retentionData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
            label: 'Retention Rate %',
            data: [85, 72, 65, 58],
            backgroundColor: alpha(chartColors.success, 0.8),
            borderRadius: 6,
        }],
    };

    const engagementData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Daily Active Users',
            data: [3200, 4100, 3800, 4500, 5200, 2800, 1900],
            backgroundColor: alpha(chartColors.primary, 0.8),
            borderRadius: 6,
        }],
    };

    const messageTrendData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
            label: 'Messages (K)',
            data: [45, 52, 48, 61],
            borderColor: chartColors.secondary,
            backgroundColor: 'transparent',
            tension: 0.4,
        }],
    };

    const featureRadarData = {
        labels: ['Safety', 'AI Chat', 'Family', 'Child Care', 'Navigation', 'Emergency'],
        datasets: [{
            label: 'Feature Usage',
            data: [92, 85, 78, 65, 72, 88],
            backgroundColor: alpha(chartColors.primary, 0.2),
            borderColor: chartColors.primary,
            pointBackgroundColor: chartColors.primary,
        }],
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

    const topUsers = [
        { name: 'Priya Sharma', location: 'Mumbai', sessions: 145 },
        { name: 'Anita Desai', location: 'Delhi', sessions: 132 },
        { name: 'Kavitha Reddy', location: 'Bangalore', sessions: 128 },
        { name: 'Meera Patel', location: 'Ahmedabad', sessions: 115 },
        { name: 'Sunita Singh', location: 'Jaipur', sessions: 98 },
    ];

    const stats = {
        totalUsers: '8,542',
        activeSessions: '1,420',
        sosAlerts: '35',
        messages: '245K',
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { color: '#94a3b8', usePointStyle: true, padding: 12, font: { size: 10 } } },
            tooltip: { backgroundColor: '#1e293b', titleColor: '#fff', bodyColor: '#fff', padding: 12, cornerRadius: 8 },
        },
        cutout: '65%',
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>Analytics</Typography>
                        <Chip icon={<LiveIcon sx={{ fontSize: 12 }} />} label="LIVE" size="small" sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 700, fontSize: '0.65rem', height: 22, animation: 'pulse 2s infinite' }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Comprehensive platform metrics and performance insights
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <DateRangePicker value={dateRange} onChange={setDateRange} />
                    <ToggleButtonGroup value={timeRange} exclusive onChange={handleTimeRangeChange} size="small">
                        <ToggleButton value="day">Today</ToggleButton>
                        <ToggleButton value="week">Week</ToggleButton>
                        <ToggleButton value="month">Month</ToggleButton>
                        <ToggleButton value="year">Year</ToggleButton>
                    </ToggleButtonGroup>
                    <ExportButton data={[]} filename="analytics_export" />
                    <Tooltip title={lastUpdated ? formatLastUpdated() : 'Fetching...'}>
                        <IconButton onClick={fetchAnalyticsData} disabled={loadingData} size="small">
                            {loadingData ? <CircularProgress size={20} /> : <RefreshIcon />}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {loadingData && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard title="Total Users" value={stats.totalUsers} subtitle="All registered accounts" icon={<PeopleIcon />} color={chartColors.primary} trend={12} loading={loadingData} sparklineData={sparklineUsersData} sparklineColor={chartColors.primary} />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard title="Active Sessions" value={stats.activeSessions} subtitle="Currently online" icon={<SpeedIcon />} color={chartColors.success} trend={8} loading={loadingData} sparklineData={sparklineSessionsData} sparklineColor={chartColors.success} />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard title="SOS Alerts" value={stats.sosAlerts} subtitle="This period" icon={<SecurityIcon />} color={chartColors.danger} trend={-15} loading={loadingData} sparklineData={sparklineSOSData} sparklineColor={chartColors.danger} />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard title="AI Messages" value={stats.messages} subtitle="Total conversations" icon={<ChatIcon />} color={chartColors.secondary} trend={18} loading={loadingData} sparklineData={sparklineMessagesData} sparklineColor={chartColors.secondary} />
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
                                        <Button size="small" endIcon={<LocationIcon />} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>View All</Button>
                                    </Box>
                                    <BarChart data={locationData} height={140} barColor={chartColors.primary} showLabels={true} />
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
                                    <BarChart data={deviceData} height={100} horizontal={true} barColor={chartColors.primary} showLabels={true} />
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: chartColors.primary }} />
                                            <Typography variant="caption" color="text.secondary">Mobile 58%</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: chartColors.secondary }} />
                                            <Typography variant="caption" color="text.secondary">Tablet 27%</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: chartColors.success }} />
                                            <Typography variant="caption" color="text.secondary">Desktop 15%</Typography>
                                        </Box>
                                    </Box>
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
                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Most active users this month</Typography>
                                    <List disablePadding>
                                        {topUsers.map((user, index) => (
                                            <TopUserItem key={index} user={user} rank={index + 1} />
                                        ))}
                                    </List>
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
                                        <Chip label="Weekly" size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
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
                                        <Typography variant="caption" color="text.secondary">Last 6 months</Typography>
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

import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    LinearProgress,
    Skeleton,
    Avatar,
    IconButton,
    Tooltip,
    alpha,
    Divider,
    Badge,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    Snackbar,
} from '@mui/material';
import {
    People as PeopleIcon,
    Warning as WarningIcon,
    FamilyRestroom as FamilyIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Refresh as RefreshIcon,
    ArrowForward as ArrowForwardIcon,
    Chat as ChatIcon,
    ChildCare as ChildCareIcon,
    Security as SecurityIcon,
    LocationOn as LocationIcon,
    Notifications as NotificationsIcon,
    Dashboard as DashboardIcon,
    GppGood as GppGoodIcon,
    Settings as SettingsIcon,
    Add as AddIcon,
    Update as UpdateIcon,
    FiberManualRecord as LiveIcon,
    Schedule as ScheduleIcon,
    Speed as SpeedIcon,
    TrackChanges as TrackIcon,
    Phone as PhoneIcon,
    Group as GroupIcon,
    Storage as StorageIcon,
    CloudDone as CloudIcon,
    Analytics as AnalyticsIcon,
    NotificationsActive as AlertBellIcon,
    Shield as ShieldIcon,
    Favorite as HeartIcon,
    PhoneAndroid as MobileIcon,
    Tablet as TabletIcon,
    Computer as DesktopIcon,
    Public as GlobeIcon,
    Timeline as TimelineIcon,
    ShowChart as ShowChartIcon,
    Error as ErrorIcon,
    CheckCircle,
    VerifiedUser,
    TrendingUp,
    Schedule,
    Call,
    Sms,
    Pending as PendingIcon,
    ArrowUpward,
    ArrowDownward,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStats, fetchAnalytics } from '../store/slices/analyticsSlice';
import { fetchAlerts, resolveAlert } from '../store/slices/alertsSlice';
import { fetchUsers } from '../store/slices/usersSlice';
import { adminApi } from '../services/api';
import { selectCurrentUser, isAdminRole } from '../store/slices/authSlice';
import { SparklineChart, DonutChart, BarChart } from '../components/UI';

const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
};

const MetricCard = ({ title, value, icon, color, trend, trendValue, subtitle, onClick, loading, sparklineData, sparklineColor, tooltip }) => {
    const TrendIcon = trend >= 0 ? TrendingUpIcon : TrendingDownIcon;
    const trendColor = trend >= 0 ? '#10b981' : '#ef4444';

    return (
        <Card
            sx={{
                height: '100%',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': onClick ? {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${alpha(color || '#6366f1', 0.25)}`,
                    borderColor: alpha(color || '#6366f1', 0.5)
                } : {},
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: `linear-gradient(90deg, ${color || '#6366f1'}, ${alpha(color || '#6366f1', 0.3)})`,
                },
            }}
            onClick={onClick}
        >
            <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {title}
                            </Typography>
                            {tooltip && (
                                <Tooltip title={tooltip} arrow placement="top">
                                    <IconButton size="small" sx={{ p: 0, minWidth: 16, width: 16, height: 16 }}>
                                        <ShieldIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                        {loading ? (
                            <Skeleton width={80} height={36} />
                        ) : (
                            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: 'text.primary', letterSpacing: '-0.02em' }}>
                                {value}
                            </Typography>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            {subtitle && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                    {subtitle}
                                </Typography>
                            )}
                            {trend !== undefined && !loading && (
                                <Chip
                                    icon={<TrendIcon sx={{ fontSize: 11 }} />}
                                    label={`${trend >= 0 ? '+' : ''}${trend}%`}
                                    size="small"
                                    sx={{
                                        height: 18,
                                        fontSize: '0.6rem',
                                        fontWeight: 700,
                                        bgcolor: alpha(trendColor, 0.1),
                                        color: trendColor,
                                        '& .MuiChip-icon': { color: trendColor }
                                    }}
                                />
                            )}
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.75 }}>
                        <Box
                            sx={{
                                p: 1,
                                borderRadius: 1.5,
                                background: `linear-gradient(135deg, ${alpha(color || '#6366f1', 0.15)} 0%, ${alpha(color || '#6366f1', 0.05)} 100%)`,
                                color: color || '#6366f1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {icon}
                        </Box>
                        {sparklineData && sparklineData.length > 0 && !loading && (
                            <SparklineChart
                                data={sparklineData}
                                color={sparklineColor || color || '#6366f1'}
                                width={50}
                                height={18}
                            />
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

const StatusIndicator = ({ status, label }) => {
    const colors = {
        online: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        offline: '#64748b'
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
                sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: colors[status] || colors.offline,
                    boxShadow: status === 'online' ? `0 0 8px ${colors[status]}` : 'none',
                    animation: status === 'online' ? 'pulse 2s infinite' : 'none',
                }}
            />
            <Typography variant="caption" color="text.secondary">{label}</Typography>
        </Box>
    );
};

const ProgressCard = ({ title, value, max, color, icon, showPercentage = true }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;

    return (
        <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ color: color || 'primary.main', display: 'flex' }}>{icon}</Box>
                    <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>{title}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                    {value}/{max} {showPercentage && `(${percentage.toFixed(0)}%)`}
                </Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: alpha(color || '#6366f1', 0.1),
                    '& .MuiLinearProgress-bar': {
                        bgcolor: color || '#6366f1',
                        borderRadius: 3,
                    },
                }}
            />
        </Box>
    );
};

const QuickActionCard = ({ title, description, icon, color, onClick, badge, urgent }) => (
    <Card
        sx={{
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: '1px solid',
            borderColor: urgent ? alpha('#ef4444', 0.3) : 'divider',
            background: urgent ? `linear-gradient(135deg, ${alpha('#ef4444', 0.05)} 0%, transparent 100%)` : 'background.default',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4,
                borderColor: alpha(color, 0.5),
            },
        }}
        onClick={onClick}
    >
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.75 }}>
            <Box sx={{ p: 1.25, borderRadius: 1.5, background: alpha(color, 0.1), color: color }}>
                {icon}
            </Box>
            <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>{title}</Typography>
                    {badge && (
                        <Chip
                            label={badge}
                            size="small"
                            sx={{
                                height: 16,
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                bgcolor: alpha(color, 0.15),
                                color: color,
                            }}
                        />
                    )}
                </Box>
                <Typography variant="caption" color="text.secondary">{description}</Typography>
            </Box>
            <ArrowForwardIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
        </CardContent>
    </Card>
);

const ServiceCard = ({ service, loading }) => (
    <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
            <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: alpha(service.color, 0.1), color: service.color }}>
                {service.icon}
            </Box>
            <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600}>{service.name}</Typography>
                {loading ? (
                    <Skeleton width={80} height={14} />
                ) : (
                    <Typography variant="caption" color="text.secondary">
                        {service.users?.toLocaleString() || 0} active users
                    </Typography>
                )}
            </Box>
            {loading ? (
                <Skeleton width={50} height={24} sx={{ borderRadius: 2 }} />
            ) : (
                <Chip
                    label={`${service.percentage || 0}%`}
                    size="small"
                    sx={{ bgcolor: alpha(service.color, 0.1), color: service.color, fontWeight: 700 }}
                />
            )}
        </Box>
        {loading ? (
            <Skeleton variant="rectangular" height={6} sx={{ borderRadius: 3 }} />
        ) : (
            <LinearProgress
                variant="determinate"
                value={service.percentage || 0}
                sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: alpha(service.color, 0.1),
                    '& .MuiLinearProgress-bar': { bgcolor: service.color, borderRadius: 3 },
                }}
            />
        )}
    </Box>
);

const ActivityItem = ({ item, isLast }) => {
    const getActivityIcon = (action) => {
        switch (action?.toLowerCase()) {
            case 'sos': return { icon: <WarningIcon />, color: '#ef4444' };
            case 'login': return { icon: <GppGoodIcon />, color: '#10b981' };
            case 'create': return { icon: <AddIcon />, color: '#6366f1' };
            case 'update': return { icon: <SettingsIcon />, color: '#8b5cf6' };
            case 'delete': return { icon: <WarningIcon />, color: '#f59e0b' };
            default: return { icon: <DashboardIcon />, color: '#64748b' };
        }
    };

    const activity = getActivityIcon(item.action);

    return (
        <Box sx={{ display: 'flex', gap: 1.5, position: 'relative' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(activity.color, 0.1), color: activity.color, fontSize: '0.75rem' }}>
                    {activity.icon}
                </Avatar>
                {!isLast && <Box sx={{ width: 2, flex: 1, minHeight: 20, bgcolor: 'divider', mt: 0.75 }} />}
            </Box>
            <Box sx={{ flex: 1, pb: isLast ? 0 : 1.5 }}>
                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>
                    {item.user_name || item.user || 'System'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {item.action?.charAt(0).toUpperCase() + (item.action || '').slice(1)}
                    {item.description && ` - ${item.description}`}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                    <ScheduleIcon sx={{ fontSize: 10, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem' }}>
                        {formatTime(item.created_at || item.timestamp)}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

const StatRow = ({ icon, label, value, subValue, color, trend }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ color: color || 'primary.main', display: 'flex' }}>{icon}</Box>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" fontWeight={600}>{value}</Typography>
            {subValue && <Typography variant="caption" color="text.secondary">{subValue}</Typography>}
            {trend !== undefined && (
                <Chip
                    label={trend >= 0 ? `+${trend}%` : `${trend}%`}
                    size="small"
                    sx={{
                        height: 16,
                        fontSize: '0.55rem',
                        fontWeight: 700,
                        bgcolor: alpha(trend >= 0 ? '#10b981' : '#ef4444', 0.1),
                        color: trend >= 0 ? '#10b981' : '#ef4444',
                    }}
                />
            )}
        </Box>
    </Box>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { stats, analytics, loading: statsLoading } = useSelector((state) => state.analytics);
    const { alerts, loading: alertsLoading } = useSelector((state) => state.alerts);
    const { users, loading: usersLoading } = useSelector((state) => state.users);
    const user = useSelector(selectCurrentUser);
    const isAdmin = user ? isAdminRole(user.role) : false;

    const [activity, setActivity] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [serviceStats, setServiceStats] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [loadingActivity, setLoadingActivity] = useState(true);
    const [loadingPage, setLoadingPage] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const activeSOSCount = alerts?.filter(a => a.status === 'active').length || 0;
    const resolvedToday = alerts?.filter(a => {
        if (a.status === 'resolved') {
            const resolvedDate = new Date(a.resolved_at);
            const today = new Date();
            return resolvedDate.toDateString() === today.toDateString();
        }
        return false;
    }).length || 0;

    const sparklineUsersData = dashboardStats?.sparklineUsers || [45, 52, 48, 61, 58, 72, 68, 80, 75, 88, 82, 95];
    const sparklineWomenData = dashboardStats?.sparklineWomen || [28, 35, 32, 42, 48, 55, 52, 62, 58, 68, 72, 80];
    const sparklineFamilyData = dashboardStats?.sparklineFamily || [12, 18, 22, 28, 35, 42, 48, 55, 62, 70, 78, 85];
    const sparklineSOSData = dashboardStats?.sparklineSOS || [8, 5, 12, 3, 9, 2, 6, 3, 5, 2, 1, 3];
    const sparklineMessagesData = dashboardStats?.sparklineMessages || [120, 145, 132, 168, 155, 182, 175, 198, 210, 225, 218, 245];
    const sparklineSessionsData = dashboardStats?.sparklineSessions || [890, 920, 875, 950, 980, 1020, 1080, 1150, 1220, 1280, 1350, 1420];

    const weeklyData = [
        { label: 'Mon', value: 2450 },
        { label: 'Tue', value: 3120 },
        { label: 'Wed', value: 2890 },
        { label: 'Thu', value: 3560 },
        { label: 'Fri', value: 3980 },
        { label: 'Sat', value: 2450 },
        { label: 'Sun', value: 1890 },
    ];

    const deviceData = [
        { label: 'Mobile', value: dashboardStats?.mobileUsers || 1245, color: '#6366f1' },
        { label: 'Tablet', value: dashboardStats?.tabletUsers || 580, color: '#ec4899' },
        { label: 'Desktop', value: dashboardStats?.desktopUsers || 320, color: '#10b981' },
    ];

    const serviceDistribution = [
        { label: 'AI Chat', value: dashboardStats?.aiChatUsers || 450, color: '#6366f1' },
        { label: 'Safety', value: dashboardStats?.safetyUsers || 380, color: '#ec4899' },
        { label: 'Family', value: dashboardStats?.familyUsers || 280, color: '#10b981' },
        { label: 'Child Care', value: dashboardStats?.childCareUsers || 150, color: '#f59e0b' },
    ];

    const topLocations = [
        { label: 'Mumbai', value: dashboardStats?.mumbaiUsers || 2450, percentage: 28 },
        { label: 'Delhi', value: dashboardStats?.delhiUsers || 1890, percentage: 22 },
        { label: 'Bangalore', value: dashboardStats?.bangaloreUsers || 1450, percentage: 17 },
        { label: 'Chennai', value: dashboardStats?.chennaiUsers || 980, percentage: 11 },
        { label: 'Hyderabad', value: dashboardStats?.hyderabadUsers || 720, percentage: 8 },
    ];

    const fetchDashboardData = useCallback(async () => {
        setLoadingPage(true);
        try {
            const results = await Promise.allSettled([
                dispatch(fetchStats()).unwrap(),
                dispatch(fetchAlerts()).unwrap(),
                dispatch(fetchUsers({ limit: 8, sortBy: 'created_at', sortOrder: 'DESC' })).unwrap(),
                adminApi.getActivityLogs({ limit: 10 }),
                adminApi.getAnalytics('month'),
            ]);

            const [statsResult, alertsResult, usersResult, activityRes, analyticsRes] = results;

            if (statsResult.status === 'fulfilled' && statsResult.value) {
                setDashboardStats(statsResult.value);
            }

            if (activityRes.status === 'fulfilled' && activityRes.value.data.success) {
                setActivity(activityRes.value.data.logs || []);
            }

            if (usersResult.status === 'fulfilled' && usersResult.value?.users) {
                setRecentUsers(usersResult.value.users.slice(0, 6));
            }

            if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data.success && analyticsRes.value.data.services) {
                setServiceStats(analyticsRes.value.data.services);
            } else {
                setServiceStats([]);
            }

            setLastUpdated(new Date());
        } catch (err) {
            console.error('Dashboard error:', err);
            setSnackbar({ open: true, message: 'Error loading dashboard data', severity: 'error' });
        } finally {
            setLoadingActivity(false);
            setLoadingPage(false);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 60000);
        return () => clearInterval(interval);
    }, [fetchDashboardData]);

    const handleRefresh = async () => {
        await fetchDashboardData();
        setSnackbar({ open: true, message: 'Dashboard refreshed', severity: 'success' });
    };

    const formatLastUpdated = () => {
        if (!lastUpdated) return '';
        const now = new Date();
        const diff = Math.floor((now - lastUpdated) / 1000);
        if (diff < 60) return 'Updated just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return `Updated ${lastUpdated.toLocaleTimeString()}`;
    };

    const services = serviceStats.length > 0 ? serviceStats : [
        { name: 'AI Chat Assistant', users: stats?.aiChatUsers || dashboardStats?.aiChatUsers || 0, percentage: stats?.aiChatPercentage || dashboardStats?.aiChatPercentage || 0, icon: <ChatIcon sx={{ fontSize: 16 }} />, color: '#6366f1' },
        { name: 'Women Safety', users: stats?.safetyUsers || dashboardStats?.safetyUsers || 0, percentage: stats?.safetyPercentage || dashboardStats?.safetyPercentage || 0, icon: <SecurityIcon sx={{ fontSize: 16 }} />, color: '#ec4899' },
        { name: 'Child Care', users: stats?.childCareUsers || dashboardStats?.childCareUsers || 0, percentage: stats?.childCarePercentage || dashboardStats?.childCarePercentage || 0, icon: <ChildCareIcon sx={{ fontSize: 16 }} />, color: '#10b981' },
        { name: 'Family Tracking', users: stats?.familyUsers || dashboardStats?.familyUsers || 0, percentage: stats?.familyPercentage || dashboardStats?.familyPercentage || 0, icon: <FamilyIcon sx={{ fontSize: 16 }} />, color: '#f59e0b' },
    ];

    const totalUsers = stats?.totalUsers || dashboardStats?.totalUsers || 0;
    const womenUsers = stats?.women || dashboardStats?.women || 0;
    const familyCount = stats?.families || dashboardStats?.families || 0;

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                                {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                            </Typography>
                            <Chip
                                icon={<LiveIcon sx={{ fontSize: 10 }} />}
                                label="LIVE"
                                size="small"
                                sx={{
                                    bgcolor: alpha('#10b981', 0.1),
                                    color: '#10b981',
                                    fontWeight: 700,
                                    fontSize: '0.65rem',
                                    height: 22,
                                    animation: 'pulse 2s infinite',
                                    '& .MuiChip-icon': { color: '#10b981' }
                                }}
                            />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • Real-time Platform Overview
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Tooltip title={`Last updated: ${lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}`}>
                            <Chip
                                icon={<UpdateIcon sx={{ fontSize: 14 }} />}
                                label={lastUpdated ? formatLastUpdated() : 'Not synced'}
                                size="small"
                                variant="outlined"
                                sx={{ borderColor: 'divider' }}
                            />
                        </Tooltip>
                        <Button
                            variant="contained"
                            startIcon={<RefreshIcon />}
                            onClick={handleRefresh}
                            disabled={loadingPage}
                            size="small"
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            Refresh
                        </Button>
                    </Box>
                </Box>
            </Box>

            {(loadingPage || statsLoading) && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

            <Grid container spacing={2.5} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    <MetricCard
                        title="Total Users"
                        value={loadingPage ? '-' : totalUsers.toLocaleString()}
                        icon={<PeopleIcon />}
                        color="#6366f1"
                        trend={stats?.userGrowth || dashboardStats?.userGrowth || 12}
                        trendValue="vs last month"
                        subtitle="All registered accounts"
                        onClick={() => navigate('/users')}
                        loading={loadingPage}
                        sparklineData={sparklineUsersData}
                        sparklineColor="#6366f1"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <MetricCard
                        title="Women Users"
                        value={loadingPage ? '-' : womenUsers.toLocaleString()}
                        icon={<SecurityIcon />}
                        color="#ec4899"
                        trend={stats?.womenGrowth || dashboardStats?.womenGrowth || 8}
                        trendValue="vs last month"
                        subtitle="Safety app users"
                        onClick={() => navigate('/users?role=woman')}
                        loading={loadingPage}
                        sparklineData={sparklineWomenData}
                        sparklineColor="#ec4899"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <MetricCard
                        title="Family Groups"
                        value={loadingPage ? '-' : familyCount.toLocaleString()}
                        icon={<FamilyIcon />}
                        color="#10b981"
                        trend={stats?.familyGrowth || dashboardStats?.familyGrowth || 15}
                        trendValue="vs last month"
                        subtitle="Active family circles"
                        onClick={() => navigate('/families')}
                        loading={loadingPage}
                        sparklineData={sparklineFamilyData}
                        sparklineColor="#10b981"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <MetricCard
                        title="Active SOS"
                        value={loadingPage ? '-' : activeSOSCount}
                        icon={<WarningIcon />}
                        color={activeSOSCount > 0 ? '#ef4444' : '#10b981'}
                        subtitle={activeSOSCount > 0 ? 'Need immediate attention' : 'No active emergencies'}
                        onClick={() => navigate('/sos-alerts')}
                        loading={loadingPage}
                        sparklineData={sparklineSOSData}
                        sparklineColor={activeSOSCount > 0 ? '#ef4444' : '#10b981'}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    <MetricCard
                        title="Messages Today"
                        value={loadingPage ? '-' : (dashboardStats?.messagesToday || 2450).toLocaleString()}
                        icon={<ChatIcon />}
                        color="#8b5cf6"
                        trend={dashboardStats?.messageGrowth || 18}
                        subtitle="AI chat interactions"
                        loading={loadingPage}
                        sparklineData={sparklineMessagesData}
                        sparklineColor="#8b5cf6"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <MetricCard
                        title="Active Sessions"
                        value={loadingPage ? '-' : (dashboardStats?.activeSessions || 1420).toLocaleString()}
                        icon={<TrackIcon />}
                        color="#f59e0b"
                        trend={dashboardStats?.sessionGrowth || 12}
                        subtitle="Currently online"
                        loading={loadingPage}
                        sparklineData={sparklineSessionsData}
                        sparklineColor="#f59e0b"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <MetricCard
                        title="Response Time"
                        value={loadingPage ? '-' : (dashboardStats?.responseTime || '45s')}
                        icon={<SpeedIcon />}
                        color="#14b8a6"
                        trend={dashboardStats?.responseTimeImprovement || -8}
                        subtitle="Avg alert response"
                        loading={loadingPage}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <MetricCard
                        title="Resolution Rate"
                        value={loadingPage ? '-' : (dashboardStats?.resolutionRate || '94%')}
                        icon={<GppGoodIcon />}
                        color="#22c55e"
                        trend={dashboardStats?.resolutionImprovement || 5}
                        subtitle="SOS cases handled"
                        onClick={() => navigate('/sos-alerts?status=resolved')}
                        loading={loadingPage}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <ShowChartIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                                            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '0.95rem' }}>Weekly Activity</Typography>
                                        </Box>
                                        <Chip label="This Week" size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
                                    </Box>
                                    <BarChart data={weeklyData} height={140} barColor="#6366f1" showLabels={true} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="caption" color="text.secondary" display="block">Total</Typography>
                                            <Typography variant="body2" fontWeight={700}>{dashboardStats?.weeklyTotal?.toLocaleString() || '20,340'}</Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="caption" color="text.secondary" display="block">Avg/Day</Typography>
                                            <Typography variant="body2" fontWeight={700}>{dashboardStats?.weeklyAverage?.toLocaleString() || '2,906'}</Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="caption" color="text.secondary" display="block">Peak</Typography>
                                            <Typography variant="body2" fontWeight={700} color="success.main">{dashboardStats?.weeklyPeak?.toLocaleString() || '3,980'}</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <GppGoodIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                                            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '0.95rem' }}>Service Usage</Typography>
                                        </Box>
                                        <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/analytics')} sx={{ fontSize: '0.7rem', textTransform: 'none' }}>
                                            Details
                                        </Button>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                        <DonutChart data={serviceDistribution} size={140} strokeWidth={18} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <MobileIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                                            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '0.95rem' }}>Device Breakdown</Typography>
                                        </Box>
                                    </Box>
                                    <BarChart data={deviceData} height={120} horizontal={true} barColor="#6366f1" showLabels={true} />
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                            <MobileIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                                            <Typography variant="caption" color="text.secondary">Mobile</Typography>
                                            <Typography variant="caption" fontWeight={600}>{dashboardStats?.mobilePercentage || '58'}%</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                            <TabletIcon sx={{ fontSize: 16, color: '#ec4899' }} />
                                            <Typography variant="caption" color="text.secondary">Tablet</Typography>
                                            <Typography variant="caption" fontWeight={600}>{dashboardStats?.tabletPercentage || '27'}%</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                            <DesktopIcon sx={{ fontSize: 16, color: '#10b981' }} />
                                            <Typography variant="caption" color="text.secondary">Desktop</Typography>
                                            <Typography variant="caption" fontWeight={600}>{dashboardStats?.desktopPercentage || '15'}%</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <GlobeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                                            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '0.95rem' }}>Top Locations</Typography>
                                        </Box>
                                        <Button size="small" endIcon={<ArrowForwardIcon />} sx={{ fontSize: '0.7rem', textTransform: 'none' }}>
                                            All Regions
                                        </Button>
                                    </Box>
                                    {topLocations.map((location, index) => (
                                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.25 }}>
                                            <Typography variant="caption" sx={{ width: 16, color: 'text.secondary', fontWeight: index < 3 ? 700 : 400 }}>
                                                {index + 1}.
                                            </Typography>
                                            <Typography variant="body2" sx={{ flex: 1 }}>{location.label}</Typography>
                                            <Typography variant="caption" fontWeight={600}>{location.value.toLocaleString()}</Typography>
                                            <Chip label={`${location.percentage}%`} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }} />
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AlertBellIcon sx={{ color: 'error.main', fontSize: 20 }} />
                                            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '0.95rem' }}>Recent Alerts</Typography>
                                        </Box>
                                        <Button size="small" color="error" onClick={() => navigate('/sos-alerts')} sx={{ textTransform: 'none' }}>
                                            View All Alerts
                                        </Button>
                                    </Box>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: 'text.secondary' }}>Location</TableCell>
                                                    <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: 'text.secondary' }}>Type</TableCell>
                                                    <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: 'text.secondary' }}>Time</TableCell>
                                                    <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: 'text.secondary' }}>Status</TableCell>
                                                    <TableCell align="right" sx={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: 'text.secondary' }}>Action</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {alerts.slice(0, 5).map((alert) => (
                                                    <TableRow key={alert.id} sx={{ '&:hover': { bgcolor: 'action.hover' }, cursor: 'pointer' }} onClick={() => navigate(`/sos-alerts/${alert.id}`)}>
                                                        <TableCell sx={{ fontSize: '0.8rem' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                                {alert.location || 'Unknown'}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell sx={{ fontSize: '0.8rem' }}>
                                                            <Chip label={alert.type || 'Emergency'} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b' }} />
                                                        </TableCell>
                                                        <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{formatTime(alert.createdAt)}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={alert.status === 'active' ? 'Active' : 'Resolved'}
                                                                size="small"
                                                                sx={{
                                                                    height: 20,
                                                                    fontSize: '0.65rem',
                                                                    fontWeight: 600,
                                                                    bgcolor: alert.status === 'active' ? alpha('#ef4444', 0.1) : alpha('#10b981', 0.1),
                                                                    color: alert.status === 'active' ? '#ef4444' : '#10b981',
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Button size="small" variant="outlined" sx={{ minWidth: 0, px: 1.5, fontSize: '0.7rem' }} onClick={(e) => { e.stopPropagation(); navigate(`/sos-alerts/${alert.id}`) }}>
                                                                {alert.status === 'active' ? 'Respond' : 'View'}
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {alerts.length === 0 && !loadingPage && (
                                                    <TableRow>
                                                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                                            <GppGoodIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                                                            <Typography variant="body2" color="text.secondary">No recent alerts</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <SpeedIcon sx={{ color: 'primary.main' }} />
                                            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '0.95rem' }}>Alert Performance</Typography>
                                        </Box>
                                    </Box>
                                    <Grid container spacing={2}>
                                        <Grid item xs={4}>
                                            <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, bgcolor: alpha('#6366f1', 0.05), border: '1px solid', borderColor: alpha('#6366f1', 0.1) }}>
                                                <SpeedIcon sx={{ fontSize: 20, color: '#6366f1', mb: 0.5 }} />
                                                <Typography variant="h6" fontWeight={700}>{dashboardStats?.avgResponseTime || '45s'}</Typography>
                                                <Typography variant="caption" color="text.secondary">Response</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, bgcolor: alpha('#10b981', 0.05), border: '1px solid', borderColor: alpha('#10b981', 0.1) }}>
                                                <CheckCircle sx={{ fontSize: 20, color: '#10b981', mb: 0.5 }} />
                                                <Typography variant="h6" fontWeight={700}>{dashboardStats?.resolutionRate || '94%'}</Typography>
                                                <Typography variant="caption" color="text.secondary">Resolved</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, bgcolor: alpha('#8b5cf6', 0.05), border: '1px solid', borderColor: alpha('#8b5cf6', 0.1) }}>
                                                <ScheduleIcon sx={{ fontSize: 20, color: '#8b5cf6', mb: 0.5 }} />
                                                <Typography variant="h6" fontWeight={700}>{dashboardStats?.avgHandleTime || '3.2m'}</Typography>
                                                <Typography variant="caption" color="text.secondary">Handle</Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AlertBellIcon sx={{ color: activeSOSCount > 0 ? 'error.main' : 'success.main' }} />
                                            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '0.95rem' }}>Alert Status</Typography>
                                        </Box>
                                        <Chip
                                            label={activeSOSCount > 0 ? 'ATTENTION' : 'ALL CLEAR'}
                                            size="small"
                                            sx={{
                                                bgcolor: activeSOSCount > 0 ? 'error.main' : 'success.main',
                                                color: 'white',
                                                fontWeight: 700,
                                                fontSize: '0.6rem',
                                                animation: activeSOSCount > 0 ? 'pulse 1.5s infinite' : 'none',
                                            }}
                                        />
                                    </Box>
                                    <ProgressCard title="Active Alerts" value={activeSOSCount} max={50} color="#ef4444" icon={<WarningIcon sx={{ fontSize: 14 }} />} />
                                    <ProgressCard title="Resolved Today" value={resolvedToday} max={100} color="#10b981" icon={<GppGoodIcon sx={{ fontSize: 14 }} />} />
                                    <ProgressCard title="Pending Review" value={dashboardStats?.pendingAlerts || 8} max={100} color="#f59e0b" icon={<PendingIcon sx={{ fontSize: 14 }} />} />
                                    <ProgressCard title="Escalated" value={dashboardStats?.escalatedAlerts || 2} max={100} color="#dc2626" icon={<ErrorIcon sx={{ fontSize: 14 }} />} />
                                    {activeSOSCount > 0 ? (
                                        <Button fullWidth variant="contained" color="error" onClick={() => navigate('/sos-alerts?status=active')} sx={{ mt: 2, fontWeight: 600 }}>
                                            View {activeSOSCount} Active Alerts
                                        </Button>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 2 }}>
                                            <GppGoodIcon sx={{ fontSize: 32, color: 'success.main', mb: 0.5 }} />
                                            <Typography variant="body2" color="text.secondary">No active alerts</Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <GroupIcon sx={{ color: 'primary.main' }} />
                                            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '0.95rem' }}>New Users</Typography>
                                        </Box>
                                        <Chip label="Today" size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
                                    </Box>
                                    {loadingPage ? (
                                        [...Array(5)].map((_, i) => (
                                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75 }}>
                                                <Skeleton variant="circular" width={28} height={28} />
                                                <Box sx={{ flex: 1 }}>
                                                    <Skeleton width="60%" height={14} />
                                                    <Skeleton width="40%" height={10} />
                                                </Box>
                                            </Box>
                                        ))
                                    ) : recentUsers.length > 0 ? (
                                        <List disablePadding>
                                            {recentUsers.map((u) => (
                                                <ListItem
                                                    key={u.id}
                                                    disablePadding
                                                    sx={{ py: 0.5, cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: 'action.hover' }, px: 0.5, mx: -0.5 }}
                                                    onClick={() => navigate(`/users/${u.id}`)}
                                                >
                                                    <ListItemAvatar>
                                                        <Avatar sx={{ width: 28, height: 28, bgcolor: alpha('#6366f1', 0.1), color: 'primary.main', fontSize: '0.75rem' }}>
                                                            {u.first_name?.charAt(0) || u.email?.charAt(0) || 'U'}
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={<Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>{u.first_name || u.email?.split('@')[0]}</Typography>}
                                                        secondary={
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <Chip
                                                                    label={u.is_verified ? 'Verified' : 'Pending'}
                                                                    size="small"
                                                                    sx={{
                                                                        fontSize: '0.55rem',
                                                                        height: 14,
                                                                        bgcolor: u.is_verified ? alpha('#10b981', 0.1) : alpha('#f59e0b', 0.1),
                                                                        color: u.is_verified ? '#10b981' : '#f59e0b',
                                                                    }}
                                                                />
                                                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem' }}>
                                                                    {formatTime(u.created_at)}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 2 }}>
                                            <PeopleIcon sx={{ fontSize: 28, color: 'text.disabled', mb: 0.5 }} />
                                            <Typography variant="body2" color="text.secondary">No new users today</Typography>
                                        </Box>
                                    )}
                                    <Button fullWidth size="small" onClick={() => navigate('/users')} sx={{ mt: 1.5, textTransform: 'none' }}>
                                        View All Users
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CloudIcon sx={{ color: 'primary.main' }} />
                                            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '0.95rem' }}>System Status</Typography>
                                        </Box>
                                    </Box>
                                    <StatusIndicator status="online" label="API Services" />
                                    <StatusIndicator status="online" label="Database" />
                                    <StatusIndicator status="online" label="Authentication" />
                                    <StatusIndicator status="online" label="Push Notifications" />
                                    <StatusIndicator status={dashboardStats?.emailStatus || 'warning'} label="Email Service" />
                                    <Divider sx={{ my: 1.5 }} />
                                    <StatRow icon={<TrendingUpIcon sx={{ fontSize: 16 }} />} label="System Uptime" value={dashboardStats?.uptime || '99.8%'} trend={0.2} color="#10b981" />
                                    <StatRow icon={<SpeedIcon sx={{ fontSize: 16 }} />} label="Avg Response" value={dashboardStats?.avgResponseTime || '124ms'} trend={-15} color="#6366f1" />
                                    <StatRow icon={<StorageIcon sx={{ fontSize: 16 }} />} label="Storage" value={dashboardStats?.storageUsed || '42.3 GB'} subValue="/ 100 GB" color="#8b5cf6" />
                                    <StatRow icon={<Call sx={{ fontSize: 16 }} />} label="API Calls Today" value={dashboardStats?.apiCallsToday || '1.2M'} trend={18} color="#ec4899" />
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <NotificationsIcon sx={{ color: 'primary.main' }} />
                                            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '0.95rem' }}>Recent Activity</Typography>
                                        </Box>
                                        <Button size="small" onClick={() => navigate('/activity')} sx={{ fontSize: '0.7rem', textTransform: 'none' }}>
                                            View All
                                        </Button>
                                    </Box>
                                    {loadingActivity ? (
                                        [...Array(5)].map((_, i) => (
                                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                                                <Skeleton variant="circular" width={28} height={28} />
                                                <Box sx={{ flex: 1 }}>
                                                    <Skeleton width="60%" height={12} />
                                                    <Skeleton width="40%" height={10} />
                                                </Box>
                                            </Box>
                                        ))
                                    ) : activity.length > 0 ? (
                                        activity.slice(0, 5).map((item, index) => (
                                            <ActivityItem key={item.id || index} item={item} isLast={index === Math.min(activity.length, 5) - 1} />
                                        ))
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 2 }}>
                                            <GppGoodIcon sx={{ fontSize: 28, color: 'text.disabled', mb: 0.5 }} />
                                            <Typography variant="body2" color="text.secondary">No recent activity</Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
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

export default Dashboard;

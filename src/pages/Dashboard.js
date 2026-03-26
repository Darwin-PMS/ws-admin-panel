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
    Paper,
    alpha,
    Divider,
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
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStats, fetchAnalytics } from '../store/slices/analyticsSlice';
import { fetchAlerts } from '../store/slices/alertsSlice';
import { adminApi } from '../services/api';
import { selectCurrentUser, isAdminRole } from '../store/slices/authSlice';

const StatCard = ({ title, value, icon, color, trend, trendValue, subtitle, onClick, loading }) => (
    <Card
        sx={{
            height: '100%',
            cursor: onClick ? 'pointer' : 'default',
            transition: 'all 0.3s ease',
            '&:hover': onClick ? { transform: 'translateY(-4px)', boxShadow: 6 } : {},
        }}
        onClick={onClick}
    >
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                        {title}
                    </Typography>
                    {loading ? (
                        <Skeleton width={80} height={48} />
                    ) : (
                        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: color || 'text.primary' }}>
                            {value}
                        </Typography>
                    )}
                    {subtitle && (
                        <Typography variant="caption" color="text.secondary">
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
                                {trend >= 0 ? '+' : ''}{trend}% {trendValue || 'from last month'}
                            </Typography>
                        </Box>
                    )}
                </Box>
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        background: alpha(color || '#6366f1', 0.1),
                        color: color || '#6366f1',
                    }}
                >
                    {icon}
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const QuickActionCard = ({ title, description, icon, color, onClick }) => (
    <Card
        sx={{
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
        }}
        onClick={onClick}
    >
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, background: alpha(color, 0.1), color: color }}>
                {icon}
            </Box>
            <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>{title}</Typography>
                <Typography variant="caption" color="text.secondary">{description}</Typography>
            </Box>
            <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
        </CardContent>
    </Card>
);

const ServiceCard = ({ service, loading }) => (
    <Grid item xs={12} sm={6}>
        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha(service.color, 0.1), color: service.color }}>
                    {service.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600}>{service.name}</Typography>
                    {loading ? (
                        <Skeleton width={80} />
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
                <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 4 }} />
            ) : (
                <LinearProgress
                    variant="determinate"
                    value={service.percentage || 0}
                    sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(service.color, 0.1),
                        '& .MuiLinearProgress-bar': { bgcolor: service.color, borderRadius: 4 },
                    }}
                />
            )}
        </Box>
    </Grid>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { stats, loading: statsLoading } = useSelector((state) => state.analytics);
    const { sosAlerts } = useSelector((state) => state.alerts);
    const user = useSelector(selectCurrentUser);
    const isAdmin = user ? isAdminRole(user.role) : false;

    const [activity, setActivity] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [serviceStats, setServiceStats] = useState([]);
    const [loadingActivity, setLoadingActivity] = useState(true);
    const [loadingPage, setLoadingPage] = useState(true);

    const activeSOSCount = sosAlerts?.filter(a => a.status === 'active').length || 0;

    const fetchData = useCallback(async () => {
        setLoadingPage(true);
        try {
            dispatch(fetchStats());
            dispatch(fetchAlerts());

            const [activityRes, usersRes, analyticsRes] = await Promise.all([
                adminApi.getActivityLogs({ limit: 10 }).catch(() => ({ data: { success: false, logs: [] } })),
                adminApi.getUsers({ limit: 5, sortBy: 'created_at', sortOrder: 'DESC' }).catch(() => ({ data: { success: false, users: [] } })),
                adminApi.getAnalytics('month').catch(() => ({ data: { success: false } })),
            ]);

            if (activityRes.data.success) {
                setActivity(activityRes.data.logs || []);
            }

            if (usersRes.data.success) {
                setRecentUsers(usersRes.data.users || []);
            }

            if (analyticsRes.data.success && analyticsRes.data.services) {
                setServiceStats(analyticsRes.data.services);
            } else {
                setServiceStats([]);
            }
        } catch (err) {
            console.error('Dashboard error:', err);
        } finally {
            setLoadingActivity(false);
            setLoadingPage(false);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const getActivityIcon = (action) => {
        switch (action?.toLowerCase()) {
            case 'sos': return <WarningIcon sx={{ color: 'error.main' }} />;
            case 'login': return <GppGoodIcon sx={{ color: 'success.main' }} />;
            case 'create': return <AddIcon sx={{ color: 'primary.main' }} />;
            default: return <DashboardIcon sx={{ color: 'text.secondary' }} />;
        }
    };

    const formatActivityTime = (timestamp) => {
        if (!timestamp) return 'Unknown';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    const services = serviceStats.length > 0 ? serviceStats : [
        { name: 'AI Chat Assistant', users: stats?.aiChatUsers || 0, percentage: stats?.aiChatPercentage || 0, icon: <ChatIcon />, color: '#6366f1' },
        { name: 'Women Safety', users: stats?.safetyUsers || 0, percentage: stats?.safetyPercentage || 0, icon: <SecurityIcon />, color: '#ec4899' },
        { name: 'Child Care', users: stats?.childCareUsers || 0, percentage: stats?.childCarePercentage || 0, icon: <ChildCareIcon />, color: '#10b981' },
        { name: 'Family Tracking', users: stats?.familyUsers || 0, percentage: stats?.familyPercentage || 0, icon: <FamilyIcon />, color: '#f59e0b' },
    ];

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                            {isAdmin ? 'Welcome back, Admin!' : 'Welcome back!'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {isAdmin ? `Here's what's happening with your platform today.` : `Here's your personal dashboard overview.`}
                        </Typography>
                    </Box>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData} disabled={loadingPage}>
                        Refresh
                    </Button>
                </Box>
            </Box>

            {(loadingPage || statsLoading) && <LinearProgress sx={{ mb: 3 }} />}

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Users"
                        value={stats?.totalUsers?.toLocaleString() || '0'}
                        icon={<PeopleIcon />}
                        color="#6366f1"
                        trend={stats?.userGrowth || 0}
                        trendValue="from last month"
                        subtitle="Active registrations"
                        onClick={() => navigate('/users')}
                        loading={loadingPage}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Women Users"
                        value={stats?.women?.toLocaleString() || '0'}
                        icon={<SecurityIcon />}
                        color="#ec4899"
                        trend={stats?.womenGrowth || 0}
                        onClick={() => navigate('/users?role=woman')}
                        loading={loadingPage}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Families"
                        value={stats?.families?.toLocaleString() || '0'}
                        icon={<FamilyIcon />}
                        color="#10b981"
                        trend={stats?.familyGrowth || 0}
                        onClick={() => navigate('/families')}
                        loading={loadingPage}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Active SOS"
                        value={activeSOSCount}
                        icon={<WarningIcon />}
                        color={activeSOSCount > 0 ? '#ef4444' : '#10b981'}
                        onClick={() => navigate('/sos-alerts')}
                        loading={loadingPage}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Quick Actions</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <QuickActionCard
                                        title="View All Users"
                                        description="Manage user accounts and permissions"
                                        icon={<PeopleIcon />}
                                        color="#6366f1"
                                        onClick={() => navigate('/users')}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <QuickActionCard
                                        title="SOS Alerts"
                                        description={`${activeSOSCount} alerts require attention`}
                                        icon={<WarningIcon />}
                                        color={activeSOSCount > 0 ? '#ef4444' : '#10b981'}
                                        onClick={() => navigate('/sos-alerts')}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <QuickActionCard
                                        title="Live Tracking"
                                        description="Monitor user locations in real-time"
                                        icon={<LocationIcon />}
                                        color="#8b5cf6"
                                        onClick={() => navigate('/tracking/live')}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <QuickActionCard
                                        title="Content Management"
                                        description="Manage app content and resources"
                                        icon={<ChatIcon />}
                                        color="#f59e0b"
                                        onClick={() => navigate('/content')}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" fontWeight={700}>Service Usage Overview</Typography>
                                <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/analytics')}>
                                    View Analytics
                                </Button>
                            </Box>
                            <Grid container spacing={2}>
                                {services.map((service) => (
                                    <ServiceCard key={service.name} service={service} loading={loadingPage} />
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={700}>Recent Activity</Typography>
                                <Button size="small" onClick={() => navigate('/activity')}>View All</Button>
                            </Box>
                            {loadingActivity ? (
                                [...Array(5)].map((_, i) => (
                                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
                                        <Skeleton variant="circular" width={36} height={36} />
                                        <Box sx={{ flex: 1 }}>
                                            <Skeleton width="60%" />
                                            <Skeleton width="40%" />
                                        </Box>
                                    </Box>
                                ))
                            ) : (
                                <Box>
                                    {activity.map((item, index) => (
                                        <Box key={item.id || index}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
                                                <Avatar sx={{ width: 36, height: 36, bgcolor: alpha('#6366f1', 0.1), color: 'primary.main' }}>
                                                    {getActivityIcon(item.action)}
                                                </Avatar>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {item.user_name || item.user || 'System'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {item.action?.charAt(0).toUpperCase() + (item.action || '').slice(1)}
                                                        {item.description && ` - ${item.description}`}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatActivityTime(item.created_at || item.timestamp)}
                                                </Typography>
                                            </Box>
                                            {index < activity.length - 1 && <Divider />}
                                        </Box>
                                    ))}
                                    {activity.length === 0 && (
                                        <Box sx={{ textAlign: 'center', py: 4 }}>
                                            <Typography color="text.secondary">No recent activity</Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Card sx={{ mb: 3, border: activeSOSCount > 0 ? `2px solid ${alpha('#ef4444', 0.3)}` : 'none' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <NotificationsIcon sx={{ color: activeSOSCount > 0 ? 'error.main' : 'text.secondary' }} />
                                    <Typography variant="h6" fontWeight={700}>Active Alerts</Typography>
                                </Box>
                                <Chip
                                    label={activeSOSCount}
                                    size="small"
                                    sx={{
                                        bgcolor: activeSOSCount > 0 ? 'error.main' : 'success.main',
                                        color: 'white',
                                        fontWeight: 700,
                                        animation: activeSOSCount > 0 ? 'pulse 1.5s infinite' : 'none',
                                    }}
                                />
                            </Box>
                            {activeSOSCount > 0 ? (
                                <Button fullWidth variant="contained" color="error" onClick={() => navigate('/sos-alerts?status=active')} sx={{ mb: 2 }}>
                                    View {activeSOSCount} Active Alerts
                                </Button>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 3 }}>
                                    <GppGoodIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                                    <Typography variant="body2" color="text.secondary">All clear! No active alerts.</Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={700}>New Users</Typography>
                                <Button size="small" onClick={() => navigate('/users')}>View All</Button>
                            </Box>
                            {loadingActivity ? (
                                [...Array(5)].map((_, i) => (
                                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
                                        <Skeleton variant="circular" width={36} height={36} />
                                        <Box sx={{ flex: 1 }}>
                                            <Skeleton width="70%" />
                                            <Skeleton width="40%" />
                                        </Box>
                                    </Box>
                                ))
                            ) : recentUsers.length > 0 ? (
                                <Box>
                                    {recentUsers.slice(0, 5).map((u) => (
                                        <Box key={u.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
                                            <Avatar sx={{ width: 36, height: 36, bgcolor: alpha('#6366f1', 0.1), color: 'primary.main' }}>
                                                {u.first_name?.charAt(0) || u.email?.charAt(0) || 'U'}
                                            </Avatar>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="body2" fontWeight={500} noWrap>
                                                    {u.first_name ? `${u.first_name} ${u.last_name || ''}` : u.email?.split('@')[0]}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" noWrap>
                                                    {u.role?.charAt(0).toUpperCase() + u.role?.slice(1) || 'User'}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={u.is_verified ? 'Verified' : 'Pending'}
                                                size="small"
                                                sx={{
                                                    fontSize: '0.65rem',
                                                    height: 20,
                                                    bgcolor: u.is_verified ? alpha('#10b981', 0.1) : alpha('#f59e0b', 0.1),
                                                    color: u.is_verified ? '#10b981' : '#f59e0b',
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 3 }}>
                                    <PeopleIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                                    <Typography variant="body2" color="text.secondary">No users yet</Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Quick Links</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {[
                                    { icon: <SettingsIcon />, label: 'Settings', path: '/settings', color: '#64748b' },
                                    { icon: <LocationIcon />, label: 'Location History', path: '/tracking/history', color: '#8b5cf6' },
                                    { icon: <GppGoodIcon />, label: 'Permissions', path: '/permissions', color: '#f59e0b' },
                                    { icon: <FamilyIcon />, label: 'Family Groups', path: '/families', color: '#10b981' },
                                ].map((link) => (
                                    <Button
                                        key={link.path}
                                        variant="text"
                                        startIcon={<Box sx={{ color: link.color }}>{link.icon}</Box>}
                                        onClick={() => navigate(link.path)}
                                        sx={{ justifyContent: 'flex-start', color: 'text.primary', '&:hover': { bgcolor: 'action.hover' } }}
                                    >
                                        {link.label}
                                    </Button>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;

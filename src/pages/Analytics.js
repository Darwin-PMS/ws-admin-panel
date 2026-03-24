import React, { useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    ToggleButton,
    ToggleButtonGroup,
    Skeleton,
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    People as PeopleIcon,
    Chat as ChatIcon,
    Security as SecurityIcon,
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
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics, setTimeRange } from '../store/slices/analyticsSlice';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Analytics = () => {
    const dispatch = useDispatch();
    const { analytics, loading, timeRange } = useSelector((state) => state.analytics);

    const fetchAnalyticsData = React.useCallback(() => {
        dispatch(fetchAnalytics(timeRange));
    }, [dispatch, timeRange]);

    React.useEffect(() => {
        fetchAnalyticsData();
    }, [fetchAnalyticsData]);

    const handleTimeRangeChange = (event, newRange) => {
        if (newRange !== null) {
            dispatch(setTimeRange(newRange));
        }
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#94a3b8',
                },
            },
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                },
                ticks: {
                    color: '#94a3b8',
                },
            },
            y: {
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                },
                ticks: {
                    color: '#94a3b8',
                },
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: '#94a3b8',
                },
            },
        },
        cutout: '70%',
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Analytics
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Track usage and performance metrics
                    </Typography>
                </Box>
                <ToggleButtonGroup
                    value={timeRange}
                    exclusive
                    onChange={handleTimeRangeChange}
                    size="small"
                >
                    <ToggleButton value="day">Day</ToggleButton>
                    <ToggleButton value="week">Week</ToggleButton>
                    <ToggleButton value="month">Month</ToggleButton>
                    <ToggleButton value="year">Year</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Quick Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Total Users
                                    </Typography>
                                    {loading ? <Skeleton width={80} height={40} /> : (
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {analytics?.stats?.totalUsers?.toLocaleString() || '0'}
                                        </Typography>
                                    )}
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                        <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                                        <Typography variant="caption" color="success.main">
                                            {analytics?.stats?.userTrend ? `${analytics.stats.userTrend > 0 ? '+' : ''}${analytics.stats.userTrend}%` : '0%'} this {timeRange}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.main', color: 'white' }}>
                                    <PeopleIcon />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Messages
                                    </Typography>
                                    {loading ? <Skeleton width={80} height={40} /> : (
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {analytics?.stats?.messages ? `${(analytics.stats.messages / 1000).toFixed(1)}K` : '0'}
                                        </Typography>
                                    )}
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                        <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                                        <Typography variant="caption" color="success.main">
                                            {analytics?.stats?.messageTrend ? `${analytics.stats.messageTrend > 0 ? '+' : ''}${analytics.stats.messageTrend}%` : '0%'} this {timeRange}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'secondary.main', color: 'white' }}>
                                    <ChatIcon />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Active Sessions
                                    </Typography>
                                    {loading ? <Skeleton width={80} height={40} /> : (
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {analytics?.stats?.sessions?.toLocaleString() || '0'}
                                        </Typography>
                                    )}
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                        <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                                        <Typography variant="caption" color="success.main">
                                            {analytics?.stats?.sessionTrend ? `${analytics.stats.sessionTrend > 0 ? '+' : ''}${analytics.stats.sessionTrend}%` : '0%'} this {timeRange}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.main', color: 'white' }}>
                                    <SecurityIcon />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Avg. Response
                                    </Typography>
                                    {loading ? <Skeleton width={80} height={40} /> : (
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {analytics?.stats?.responseTime || '0'}s
                                        </Typography>
                                    )}
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                        <TrendingDownIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                                        <Typography variant="caption" color="success.main">
                                            {analytics?.stats?.responseTrend ? `${analytics.stats.responseTrend}%` : '0%'} this {timeRange}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.main', color: 'white' }}>
                                    <ChatIcon />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts Row 1 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} lg={8}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                User Growth
                            </Typography>
                            <Box sx={{ height: 300 }}>
                                {loading ? (
                                    <Skeleton variant="rectangular" height="100%" />
                                ) : (
                                    <Line data={analytics?.userGrowth || { labels: [], datasets: [] }} options={chartOptions} />
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} lg={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                User Distribution
                            </Typography>
                            <Box sx={{ height: 300 }}>
                                {loading ? (
                                    <Skeleton variant="rectangular" height="100%" />
                                ) : (
                                    <Doughnut data={analytics?.userDistribution || { labels: [], datasets: [] }} options={doughnutOptions} />
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts Row 2 */}
            <Grid container spacing={3}>
                <Grid item xs={12} lg={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                Service Usage
                            </Typography>
                            <Box sx={{ height: 300 }}>
                                {loading ? (
                                    <Skeleton variant="rectangular" height="100%" />
                                ) : (
                                    <Bar data={analytics?.serviceUsage || { labels: [], datasets: [] }} options={chartOptions} />
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} lg={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                Daily Activity
                            </Typography>
                            <Box sx={{ height: 300 }}>
                                {loading ? (
                                    <Skeleton variant="rectangular" height="100%" />
                                ) : (
                                    <Bar data={analytics?.activity || { labels: [], datasets: [] }} options={chartOptions} />
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Analytics;

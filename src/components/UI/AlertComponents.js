import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Avatar,
    LinearProgress,
    Tooltip,
    alpha,
    IconButton,
} from '@mui/material';
import {
    Warning as WarningIcon,
    CheckCircle as CheckIcon,
    LocationOn as LocationIcon,
    Phone as PhoneIcon,
    Message as MessageIcon,
    FiberManualRecord as LiveIcon,
} from '@mui/icons-material';

const StatItem = ({ label, value, color, icon, urgent, loading }) => (
    <Box sx={{ flex: '1 1 120px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
            sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: alpha(color, 0.1),
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: urgent ? 'pulse 1.5s infinite' : 'none',
            }}
        >
            {icon}
        </Box>
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color, lineHeight: 1 }}>
                {loading ? '-' : value}
            </Typography>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
        </Box>
    </Box>
);

const AlertStatsBar = ({ stats, loading }) => {
    const { active = 0, resolved = 0, total = 0, critical = 0 } = stats || {};

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 2,
                p: 2,
                mb: 3,
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                flexWrap: 'wrap',
            }}
        >
            <StatItem
                label="Active Alerts"
                value={active}
                color="#ef4444"
                icon={<WarningIcon />}
                urgent={active > 0}
                loading={loading}
            />
            <StatItem
                label="Critical"
                value={critical}
                color="#dc2626"
                icon={<LiveIcon />}
                urgent={critical > 0}
                loading={loading}
            />
            <StatItem
                label="Resolved"
                value={resolved}
                color="#10b981"
                icon={<CheckIcon />}
                loading={loading}
            />
            <StatItem
                label="Total"
                value={total}
                color="#6366f1"
                icon={<MessageIcon />}
                loading={loading}
            />
        </Box>
    );
};

const AlertCard = ({ alert, onView, onResolve, onCall, compact = false }) => {
    const [expanded, setExpanded] = useState(false);
    const [urgencyScore, setUrgencyScore] = useState(0);

    const isActive = alert.status === 'active';
    const timeSinceAlert = alert.createdAt ? Math.floor((Date.now() - new Date(alert.createdAt).getTime()) / 1000) : 0;

    useEffect(() => {
        if (isActive && timeSinceAlert < 300) {
            const score = Math.min(100, Math.floor((timeSinceAlert / 300) * 100));
            setUrgencyScore(score);
        }
    }, [isActive, timeSinceAlert]);

    const getUrgencyColor = () => {
        if (urgencyScore > 80) return '#ef4444';
        if (urgencyScore > 50) return '#f59e0b';
        return '#10b981';
    };

    const getTimeDisplay = () => {
        if (timeSinceAlert < 60) return `${timeSinceAlert}s`;
        if (timeSinceAlert < 3600) return `${Math.floor(timeSinceAlert / 60)}m`;
        if (timeSinceAlert < 86400) return `${Math.floor(timeSinceAlert / 3600)}h`;
        return `${Math.floor(timeSinceAlert / 86400)}d`;
    };

    const statusConfig = {
        active: { color: '#ef4444', bg: '#fef2f2', label: 'Active', icon: '\u{1F514}' },
        resolved: { color: '#10b981', bg: '#ecfdf5', label: 'Resolved', icon: '\u2713' },
    };

    const status = statusConfig[alert.status] || statusConfig.active;

    return (
        <Card
            sx={{
                mb: 1.5,
                border: isActive ? `2px solid ${alpha('#ef4444', 0.3 + (urgencyScore / 100) * 0.4)}` : '1px solid transparent',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                    borderColor: isActive ? '#ef4444' : 'transparent',
                },
                animation: isActive ? `urgencyPulse ${2 - (urgencyScore / 100)}s infinite` : 'none',
                '@keyframes urgencyPulse': {
                    '0%, 100%': { boxShadow: `0 0 0 0 ${alpha('#ef4444', 0.4)}` },
                    '50%': { boxShadow: `0 0 0 ${4 + urgencyScore / 25}px ${alpha('#ef4444', 0.2)}` },
                },
            }}
            onClick={() => onView && onView(alert)}
        >
            <CardContent sx={{ p: compact ? 2 : 3, '&:last-child': { pb: compact ? 2 : 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ position: 'relative' }}>
                        <Avatar
                            sx={{
                                bgcolor: status.color,
                                width: compact ? 40 : 48,
                                height: compact ? 40 : 48,
                                fontSize: compact ? '1rem' : '1.25rem',
                            }}
                        >
                            {status.icon}
                        </Avatar>
                        {isActive && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: -2,
                                    right: -2,
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: '#ef4444',
                                    border: '2px solid',
                                    borderColor: 'background.paper',
                                    animation: 'blink 1s infinite',
                                    '@keyframes blink': {
                                        '0%, 100%': { opacity: 1 },
                                        '50%': { opacity: 0.5 },
                                    },
                                }}
                            />
                        )}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                            <Typography variant={compact ? 'body1' : 'subtitle1'} fontWeight={700} noWrap>
                                {alert.userName || 'Unknown User'}
                            </Typography>
                            <Chip
                                label={alert.type || 'emergency'}
                                size="small"
                                sx={{
                                    height: 20,
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    bgcolor: alpha('#f59e0b', 0.1),
                                    color: '#f59e0b',
                                }}
                            />
                            {isActive && timeSinceAlert > 60 && (
                                <Tooltip title="Time since alert triggered">
                                    <Chip
                                        icon={<MessageIcon sx={{ fontSize: 12 }} />}
                                        label={getTimeDisplay()}
                                        size="small"
                                        sx={{
                                            height: 20,
                                            fontSize: '0.65rem',
                                            fontWeight: 600,
                                            bgcolor: alpha(getUrgencyColor(), 0.1),
                                            color: getUrgencyColor(),
                                            animation: urgencyScore > 50 ? 'pulse 2s infinite' : 'none',
                                        }}
                                    />
                                </Tooltip>
                            )}
                        </Box>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mb: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: expanded ? 'normal' : 'nowrap',
                                maxWidth: compact ? 300 : 400,
                            }}
                        >
                            {alert.message || 'Emergency alert triggered'}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            {alert.location && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 150 }}>
                                        {alert.location}
                                    </Typography>
                                </Box>
                            )}
                            {alert.userPhone && (
                                <Tooltip title="Call user">
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCall && onCall(alert.userPhone);
                                        }}
                                        sx={{ ml: -0.5 }}
                                    >
                                        <PhoneIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <Chip
                            label={status.label}
                            size="small"
                            sx={{
                                bgcolor: status.bg,
                                color: status.color,
                                fontWeight: 600,
                                fontSize: '0.7rem',
                            }}
                        />
                        {isActive && (
                            <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onResolve && onResolve(alert);
                                }}
                                sx={{ mt: 1 }}
                            >
                                Resolve
                            </Button>
                        )}
                    </Box>
                </Box>

                {isActive && urgencyScore > 30 && !compact && (
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">Response Priority</Typography>
                            <Typography variant="caption" sx={{ color: getUrgencyColor(), fontWeight: 600 }}>
                                {urgencyScore > 80 ? 'CRITICAL' : urgencyScore > 50 ? 'HIGH' : 'MEDIUM'}
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={urgencyScore}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: alpha(getUrgencyColor(), 0.1),
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: getUrgencyColor(),
                                    borderRadius: 3,
                                },
                            }}
                        />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export { AlertCard, AlertStatsBar };

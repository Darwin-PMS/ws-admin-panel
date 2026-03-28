import React from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup, Tooltip, Chip, alpha } from '@mui/material';
import {
    CompareArrows as CompareIcon,
    TrendingUp as UpIcon,
    TrendingDown as DownIcon,
    TrendingFlat as FlatIcon,
} from '@mui/icons-material';

const ComparisonToggle = ({ enabled, onChange, currentValue, previousValue, label = 'Compare with previous period' }) => {
    const getChange = () => {
        if (!currentValue || !previousValue) return null;
        const diff = currentValue - previousValue;
        const percent = ((diff / previousValue) * 100).toFixed(1);
        const isPositive = diff > 0;
        const isNeutral = diff === 0;

        return {
            diff,
            percent: Math.abs(percent),
            isPositive,
            isNeutral,
            direction: isNeutral ? 'flat' : isPositive ? 'up' : 'down',
        };
    };

    const change = getChange();

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title={label} arrow>
                <ToggleButton
                    value="compare"
                    selected={enabled}
                    onChange={() => onChange(!enabled)}
                    size="small"
                    sx={{
                        borderRadius: 2,
                        px: 2,
                        py: 0.75,
                        borderColor: enabled ? 'primary.main' : 'divider',
                        bgcolor: enabled ? alpha('#6366f1', 0.08) : 'transparent',
                        '&.Mui-selected': {
                            bgcolor: alpha('#6366f1', 0.12),
                            '&:hover': {
                                bgcolor: alpha('#6366f1', 0.16),
                            },
                        },
                        '&:hover': {
                            bgcolor: alpha('#6366f1', 0.04),
                        },
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CompareIcon sx={{ fontSize: 18 }} />
                        <Typography variant="body2" fontWeight={500}>
                            Compare
                        </Typography>
                    </Box>
                </ToggleButton>
            </Tooltip>

            {enabled && change && (
                <Chip
                    icon={
                        change.direction === 'up' ? <UpIcon sx={{ fontSize: 16 }} /> :
                        change.direction === 'down' ? <DownIcon sx={{ fontSize: 16 }} /> :
                        <FlatIcon sx={{ fontSize: 16 }} />
                    }
                    label={`${change.isPositive ? '+' : change.isNeutral ? '' : '-'}${change.percent}%`}
                    size="small"
                    sx={{
                        bgcolor: change.isNeutral ? alpha('#64748b', 0.1) :
                            change.isPositive ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                        color: change.isNeutral ? '#64748b' :
                            change.isPositive ? '#10b981' : '#ef4444',
                        fontWeight: 600,
                        '& .MuiChip-icon': {
                            color: 'inherit',
                        },
                    }}
                />
            )}
        </Box>
    );
};

export default ComparisonToggle;

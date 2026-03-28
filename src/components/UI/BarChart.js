import React from 'react';
import { Box, Typography, alpha } from '@mui/material';

const BarChart = ({ data = [], height = 120, showLabels = true, horizontal = false, barColor = '#6366f1' }) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));

    if (horizontal) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {data.map((item, index) => {
                    const percentage = (item.value / maxValue) * 100;
                    return (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {showLabels && (
                                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80, textAlign: 'right' }}>
                                    {item.label}
                                </Typography>
                            )}
                            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    sx={{
                                        height: 20,
                                        width: `${percentage}%`,
                                        bgcolor: alpha(barColor, 0.2),
                                        borderRadius: 1,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&::after': {
                                            content: '""',
                                            position: 'absolute',
                                            left: 0,
                                            top: 0,
                                            bottom: 0,
                                            width: `${percentage}%`,
                                            background: `linear-gradient(90deg, ${barColor}, ${alpha(barColor, 0.7)})`,
                                            borderRadius: 1,
                                        }
                                    }}
                                />
                                <Typography variant="caption" fontWeight={600} sx={{ minWidth: 35 }}>
                                    {item.value.toLocaleString()}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height, gap: 0.5 }}>
            {data.map((item, index) => {
                const percentage = (item.value / maxValue) * 100;
                return (
                    <Box key={index} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.6rem' }}>
                            {item.value.toLocaleString()}
                        </Typography>
                        <Box
                            sx={{
                                width: '100%',
                                height: `${percentage}%`,
                                bgcolor: alpha(barColor, 0.3),
                                borderRadius: '4px 4px 0 0',
                                position: 'relative',
                                minHeight: 4,
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: `${(item.value / maxValue) * 100}%`,
                                    background: `linear-gradient(180deg, ${barColor}, ${alpha(barColor, 0.6)})`,
                                    borderRadius: '4px 4px 0 0',
                                }
                            }}
                        />
                        {showLabels && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.55rem', mt: 0.5 }}>
                                {item.label}
                            </Typography>
                        )}
                    </Box>
                );
            })}
        </Box>
    );
};

export default BarChart;

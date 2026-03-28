import React from 'react';
import { Box, Typography } from '@mui/material';

const DonutChart = ({ data = [], size = 120, strokeWidth = 20, showLegend = true }) => {
    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const centerX = size / 2;
    const centerY = size / 2;

    let currentOffset = 0;

    const segments = data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const dashLength = (percentage / 100) * circumference;
        const dashOffset = circumference - currentOffset;
        currentOffset += dashLength;

        return {
            ...item,
            percentage,
            dashLength,
            dashOffset,
        };
    });

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ position: 'relative' }}>
                <svg width={size} height={size}>
                    <circle
                        cx={centerX}
                        cy={centerY}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        opacity={0.1}
                    />
                    {segments.map((segment, index) => (
                        <circle
                            key={index}
                            cx={centerX}
                            cy={centerY}
                            r={radius}
                            fill="none"
                            stroke={segment.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${segment.dashLength} ${circumference - segment.dashLength}`}
                            strokeDashoffset={segment.dashOffset}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${centerX} ${centerY})`}
                        />
                    ))}
                </svg>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h5" fontWeight={700}>
                        {total.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Total
                    </Typography>
                </Box>
            </Box>
            {showLegend && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    {segments.map((segment, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    bgcolor: segment.color,
                                }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                                {segment.label}
                            </Typography>
                            <Typography variant="caption" fontWeight={600}>
                                {segment.percentage.toFixed(1)}%
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default DonutChart;

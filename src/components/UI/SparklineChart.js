import React from 'react';
import { Box } from '@mui/material';

const SparklineChart = ({ data = [], color = '#6366f1', width = 80, height = 30, showArea = true }) => {
    if (!data || data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    const areaPoints = `0,${height} ${points} ${width},${height}`;

    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                {showArea && (
                    <defs>
                        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                )}
                {showArea && (
                    <polygon
                        points={areaPoints}
                        fill={`url(#gradient-${color.replace('#', '')})`}
                    />
                )}
                <polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle
                    cx={width}
                    cy={height - ((data[data.length - 1] - min) / range) * height}
                    r={3}
                    fill={color}
                />
            </svg>
        </Box>
    );
};

export default SparklineChart;

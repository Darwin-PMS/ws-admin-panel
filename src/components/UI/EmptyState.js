import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import {
    Inbox as InboxIcon,
    SearchOff as EmptySearchIcon,
    ErrorOutline as ErrorIcon,
    CheckCircleOutline as SuccessIcon,
    InfoOutlined as InfoIcon,
} from '@mui/icons-material';

const EmptyState = ({
    icon: CustomIcon,
    icon: iconName,
    title,
    description,
    action,
    variant = 'default',
    sx = {}
}) => {
    const icons = {
        default: InboxIcon,
        search: EmptySearchIcon,
        error: ErrorIcon,
        success: SuccessIcon,
        info: InfoIcon,
    };

    const colors = {
        default: '#64748b',
        search: '#f59e0b',
        error: '#ef4444',
        success: '#10b981',
        info: '#6366f1',
    };

    const Icon = CustomIcon || icons[variant] || icons.default;
    const color = colors[variant] || colors.default;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                px: 4,
                textAlign: 'center',
                ...sx,
            }}
        >
            <Box
                sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: alpha(color, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                }}
            >
                <Icon sx={{ fontSize: 40, color }} />
            </Box>

            <Typography
                variant="h6"
                fontWeight={600}
                sx={{ mb: 1, color: 'text.primary' }}
            >
                {title || 'No data found'}
            </Typography>

            {description && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: action ? 3 : 0, maxWidth: 320 }}
                >
                    {description}
                </Typography>
            )}

            {action && (
                <Box sx={{ mt: 2 }}>
                    {action}
                </Box>
            )}
        </Box>
    );
};

export default EmptyState;

import React from 'react';
import { Box } from '@mui/material';
import LiveTrackingMap from '../components/Tracking/TrackingMap';

const TrackingMap = () => {
    return (
        <Box
            sx={{
                height: 'calc(100vh - 64px)',
                position: 'relative',
                bgcolor: 'background.default',
                overflow: 'hidden',
                m: { xs: -2, sm: -3 } // Break out of AdminLayout padding
            }}
        >
            <LiveTrackingMap />
        </Box>
    );
};

export default TrackingMap;

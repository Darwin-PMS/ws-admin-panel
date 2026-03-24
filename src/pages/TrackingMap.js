import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import TrackingMapComponent from '../components/Tracking/TrackingMap';
import { useDispatch } from 'react-redux';
import { fetchAllLocations, fetchSOSAlerts } from '../store/slices/trackingSlice';

const TrackingMap = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchAllLocations());
        dispatch(fetchSOSAlerts());
    }, [dispatch]);

    return (
        <Box sx={{ height: 'calc(100vh - 120px)', position: 'relative' }}>
            <TrackingMapComponent />
        </Box>
    );
};

export default TrackingMap;

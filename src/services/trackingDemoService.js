/**
 * Demo Data Service for Real-Time Tracking
 * Simulates real-time location updates, SOS alerts, and user movement
 * For production, replace with actual WebSocket/Firebase real-time updates
 */

// Generate a unique ID
const generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Cache for demo data to ensure consistent keys
let cachedLocations = null;
let cachedSOSAlerts = null;
let cachedTasks = null;

// Sample user locations (simulated)
const generateDemoLocations = () => {
    if (cachedLocations) return cachedLocations;
    
    const baseLocations = [
        { city: 'Delhi', lat: 28.6139, lng: 77.2090 },
        { city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
        { city: 'Bangalore', lat: 12.9716, lng: 77.5946 },
        { city: 'Chennai', lat: 13.0827, lng: 80.2707 },
        { city: 'Kolkata', lat: 22.5726, lng: 88.3639 },
        { city: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
        { city: 'Pune', lat: 18.5204, lng: 73.8567 },
        { city: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
    ];

    const userNames = [
        'Priya Sharma', 'Anita Desai', 'Kavitha Reddy', 'Meera Patel', 
        'Sunita Singh', 'Rajesh Kumar', 'Anjali Verma', 'Neha Gupta'
    ];

    const avatarIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

    cachedLocations = baseLocations.map((loc, index) => {
        const uniqueId = generateId();
        const avatarId = avatarIds[index % avatarIds.length];
        return {
            id: uniqueId,
            user_id: `user-${uniqueId}`,
            name: userNames[index] || `User ${index + 1}`,
            first_name: userNames[index]?.split(' ')[0] || 'User',
            last_name: userNames[index]?.split(' ')[1] || `${index + 1}`,
            email: `${userNames[index]?.toLowerCase().replace(' ', '.')}@example.com` || `user${index + 1}@example.com`,
            phone: `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
            profile_photo: `https://i.pravatar.cc/150?img=${avatarId}`,
            avatar: `https://i.pravatar.cc/150?img=${avatarId}`,
            latitude: loc.lat + (Math.random() - 0.5) * 0.1,
            longitude: loc.lng + (Math.random() - 0.5) * 0.1,
            status: Math.random() > 0.8 ? 'danger' : Math.random() > 0.95 ? 'sos' : 'safe',
            is_online: Math.random() > 0.3,
            last_updated: new Date(Date.now() - Math.random() * 30 * 60 * 1000).toISOString(),
            address: `${loc.city}, India`,
            family: {
                id: generateId(),
                name: `${userNames[index]?.split(' ')[0] || 'User'}'s Family`,
                members: Math.floor(Math.random() * 4) + 2,
            },
            emergency_contacts: [
                {
                    name: `Emergency Contact ${index + 1}`,
                    relationship: ['Spouse', 'Parent', 'Sibling', 'Friend'][Math.floor(Math.random() * 4)],
                    phone: `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
                },
            ],
            safety_score: Math.floor(Math.random() * 40) + 60,
        };
    });
    
    return cachedLocations;
};

// Generate location history (path)
const generateLocationHistory = (userId, minutes = 30, startPoint = null) => {
    const history = [];
    const now = Date.now();
    const interval = 5 * 60 * 1000; // 5 minutes

    let baseLat = startPoint?.latitude || 28.6139 + (Math.random() - 0.5) * 0.01;
    let baseLng = startPoint?.longitude || 77.2090 + (Math.random() - 0.5) * 0.01;

    for (let i = minutes; i >= 0; i -= 5) {
        // Simulate slight movement
        baseLat += (Math.random() - 0.5) * 0.001;
        baseLng += (Math.random() - 0.5) * 0.001;

        history.push({
            user_id: userId,
            latitude: baseLat,
            longitude: baseLng,
            timestamp: new Date(now - i * 60 * 1000).toISOString(),
            speed: Math.random() * 20 + 20, // km/h
            accuracy: Math.random() * 10 + 5, // meters
        });
    }

    return history;
};

// Generate SOS alerts
const generateDemoSOSAlerts = () => {
    const alerts = [];
    const numAlerts = Math.floor(Math.random() * 3);

    const userNames = ['Priya Sharma', 'Anita Desai', 'Kavitha Reddy', 'Meera Patel', 'Sunita Singh'];
    const avatarIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

    for (let i = 0; i < numAlerts; i++) {
        const baseLocations = [
            { lat: 28.6139, lng: 77.2090, address: 'Connaught Place, New Delhi' },
            { lat: 19.0760, lng: 72.8777, address: 'Marine Drive, Mumbai' },
            { lat: 12.9716, lng: 77.5946, address: 'MG Road, Bangalore' },
            { lat: 28.6289, lng: 77.2190, address: 'Karol Bagh, Delhi' },
            { lat: 19.0444, lng: 72.8297, address: 'Andheri, Mumbai' },
        ];

        const loc = baseLocations[Math.floor(Math.random() * baseLocations.length)];
        const userName = userNames[Math.floor(Math.random() * userNames.length)];
        const avatarId = avatarIds[Math.floor(Math.random() * avatarIds.length)];

        alerts.push({
            id: Date.now() + i,
            user_id: Math.floor(Math.random() * 10) + 1,
            userName: userName,
            profile_photo: `https://i.pravatar.cc/150?img=${avatarId}`,
            avatar: `https://i.pravatar.cc/150?img=${avatarId}`,
            type: ['emergency', 'distress', 'medical'][Math.floor(Math.random() * 3)],
            message: [
                'Need immediate help!',
                'Feeling unsafe, please assist',
                'Medical emergency',
                'Being followed',
                'Lost in unknown area',
            ][Math.floor(Math.random() * 5)],
            latitude: loc.lat + (Math.random() - 0.5) * 0.01,
            longitude: loc.lng + (Math.random() - 0.5) * 0.01,
            location: loc.address,
            status: 'active',
            created_at: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
            sos_triggered_at: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
            email: `${userName.toLowerCase().replace(' ', '.')}@example.com`,
            phone: `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
            emergency_contacts: [
                {
                    name: 'Emergency Contact',
                    relationship: ['Spouse', 'Parent', 'Sibling', 'Friend'][Math.floor(Math.random() * 4)],
                    phone: `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
                },
            ],
        });
    }

    return alerts;
};

// Generate nearby emergency services
const generateEmergencyServices = (lat, lng, radius = 5000) => {
    const services = [];
    const numServices = Math.floor(Math.random() * 10) + 5;

    const serviceTypes = ['police', 'hospital', 'safe_zone'];

    for (let i = 0; i < numServices; i++) {
        const type = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * radius;
        const serviceLat = lat + (distance * Math.cos(angle)) / 111000;
        const serviceLng = lng + (distance * Math.sin(angle)) / (111000 * Math.cos(lat * Math.PI / 180));

        services.push({
            id: i + 1,
            name: `${type === 'police' ? 'Police Station' : type === 'hospital' ? 'Hospital' : 'Safe Zone'} ${i + 1}`,
            type: type,
            latitude: serviceLat,
            longitude: serviceLng,
            address: `Location ${i + 1}, City`,
            phone: type === 'police' ? '100' : type === 'hospital' ? '108' : '+919876543210',
            distance: distance / 1000, // km
        });
    }

    return services;
};

// Simulate real-time location update
const simulateLocationUpdate = (previousLocation) => {
    if (!previousLocation) return null;

    // Simulate slight movement (walking/driving)
    const latOffset = (Math.random() - 0.5) * 0.0005;
    const lngOffset = (Math.random() - 0.5) * 0.0005;

    return {
        ...previousLocation,
        latitude: previousLocation.latitude + latOffset,
        longitude: previousLocation.longitude + lngOffset,
        last_updated: new Date().toISOString(),
    };
};

// Generate heatmap data (incident density)
const generateHeatmapData = () => {
    const hotspots = [
        { lat: 28.6139, lng: 77.2090, intensity: 0.9, count: 45 }, // Delhi
        { lat: 28.6289, lng: 77.2190, intensity: 0.7, count: 23 },
        { lat: 19.0760, lng: 72.8777, intensity: 0.8, count: 38 }, // Mumbai
        { lat: 19.0890, lng: 72.8677, intensity: 0.6, count: 18 },
        { lat: 12.9716, lng: 77.5946, intensity: 0.75, count: 30 }, // Bangalore
        { lat: 13.0827, lng: 80.2707, intensity: 0.65, count: 22 }, // Chennai
        { lat: 22.5726, lng: 88.3639, intensity: 0.7, count: 25 }, // Kolkata
        { lat: 17.3850, lng: 78.4867, intensity: 0.6, count: 20 }, // Hyderabad
    ];

    return hotspots.map((spot, index) => ({
        id: index + 1,
        latitude: spot.lat + (Math.random() - 0.5) * 0.05,
        longitude: spot.lng + (Math.random() - 0.5) * 0.05,
        intensity: spot.intensity,
        count: spot.count,
        incidents: Math.floor(Math.random() * 50) + 10,
        lastIncident: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }));
};

// Generate tasks for demo
const generateDemoTasks = () => {
    const assignees = [
        { id: 1, name: 'Admin User', profile_photo: 'https://i.pravatar.cc/150?img=1' },
        { id: 2, name: 'Supervisor', profile_photo: 'https://i.pravatar.cc/150?img=2' },
        { id: 3, name: 'Support Staff', profile_photo: 'https://i.pravatar.cc/150?img=3' },
    ];

    return [
        { 
            id: 1, 
            title: 'Safety Check', 
            description: 'Check on user safety status after late-night travel', 
            status: 'in_progress', 
            assigned_to: assignees[0], 
            due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() 
        },
        { 
            id: 2, 
            title: 'Family Update', 
            description: 'Update family contact information for verified users', 
            status: 'pending', 
            assigned_to: assignees[1], 
            due_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() 
        },
        { 
            id: 3, 
            title: 'Location Review', 
            description: 'Review recent location history for suspicious patterns', 
            status: 'completed', 
            assigned_to: assignees[2], 
            due_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() 
        },
        { 
            id: 4, 
            title: 'Emergency Contact Verification', 
            description: 'Verify all emergency contacts are reachable', 
            status: 'pending', 
            assigned_to: assignees[0], 
            due_date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() 
        },
        { 
            id: 5, 
            title: 'SOS Alert Follow-up', 
            description: 'Follow up on recent SOS alerts for user satisfaction', 
            status: 'in_progress', 
            assigned_to: assignees[1], 
            due_date: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() 
        },
    ];
};

// Export demo data generators
// Generate family members with proper data
const generateFamilyMembers = (userId) => {
    const relationships = ['Mother', 'Father', 'Sibling', 'Spouse', 'Child', 'Friend'];
    const firstNames = ['Priya', 'Anita', 'Kavitha', 'Meera', 'Sunita', 'Rajesh', 'Vikram', 'Arjun'];
    const avatarIds = [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32];
    
    const numMembers = Math.floor(Math.random() * 3) + 2;
    const members = [];
    
    for (let i = 0; i < numMembers; i++) {
        members.push({
            id: generateId(),
            user_id: generateId(),
            family_id: userId,
            first_name: firstNames[Math.floor(Math.random() * firstNames.length)],
            last_name: 'Singh',
            name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} Singh`,
            email: `family${i + 1}@example.com`,
            phone: `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
            profile_photo: `https://i.pravatar.cc/150?img=${avatarIds[i % avatarIds.length]}`,
            relationship: relationships[Math.floor(Math.random() * relationships.length)],
            is_active: Math.random() > 0.2,
            is_online: Math.random() > 0.5,
            joined_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        });
    }
    
    return members;
};

// Generate activity logs
const generateActivityLogs = (userId) => {
    const actions = [
        'Logged in', 'Updated profile', 'Shared location', 'Sent SOS alert',
        'Added emergency contact', 'Updated family info', 'Viewed safety map',
        'Started live tracking', 'Stopped live tracking', 'Received notification'
    ];
    
    const logs = [];
    for (let i = 0; i < 10; i++) {
        logs.push({
            id: generateId(),
            user_id: userId,
            action: actions[Math.floor(Math.random() * actions.length)],
            description: actions[Math.floor(Math.random() * actions.length)],
            ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            device_info: ['Android', 'iOS'][Math.floor(Math.random() * 2)],
            created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
    }
    
    return logs;
};

// Generate device list
const generateDevices = (userId) => {
    const deviceTypes = [
        { type: 'Mobile', name: 'Samsung Galaxy S23' },
        { type: 'Mobile', name: 'iPhone 15 Pro' },
        { type: 'Tablet', name: 'iPad Pro' },
        { type: 'Watch', name: 'Apple Watch Series 9' },
    ];
    
    const devices = [];
    const numDevices = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < numDevices; i++) {
        const device = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
        devices.push({
            id: generateId(),
            user_id: userId,
            device_id: `DEV-${Math.floor(Math.random() * 100000)}`,
            name: device.name,
            device_type: device.type,
            is_active: Math.random() > 0.3,
            last_active: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        });
    }
    
    return devices;
};

export const demoTrackingData = {
    getLocations: generateDemoLocations,
    getLocationHistory: generateLocationHistory,
    getSOSAlerts: generateDemoSOSAlerts,
    getEmergencyServices: generateEmergencyServices,
    simulateLocationUpdate: simulateLocationUpdate,
    getHeatmapData: generateHeatmapData,
    getTasks: generateDemoTasks,
    getFamilyMembers: generateFamilyMembers,
    getActivityLogs: generateActivityLogs,
    getDevices: generateDevices,
};

export default demoTrackingData;

/**
 * Demo Data Service for Families
 * Provides fallback data when the backend API is not available
 */

// Generate a unique ID
const generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const generateDemoFamilies = () => {
    const familyNames = [
        'Sharma Family',
        'Patel Family',
        'Singh Family',
        'Kumar Family',
        'Williams Family',
        'Johnson Family',
        'Brown Family',
        'Davis Family',
    ];

    const relations = ['Father', 'Mother', 'Son', 'Daughter', 'Spouse', 'Brother', 'Sister', 'Guardian'];

    return familyNames.map((name, index) => {
        const memberCount = Math.floor(Math.random() * 4) + 2;
        const members = [];
        
        for (let i = 0; i < memberCount; i++) {
            const baseLocations = [
                { city: 'Delhi', lat: 28.6139, lng: 77.2090 },
                { city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
                { city: 'Bangalore', lat: 12.9716, lng: 77.5946 },
                { city: 'Chennai', lat: 13.0827, lng: 80.2707 },
                { city: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
            ];
            
            const loc = baseLocations[Math.floor(Math.random() * baseLocations.length)];
            const isOnline = Math.random() > 0.3;
            const avatarId = (index * memberCount + i + 1) % 70 + 1;
            
            members.push({
                id: `user-${index}-${i}`,
                user_id: `user-${index}-${i}`,
                first_name: ['Rahul', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Anjali', 'Raj', 'Meera'][i % 8],
                last_name: ['Sharma', 'Patel', 'Singh', 'Kumar', 'Verma', 'Gupta', 'Joshi', 'Mehta'][i % 8],
                name: '',
                email: `member${index}${i}@example.com`,
                phone: `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
                profile_photo: `https://i.pravatar.cc/150?img=${avatarId}`,
                avatar: `https://i.pravatar.cc/150?img=${avatarId}`,
                relation: relations[i % relations.length],
                relationship: relations[i % relations.length],
                latitude: loc.lat + (Math.random() - 0.5) * 0.05,
                longitude: loc.lng + (Math.random() - 0.5) * 0.05,
                is_online: isOnline,
                last_updated: isOnline ? new Date().toISOString() : new Date(Date.now() - Math.random() * 3600000).toISOString(),
                address: `${loc.city}, India`,
                status: 'active',
            });
        }

        return {
            id: index + 1,
            family_id: index + 1,
            name: name,
            family_name: name,
            description: `A loving family of ${memberCount} members`,
            head_name: `${members[0].first_name} ${members[0].last_name}`,
            status: 'active',
            created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            members: members,
            member_count: memberCount,
        };
    });
};

const generateDemoUserData = (userId) => {
    const firstNames = ['Rahul', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Anjali', 'Raj', 'Meera', 'Priya', 'Anita', 'Kavitha', 'Meera'];
    const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Verma', 'Gupta', 'Joshi', 'Mehta'];
    
    const baseLocations = [
        { city: 'Delhi', lat: 28.6139, lng: 77.2090 },
        { city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
        { city: 'Bangalore', lat: 12.9716, lng: 77.5946 },
        { city: 'Chennai', lat: 13.0827, lng: 80.2707 },
        { city: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
    ];
    
    const loc = baseLocations[Math.floor(Math.random() * baseLocations.length)];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const avatarId = Math.floor(Math.random() * 70) + 1;

    return {
        id: userId,
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        role: 'woman',
        profile_photo: `https://i.pravatar.cc/150?img=${avatarId}`,
        avatar: `https://i.pravatar.cc/150?img=${avatarId}`,
        is_verified: true,
        is_active: true,
        is_online: Math.random() > 0.3,
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        last_active: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        latitude: loc.lat + (Math.random() - 0.5) * 0.05,
        longitude: loc.lng + (Math.random() - 0.5) * 0.05,
        current_location: `${loc.city}, India`,
        address: `${loc.city}, India`,
        family_members: [
            { id: 'fm-1', name: 'Father', relation: 'Father', profile_photo: `https://i.pravatar.cc/150?img=33` },
            { id: 'fm-2', name: 'Mother', relation: 'Mother', profile_photo: `https://i.pravatar.cc/150?img=5` },
        ],
        recent_locations: [
            { latitude: loc.lat, longitude: loc.lng, address: `${loc.city}`, timestamp: new Date().toISOString() },
        ],
        sos_alerts: Math.random() > 0.8 ? [
            { id: 1, status: 'resolved', created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
        ] : [],
    };
};

const generateDemoTasks = () => {
    return [
        { id: 1, title: 'Safety Check', description: 'Check on user safety status', status: 'in_progress', assigned_to: { id: 1, name: 'Admin' }, due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
        { id: 2, title: 'Family Update', description: 'Update family contact information', status: 'pending', assigned_to: { id: 1, name: 'Admin' }, due_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() },
        { id: 3, title: 'Location Review', description: 'Review recent location history', status: 'completed', assigned_to: { id: 1, name: 'Admin' }, due_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    ];
};

export const demoFamiliesData = {
    getFamilies: generateDemoFamilies,
    getFamilyById: (familyId) => {
        const families = generateDemoFamilies();
        return families.find(f => f.id === parseInt(familyId)) || families[0];
    },
    getUserData: generateDemoUserData,
    getTasks: generateDemoTasks,
};

export default demoFamiliesData;
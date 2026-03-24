import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    AppBar,
    Toolbar,
    Chip,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Drawer,
    List as MenuList,
    ListItemButton,
    ListItemText as MenuListItemText,
    IconButton,
    useTheme,
    useMediaQuery,
    Tabs,
    Tab,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Close as CloseIcon,
    Security as SecurityIcon,
    SmartToy as SmartToyIcon,
    FamilyRestroom as FamilyIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    Shield as ShieldIcon,
    HowToReg as HowToRegIcon,
    NotificationsActive as NotificationsIcon,
    TrackChanges as TrackIcon,
    Warning as EmergencyIcon,
    Support as SupportIcon,
    VerifiedUser as VerifiedIcon,
    Speed as SpeedIcon,
    Accessible as AccessibleIcon,
    PanTool as PanToolIcon,
    VoiceChat as VoiceChatIcon,
    Visibility as VisionIcon,
    RecordVoiceOver as SpeechIcon,
    VolumeUp as VolumeIcon,
    Route as RouteIcon,
    Map as MapIcon,
    MyLocation as MyLocationIcon,
    Timer as TimerIcon,
    BatteryAlert as BatteryIcon,
    Call as CallIcon,
    Sms as SmsIcon,
    Videocam as VideoIcon,
    Mic as MicIcon,
    DirectionsRun as EscapeIcon,
    Nightlight as DarkIcon,
    LocalParking as ParkingIcon,
    GpsFixed as GeofenceIcon,
    Psychology as BehaviorIcon,
    ChildCare as ChildIcon,
    Lock as LockIcon,
    Code as CodeIcon,
    Accessibility as AccessIcon,
    ExpandMore as ExpandMoreIcon,
    CheckCircle as CheckCircleIcon,
    PlayArrow as PlayIcon,
    Settings as SettingsIcon,
    Person as PersonIcon,
    Group as GroupIcon,
    Home as HomeIcon,
    Work as WorkIcon,
    School as SchoolIcon,
    LocalHospital as HospitalIcon,
    LocalPolice as PoliceIcon,
    DirectionsWalk as WalkIcon,
    DirectionsCar as CarIcon,
    Flight as FlightIcon,
    Restaurant as RestaurantIcon,
    ShoppingCart as ShopIcon,
    Fitness as FitnessIcon,
    Book as BookIcon,
    AccountBalance as LawIcon,
    Gavel as GavelIcon,
    LocalPhone as PhoneNumberIcon,
    Email as EmailIcon,
    Message as MessageIcon,
    VideocamOff as VideoOffIcon,
    FlashOn as FlashIcon,
    Vibration as VibrationIcon,
    CalendarMonth as CalendarIcon,
    PhotoCamera as CameraIcon,
    Image as ImageIcon,
    CloudUpload as CloudIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
    Share as ShareIcon,
    Star as StarIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Notifications as BellIcon,
    Wifi as WifiIcon,
    SignalCellular4Bar as SignalIcon,
    BatteryFull as BatteryFullIcon,
    Battery60 as Battery60Icon,
    Battery20 as Battery20Icon,
    HeadsetMic as HeadsetIcon,
    MicNone as MicNoneIcon,
    SpeechBubble as ChatIcon,
    LocalGroceryStore as GroceryIcon,
    Calculate as CalculatorIcon,
    Cloud as CloudAppIcon,
    WbSunny as WeatherIcon,
    Event as EventIcon,
    Favorite as HealthIcon,
    MusicNote as MusicIcon,
    FlashAuto as FlashAutoIcon,
    ArrowForward as ArrowIcon,
    ArrowBack as BackIcon,
    Facebook as FacebookIcon,
    Twitter as TwitterIcon,
    Instagram as InstagramIcon,
    LinkedIn as LinkedInIcon,
    YouTube as YouTubeIcon,
} from '@mui/icons-material';

const navLinks = [
    { name: 'Home', path: '/', icon: <HomeIcon /> },
    { name: 'Features', path: '/features', icon: <SecurityIcon /> },
    { name: 'How It Works', path: '/how-it-works', icon: <PlayIcon /> },
    { name: 'SOS Features', path: '/sos-features', icon: <EmergencyIcon /> },
    { name: 'AI Features', path: '/ai-features', icon: <SmartToyIcon /> },
    { name: 'Family', path: '/family-features', icon: <FamilyIcon /> },
    { name: 'Location', path: '/smart-location', icon: <LocationIcon /> },
    { name: 'Disguised', path: '/disguised-features', icon: <LockIcon /> },
    { name: 'Resources', path: '/safety-resources', icon: <BookIcon /> },
    { name: 'About', path: '/about', icon: <PersonIcon /> },
];

const Footer = () => (
    <Box component="footer" sx={{ bgcolor: '#0f172a', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: 'white' }}>N</Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Nirbhaya Safety</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'grey.400', mb: 2 }}>
                        Comprehensive women's safety app with 50+ features including SOS alerts, AI-powered protection, family tracking, and smart location services.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}><FacebookIcon /></IconButton>
                        <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}><TwitterIcon /></IconButton>
                        <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}><InstagramIcon /></IconButton>
                        <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}><LinkedInIcon /></IconButton>
                        <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}><YouTubeIcon /></IconButton>
                    </Box>
                </Grid>
                <Grid item xs={6} md={2}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Quick Links</Typography>
                    <MenuList dense disablePadding>
                        {navLinks.slice(0, 5).map((link) => (
                            <ListItemButton key={link.path} onClick={() => window.location.href = link.path} sx={{ py: 0.5, px: 0 }}>
                                <ListItemText primary={link.name} primaryTypographyProps={{ variant: 'body2', color: 'grey.400' }} />
                            </ListItemButton>
                        ))}
                    </MenuList>
                </Grid>
                <Grid item xs={6} md={2}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Features</Typography>
                    <MenuList dense disablePadding>
                        {navLinks.slice(5).map((link) => (
                            <ListItemButton key={link.path} onClick={() => window.location.href = link.path} sx={{ py: 0.5, px: 0 }}>
                                <ListItemText primary={link.name} primaryTypographyProps={{ variant: 'body2', color: 'grey.400' }} />
                            </ListItemButton>
                        ))}
                    </MenuList>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Emergency Contacts</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label="181" size="small" color="error" />
                            <Typography variant="body2" color="grey.400">Women Helpline</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label="100" size="small" color="error" />
                            <Typography variant="body2" color="grey.400">Police Emergency</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label="108" size="small" color="error" />
                            <Typography variant="body2" color="grey.400">Ambulance</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label="112" size="small" color="error" />
                            <Typography variant="body2" color="grey.400">National Emergency</Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', mt: 4, pt: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="body2" color="grey.500">© 2026 Nirbhaya Safety. All rights reserved.</Typography>
                <Box sx={{ display: 'flex', gap: 3 }}>
                    <Typography variant="body2" color="grey.500" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>Privacy Policy</Typography>
                    <Typography variant="body2" color="grey.500" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>Terms of Service</Typography>
                    <Typography variant="body2" color="grey.500" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>Contact Us</Typography>
                </Box>
            </Box>
        </Container>
    </Box>
);

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            <AppBar position="sticky" sx={{ bgcolor: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(10px)', boxShadow: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Container maxWidth="lg">
                    <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 0 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => navigate('/')}>
                            <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: 'white' }}>N</Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', display: { xs: 'none', sm: 'block' } }}>Nirbhaya Safety</Typography>
                        </Box>
                        
                        {!isMobile && (
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {navLinks.slice(0, 6).map((link) => (
                                    <Button
                                        key={link.path}
                                        onClick={() => navigate(link.path)}
                                        sx={{
                                            color: location.pathname === link.path ? 'primary.main' : 'white',
                                            fontSize: '0.8rem',
                                            px: 1.5,
                                            minWidth: 'auto',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                        }}
                                    >
                                        {link.name}
                                    </Button>
                                ))}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => navigate('/login')}
                                    sx={{ ml: 1 }}
                                >
                                    Login
                                </Button>
                            </Box>
                        )}

                        {isMobile && (
                            <IconButton onClick={() => setMobileOpen(true)} sx={{ color: 'white' }}>
                                <MenuIcon />
                            </IconButton>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>

            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                PaperProps={{ sx: { width: 280, bgcolor: '#0f172a' } }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>Menu</Typography>
                    <IconButton onClick={() => setMobileOpen(false)} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <MenuList>
                    {navLinks.map((link) => (
                        <ListItemButton
                            key={link.path}
                            onClick={() => { navigate(link.path); setMobileOpen(false); }}
                            selected={location.pathname === link.path}
                            sx={{ color: 'white', '&.Mui-selected': { bgcolor: 'primary.main' } }}
                        >
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{link.icon}</ListItemIcon>
                            <MenuListItemText primary={link.name} />
                        </ListItemButton>
                    ))}
                </MenuList>
                <Box sx={{ p: 2 }}>
                    <Button variant="contained" fullWidth onClick={() => { navigate('/login'); setMobileOpen(false); }}>
                        Login
                    </Button>
                </Box>
            </Drawer>
        </>
    );
};

export const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#0f172a' }}>
            <Header />
            
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)', pointerEvents: 'none' }} />

            <Container maxWidth="lg">
                <Box sx={{ minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', py: 12 }}>
                    <Chip label="50+ Safety Features • 96% Complete" sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }} />
                    <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, background: 'linear-gradient(135deg, #f8fafc 0%, #c7d2fe 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: { xs: '2.5rem', md: '4rem' } }}>Women's Safety</Typography>
                    <Typography variant="h2" sx={{ fontWeight: 800, mb: 4, background: 'linear-gradient(135deg, #818cf8 0%, #f472b6 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: { xs: '2.5rem', md: '4rem' } }}>AI-Powered Protection</Typography>
                    <Typography variant="h5" sx={{ color: 'text.secondary', mb: 6, maxWidth: 700 }}>
                        Comprehensive safety app with SOS alerts, AI-powered chat support, family tracking, disguised features, and 50+ protection mechanisms.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center', mb: 4 }}>
                        {[
                            { icon: '🚨', title: 'SOS Alerts', desc: 'One-tap emergency with location' },
                            { icon: '🤖', title: 'AI Chat', desc: '24/7 AI safety assistant' },
                            { icon: '👨‍👩‍👧‍👦', title: 'Family Circle', desc: 'Real-time location sharing' },
                            { icon: '🛡️', title: 'Disguised Mode', desc: 'Safety disguised as calculator' },
                        ].map((item, i) => (
                            <Card key={i} sx={{ p: 3, maxWidth: 220, bgcolor: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Box sx={{ fontSize: 36, mb: 1 }}>{item.icon}</Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>{item.title}</Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{item.desc}</Typography>
                            </Card>
                        ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button variant="contained" size="large" onClick={() => navigate('/features')} sx={{ px: 4 }}>Explore All Features</Button>
                        <Button variant="outlined" size="large" onClick={() => navigate('/how-it-works')} sx={{ px: 4, borderColor: 'white', color: 'white' }}>How It Works</Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 6, mt: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {[
                            { num: '50+', label: 'Safety Features' },
                            { num: '96%', label: 'Complete' },
                            { num: '24/7', label: 'AI Support' },
                            { num: '100K+', label: 'Downloads' },
                        ].map((stat, i) => (
                            <Box key={i} sx={{ textAlign: 'center' }}>
                                <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>{stat.num}</Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{stat.label}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Container>
            <Footer />
        </Box>
    );
};

export const FeaturesPage = () => {
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const features = [
        { 
            icon: <EmergencyIcon />, 
            title: 'SOS Emergency Alert', 
            description: 'One-tap emergency button that instantly alerts your trusted contacts with precise GPS location.', 
            color: 'error',
            category: 'SOS',
            overview: 'The SOS Emergency Alert is your instant lifeline in dangerous situations. With just one tap (or voice command), your emergency contacts receive immediate alerts along with your precise GPS location, ensuring help arrives as quickly as possible.',
            howItWorks: [
                'Press and hold the SOS button for 3 seconds',
                'System immediately captures your GPS location',
                'Emergency SMS sent to all priority contacts',
                'Location updates begin in real-time',
                'Audio/video recording starts automatically'
            ],
            specifications: {
                'Activation Time': '< 3 seconds',
                'Location Accuracy': '5-10 meters',
                'Max Contacts': '10',
                'Recording Duration': 'Up to 30 minutes',
                'Offline Support': 'Yes (SMS based)'
            },
            useCases: ['Walking alone at night', 'Taxi/Ride-share situations', 'Unwanted attention', 'Medical emergencies'],
            benefits: ['Instant response', 'Precise location', 'Evidence capture', '24/7 availability']
        },
        { 
            icon: <SmartToyIcon />, 
            title: 'AI Safety Assistant', 
            description: '24/7 AI-powered chatbot with Groq API providing safety tips and emergency guidance.', 
            color: 'primary',
            category: 'AI',
            overview: 'Your personal 24/7 safety companion powered by advanced AI. The AI Safety Assistant provides instant guidance, safety tips, and emotional support through natural conversation, helping you feel safer every day.',
            howItWorks: [
                'Open the AI chat from main menu',
                'Type or speak your question/concern',
                'AI analyzes your situation',
                'Provides personalized safety advice',
                'Can trigger emergency alerts if needed'
            ],
            specifications: {
                'Response Time': '< 2 seconds',
                'Languages': 'English, Hindi, 10+',
                'Model': 'Groq LLaMA 3',
                'Context Memory': '10 conversations',
                'Available': '24/7'
            },
            useCases: ['Safety guidance', 'Emergency advice', 'Emotional support', 'Safety planning'],
            benefits: ['Always available', 'Instant response', 'Personalized help', 'Privacy focused']
        },
        { 
            icon: <FamilyIcon />, 
            title: 'Family Circle', 
            description: 'Real-time location sharing with family members with auto-refresh every 30 seconds.', 
            color: 'success',
            category: 'Family',
            overview: 'Keep your entire family connected and safe with the Family Circle feature. Create groups, share locations in real-time, and receive instant alerts when someone needs help or arrives safely at their destination.',
            howItWorks: [
                'Create a Family Circle in settings',
                'Invite family members via link/code',
                'Enable location sharing for the circle',
                'View all members on a single map',
                'Receive real-time safety alerts'
            ],
            specifications: {
                'Max Members': '20 per circle',
                'Update Interval': '30 seconds',
                'GPS Accuracy': '5-10 meters',
                'Groups': 'Up to 5 circles',
                'Privacy Controls': 'Full control'
            },
            useCases: ['Parents monitoring kids', 'Elderly care', 'Daily check-ins', 'Trip coordination'],
            benefits: ['Peace of mind', 'Easy coordination', 'Real-time updates', 'Privacy controls']
        },
        { 
            icon: <LocationIcon />, 
            title: 'Live Location Tracking', 
            description: 'Share your live location with emergency contacts during SOS activation.', 
            color: 'warning',
            category: 'Location',
            overview: 'Precise GPS location tracking that works seamlessly with SOS alerts. Your contacts can track your real-time location during emergencies, ensuring they always know where you are and can direct help to you.',
            howItWorks: [
                'GPS coordinates captured immediately on SOS',
                'Location shared via SMS to all contacts',
                'Real-time updates every 10 seconds',
                'Web dashboard for contacts to track',
                'Location history saved for evidence'
            ],
            specifications: {
                'Location Update': '10 seconds',
                'GPS Accuracy': '5-10 meters',
                'Background Tracking': 'Yes',
                'Map Integration': 'Google/Apple Maps',
                'Offline Caching': 'Yes'
            },
            useCases: ['Emergency response', 'Travel safety', 'Late night walks', 'Rideshare trips'],
            benefits: ['Precise tracking', 'Real-time updates', 'Evidence logging', 'Contact coordination']
        },
        { 
            icon: <GeofenceIcon />, 
            title: 'Geofencing / Safe Zones', 
            description: 'Create virtual boundaries around home, work, or school with breach alerts.', 
            color: 'info',
            category: 'Location',
            overview: 'Create invisible boundaries around places that matter to you. Receive instant notifications when you or your family members enter or leave these designated safe zones, perfect for ensuring kids get to school safely.',
            howItWorks: [
                'Open Smart Location in main menu',
                'Tap "Create Safe Zone"',
                'Choose location on map or current location',
                'Set radius (100m - 1km)',
                'Name zone and set alert preferences'
            ],
            specifications: {
                'Radius Options': '100m, 250m, 500m, 1km',
                'Max Zones': '20 per user',
                'Alert Types': 'Enter, Exit, Both',
                'Notifications': 'Push + SMS',
                'Family Sharing': 'Yes'
            },
            useCases: ['Home safety', 'School arrival', 'Work arrival', 'Neighborhood monitoring'],
            benefits: ['Automatic alerts', 'Customizable zones', 'Family sharing', 'Peace of mind']
        },
        { 
            icon: <CallIcon />, 
            title: 'Fake Incoming Call', 
            description: 'Schedule realistic fake calls with custom caller names to escape uncomfortable situations.', 
            color: 'secondary',
            category: 'Disguised',
            overview: 'Your perfect escape from uncomfortable situations. Schedule realistic fake calls that look completely authentic - complete with caller ID, ringtone, vibration patterns, and even call history entries.',
            howItWorks: [
                'Open Fake Call from disguised menu',
                'Set caller name (Mom, Boss, Police)',
                'Set timer or immediate call',
                'Phone rings with realistic UI',
                'Answer for "conversation" or let ring'
            ],
            specifications: {
                'Caller Names': 'Custom + Presets',
                'Ringtone': 'Standard phone ringtone',
                'Vibration': 'Realistic pattern',
                'Schedule': 'Immediate or delayed',
                'Call History': 'Appears in history'
            },
            useCases: ['Bad date situations', 'Uncomfortable meetings', 'Late night scenarios', 'Stalking situations'],
            benefits: ['Natural escape', 'Complete discretion', 'Realistic appearance', 'Multiple uses']
        },
        { 
            icon: <VoiceChatIcon />, 
            title: 'Voice Keyword Detection', 
            description: 'Trigger SOS using custom voice keywords even when app is in background.', 
            color: 'primary',
            category: 'Voice',
            overview: 'Call for help using just your voice - even when your phone is in your pocket. Set custom safety keywords that trigger emergency alerts the moment you speak them.',
            howItWorks: [
                'Set custom keywords in settings',
                'Keywords run in background',
                'Speak your keyword when in danger',
                'SOS activates automatically',
                'Contacts receive emergency alert'
            ],
            specifications: {
                'Detection': 'Background capable',
                'Languages': 'English, Hindi',
                'Accuracy': '95%+',
                'False Trigger Rate': '< 1%',
                'Response Time': '< 2 seconds'
            },
            useCases: ['Hands-free emergencies', 'Confined spaces', 'Physical threats', 'When phone is away'],
            benefits: ['Hands-free operation', 'Discreet activation', 'Background monitoring', 'Fast response']
        },
        { 
            icon: <VisionIcon />, 
            title: 'AI Vision Analysis', 
            description: 'Upload photos for real-time safety analysis and threat assessment using AI.', 
            color: 'success',
            category: 'AI',
            overview: 'Use the power of AI to analyze your surroundings. Take a photo or upload an image to get instant safety assessments, threat detection, and personalized safety recommendations.',
            howItWorks: [
                'Open AI Vision from main menu',
                'Take photo or upload image',
                'AI analyzes the image',
                'Safety assessment provided',
                'Recommendations offered'
            ],
            specifications: {
                'Analysis Time': '< 3 seconds',
                'Image Sources': 'Camera, Gallery',
                'Threat Categories': '15+ types',
                'Accuracy': '95%+',
                'Privacy Mode': 'On-device processing'
            },
            useCases: ['Route checking', 'Location safety', 'Person assessment', 'Area evaluation'],
            benefits: ['Instant analysis', 'AI-powered', 'Privacy focused', 'Actionable insights']
        },
        { 
            icon: <SpeechIcon />, 
            title: 'Speech to Text', 
            description: 'Convert voice to text for hands-free emergency documentation.', 
            color: 'warning',
            category: 'AI',
            overview: 'Document emergencies hands-free with automatic speech-to-text transcription. Perfect for when you need to record evidence but cannot look at or touch your phone.',
            howItWorks: [
                'Activate speech to text',
                'Speak naturally about the situation',
                'Audio converted to text in real-time',
                'Transcription saved automatically',
                'Can be shared or used as evidence'
            ],
            specifications: {
                'Languages': '50+ languages',
                'Accuracy': '98%+',
                'Processing': 'On-device',
                'Offline Mode': 'Yes',
                'Speaker Diarization': 'Yes'
            },
            useCases: ['Evidence recording', 'Incident documentation', 'Witness statements', 'Police reports'],
            benefits: ['Hands-free', 'Accurate transcription', 'Offline capable', 'Shareable evidence']
        },
        { 
            icon: <VolumeIcon />, 
            title: 'Text to Speech', 
            description: 'Audible safety instructions and emergency alerts for accessibility.', 
            color: 'info',
            category: 'AI',
            overview: 'Never miss critical safety information with automatic text-to-speech. Emergency alerts, navigation instructions, and safety tips are read aloud, ensuring you stay informed even when you cannot look at your screen.',
            howItWorks: [
                'Enable text-to-speech in settings',
                'System speaks emergency alerts',
                'Safety tips read aloud',
                'Navigation directions audible',
                'Adjustable speed and voice'
            ],
            specifications: {
                'Voice Options': '5+ voices',
                'Speed Control': '0.5x - 2x',
                'Languages': '30+ languages',
                'Background Play': 'Yes',
                'Volume Override': 'Yes'
            },
            useCases: ['Driving safety', 'Walking navigation', 'Emergency alerts', 'Accessibility needs'],
            benefits: ['Eyes-free operation', 'Multiple languages', 'Adjustable settings', 'Universal access']
        },
        { 
            icon: <RouteIcon />, 
            title: 'Safe Route Analysis', 
            description: 'AI-powered route safety scoring with alternative path suggestions.', 
            color: 'primary',
            category: 'Location',
            overview: 'Know before you go. Our AI analyzes your planned route and rates its safety, suggesting alternative paths if needed. Make informed decisions about how you travel.',
            howItWorks: [
                'Enter destination in route planner',
                'AI analyzes route safety factors',
                'Route receives safety score (0-100)',
                'Unsafe areas highlighted',
                'Alternative safer routes suggested'
            ],
            specifications: {
                'Route Options': 'Up to 5 alternatives',
                'Safety Factors': '15+ parameters',
                'Update Frequency': 'Real-time',
                'Map Sources': 'Google, Apple, OSM',
                'Offline Maps': 'Yes'
            },
            useCases: ['Commute planning', 'Night travel', 'New areas', 'Late shifts'],
            benefits: ['Informed decisions', 'Safer alternatives', 'Time-aware', 'Crime data integration']
        },
        { 
            icon: <BehaviorIcon />, 
            title: 'Behavior Pattern Analysis', 
            description: 'Machine learning detects unusual patterns and potential route deviations.', 
            color: 'secondary',
            category: 'AI',
            overview: 'AI learns your daily patterns and detects when something unusual happens. If you deviate from your normal routine, the system alerts your contacts, providing an extra layer of protection.',
            howItWorks: [
                'AI learns your routines over 7 days',
                'Normal patterns established',
                'Deviations trigger alerts',
                'Contacts notified of anomaly',
                'You can confirm or cancel alert'
            ],
            specifications: {
                'Learning Period': '7 days',
                'Pattern Types': 'Location, Time, Duration',
                'Alert Threshold': 'Customizable',
                'False Positive Rate': '< 5%',
                'Background Processing': 'Yes'
            },
            useCases: ['Kidnapping detection', 'Unusual detours', 'Schedule changes', 'Emergency situations'],
            benefits: ['Proactive safety', 'AI-powered', 'Customizable alerts', 'Privacy protected']
        },
        { 
            icon: <PanToolIcon />, 
            title: 'Volume Button SOS', 
            description: 'Configure volume buttons for quick SOS activation (3-5 presses).', 
            color: 'error',
            category: 'Voice',
            overview: 'Quickly trigger SOS without looking at your phone. Use volume button presses to activate emergency alerts - perfect for when your phone is in your pocket or bag.',
            howItWorks: [
                'Enable volume button SOS in settings',
                'Choose press count (3-5 presses)',
                'Set time window for presses',
                'Press volume buttons rapidly',
                'SOS activates immediately'
            ],
            specifications: {
                'Press Count': '3-10 presses',
                'Time Window': '3-10 seconds',
                'Single Button': 'Volume Up only',
                'Both Buttons': 'Up + Down',
                'Background': 'Yes'
            },
            useCases: ['Phone in pocket', 'Hands occupied', 'Discreet activation', 'Physical threat'],
            benefits: ['Eyes-free', 'Pocket activation', 'Quick response', 'Customizable']
        },
        { 
            icon: <DarkIcon />, 
            title: 'Darkness Reminder', 
            description: 'Smart alerts reminding you to be cautious during evening hours.', 
            color: 'warning',
            category: 'Location',
            overview: 'Stay extra vigilant after dark. The app automatically reminds you to be cautious when the sun sets, offering safety tips and suggesting you enable journey tracking.',
            howItWorks: [
                'System calculates local sunset time',
                'Reminder sent 30 min before sunset',
                'Additional reminder at full dark',
                'Tips provided for night safety',
                'Journey Tracking option shown'
            ],
            specifications: {
                'Sunset Alert': '30 min before',
                'Dark Alert': 'At sunset + 30 min',
                'Custom Time': 'Available',
                'Quiet Hours': 'Configurable',
                'Location Based': 'Yes'
            },
            useCases: ['Evening commutes', 'Night events', 'Winter months', 'Early mornings'],
            benefits: ['Timely reminders', 'Location aware', 'Safety tips', 'Journey tracking option']
        },
        { 
            icon: <ParkingIcon />, 
            title: 'Parked Car Location', 
            description: 'Save and share parking locations so you never lose your car.', 
            color: 'success',
            category: 'Location',
            overview: 'Never wander around a parking lot again. Save your car\'s location with one tap and get walking directions back to it. Share your parking spot with friends or family for added safety.',
            howItWorks: [
                'Auto-capture when you stop driving',
                'Or manually tap "Save Car Location"',
                'View on map with walking directions',
                'Set reminder for meter expiry',
                'Share location with friends/family'
            ],
            specifications: {
                'Auto-detect': 'Motion-based',
                'Manual Save': 'One-tap',
                'Reminders': 'Customizable',
                'Share Options': 'All contacts',
                'History': '30 days'
            },
            useCases: ['Large parking lots', 'Street parking', 'Mall/venue parking', 'Airport parking'],
            benefits: ['Never lose car', 'Walking directions', 'Timer reminders', 'Shareable location']
        },
        { 
            icon: <VideoIcon />, 
            title: 'Auto Recording', 
            description: 'Automatic audio/video recording when SOS is activated for evidence.', 
            color: 'error',
            category: 'SOS',
            overview: 'Evidence capture starts automatically when SOS is triggered. Both audio and video recording begin immediately, providing crucial evidence for any investigation or legal proceedings.',
            howItWorks: [
                'Recording starts automatically on SOS',
                'Audio recorded at 128kbps quality',
                'Video recorded at 720p resolution',
                'Files saved to encrypted storage',
                'Auto upload when WiFi available'
            ],
            specifications: {
                'Audio Quality': '128 kbps AAC',
                'Video Quality': '720p HD',
                'Max Duration': '30 minutes',
                'Storage': 'Encrypted local + cloud',
                'Auto Upload': 'When WiFi available'
            },
            useCases: ['Evidence collection', 'Attack documentation', 'Legal proceedings', 'Insurance claims'],
            benefits: ['Automatic capture', 'Encrypted storage', 'Cloud backup', 'Legal admissible']
        },
        { 
            icon: <MicIcon />, 
            title: 'Siren Feature', 
            description: 'Activate loud siren to draw attention and deter potential threats.', 
            color: 'warning',
            category: 'SOS',
            overview: 'Deter threats and draw attention with a loud siren. The 120+ decibel alarm can be triggered independently or as part of the SOS sequence, providing both protection and a call for help.',
            howItWorks: [
                'Press siren icon or include in SOS',
                'Loud alarm plays at 120+ dB',
                'Screen strobe effect activates',
                'Continuous until manually stopped',
                'Can auto-stop after 30 seconds'
            ],
            specifications: {
                'Siren Volume': '120+ dB',
                'Duration': 'Manual or auto (30s)',
                'Background Play': 'Yes',
                'Strobe Effect': 'Yes (screen)',
                'Stealth Mode': 'Yes (vibration only)'
            },
            useCases: ['Deter attackers', 'Draw attention', 'Self-defense', 'Crowd awareness'],
            benefits: ['Loud deterrent', 'Automatic strobe', 'Customizable duration', 'Stealth option']
        },
        { 
            icon: <SmsIcon />, 
            title: 'Offline SOS', 
            description: 'SOS works even without internet using SMS and offline capabilities.', 
            color: 'info',
            category: 'SOS',
            overview: 'Your safety is never compromised by connectivity. Even without internet, SOS alerts go out via SMS with your location, ensuring help is always reachable.',
            howItWorks: [
                'System detects no internet connection',
                'Automatically switches to SMS mode',
                'GPS coordinates sent via SMS',
                'Pre-configured emergency SMS sent',
                'Queued for cloud sync when online'
            ],
            specifications: {
                'SMS Based': 'Yes',
                'Offline Storage': 'Unlimited alerts',
                'Auto Reconnect': 'Yes',
                'Sync Queue': 'Automatic',
                'Location via SMS': 'Google Maps link'
            },
            useCases: ['Basement/elevator', 'Remote areas', 'Poor coverage', 'Network outages'],
            benefits: ['Always works', 'No internet needed', 'Location included', 'Automatic switchover']
        },
        { 
            icon: <BatteryIcon />, 
            title: 'Battery Monitoring', 
            description: 'System monitors battery level and warns contacts if device is about to die.', 
            color: 'success',
            category: 'SOS',
            overview: 'Never lose track of a loved one due to a dead battery. The system monitors battery levels and automatically alerts contacts when power is critically low, sharing last known location.',
            howItWorks: [
                'Continuous battery level monitoring',
                'Alerts sent at 20% and 10% battery',
                'Emergency contacts notified',
                'Last location shared before shutdown',
                'Power-saving mode suggested'
            ],
            specifications: {
                'Warning Thresholds': '20%, 10%, 5%',
                'Alert Types': 'SMS + Push',
                'Low Power Mode': 'Automatic suggestion',
                'Last Location': 'Auto-shared',
                'Charging Detection': 'Yes'
            },
            useCases: ['Long journeys', 'Outdoor activities', 'Emergency situations', 'Child monitoring'],
            benefits: ['Proactive alerts', 'Location preservation', 'Contact notification', 'Power saving']
        },
        { 
            icon: <LockIcon />, 
            title: 'Disguised App Icons', 
            description: 'Change app icon to calculator, notes, weather - nobody knows it\'s a safety app.', 
            color: 'secondary',
            category: 'Disguised',
            overview: 'Complete disguise for ultimate discretion. Change Nirbhaya\'s icon to look like a calculator, notes app, weather app, or other common applications. Safety that nobody will ever suspect.',
            howItWorks: [
                'Go to Settings > App Icon',
                'Choose from available disguises',
                'Icon changes throughout phone',
                'App name also changes',
                'Works with app launcher'
            ],
            specifications: {
                'Icon Options': 'Calculator, Notes, Weather, Calendar, Health, Music, Shopping, Cloud',
                'App Name Change': 'Yes (per icon)',
                'Stealth Mode': 'Yes',
                'Quick Access': 'Hidden dial pad',
                'Widget Support': 'Yes'
            },
            useCases: ['Stalking situations', 'Controlling relationships', 'Discreet safety', 'Personal security'],
            benefits: ['Complete disguise', 'Hidden access', 'Multiple icons', 'Full stealth mode']
        },
        { 
            icon: <ChildIcon />, 
            title: 'Child Care Mode', 
            description: 'Daily schedule tracking and activity management for child safety.', 
            color: 'primary',
            category: 'Family',
            overview: 'Keep your children safe with dedicated child care features. Track schedules, monitor locations, and receive alerts for school arrival, leaving, and any safety concerns.',
            howItWorks: [
                'Create child profile in app',
                'Set up daily schedule/activities',
                'Configure school/work zones',
                'Receive automatic alerts',
                'Monitor through parent dashboard'
            ],
            specifications: {
                'Child Profiles': 'Up to 5',
                'Schedule Events': 'Unlimited',
                'Zone Types': 'School, Home, Activity',
                'Alert Types': 'Arrival, Departure, Schedule',
                'Reports': 'Daily/Weekly'
            },
            useCases: ['School monitoring', 'Activity tracking', 'Elder care', 'Special needs care'],
            benefits: ['Complete monitoring', 'Schedule alerts', 'Location tracking', 'Peace of mind']
        },
        { 
            icon: <MapIcon />, 
            title: 'Safety Map', 
            description: 'View safety-rated areas, nearby police stations, hospitals, and safe zones.', 
            color: 'info',
            category: 'Location',
            overview: 'Know your surroundings before you go. The safety map shows crime statistics, safe zones, police stations, hospitals, and other safety resources in any area.',
            howItWorks: [
                'Open Safety Map from main menu',
                'View current location on map',
                'See safety ratings for areas',
                'Filter by place type',
                'Get directions to safe places'
            ],
            specifications: {
                'Place Types': 'Police, Hospital, Shelter, Fire, Safe Zone',
                'Search Radius': 'Up to 10 km',
                'Safety Ratings': 'Area-based',
                'Offline Caching': 'Major locations',
                'One-Tap Call': 'Yes'
            },
            useCases: ['New area exploration', 'Night navigation', 'Travel planning', 'Emergency resources'],
            benefits: ['Area awareness', 'Safety ratings', 'Resource locations', 'One-tap directions']
        },
        { 
            icon: <NotificationsIcon />, 
            title: 'Push Notifications', 
            description: 'Real-time safety alerts, news, and emergency broadcasts.', 
            color: 'warning',
            category: 'General',
            overview: 'Stay informed with real-time notifications about safety alerts, nearby emergencies, and important safety news. Customize what notifications you receive and how.',
            howItWorks: [
                'Enable notifications in settings',
                'Choose notification types',
                'Receive safety alerts in real-time',
                'Emergency broadcasts instantly',
                'Customize quiet hours'
            ],
            specifications: {
                'Alert Types': 'SOS, Safe Zone, News, Broadcast',
                'Sound Options': 'Customizable',
                'Quiet Hours': 'Set times',
                'Badge Counter': 'Yes',
                'Notification History': '30 days'
            },
            useCases: ['Emergency alerts', 'Family check-ins', 'Safety news', 'Area broadcasts'],
            benefits: ['Real-time updates', 'Customizable', 'Priority alerts', 'History tracking']
        },
        { 
            icon: <AccessIcon />, 
            title: 'Accessibility', 
            description: 'Voice commands and text-to-speech for hands-free emergency use.', 
            color: 'success',
            category: 'General',
            overview: 'Safety for everyone, regardless of ability. Voice commands allow hands-free operation, while text-to-speech ensures you never miss critical safety information.',
            howItWorks: [
                'Enable voice commands in settings',
                'Use voice to activate features',
                'Receive audio feedback',
                'Text read aloud automatically',
                'Screen reader compatible'
            ],
            specifications: {
                'Voice Commands': '50+ commands',
                'Languages': '10+',
                'TTS Languages': '30+',
                'Screen Reader': 'Full support',
                'Custom Gestures': 'Yes'
            },
            useCases: ['Visual impairment', 'Physical limitations', 'Driving/walking', 'Elderly users'],
            benefits: ['Universal access', 'Voice control', 'Audio feedback', 'Full compatibility']
        },
    ];

    const handleOpenFeature = (feature) => {
        setSelectedFeature(feature);
        setTabValue(0);
        setDrawerOpen(true);
    };

    const handleCloseFeature = () => {
        setDrawerOpen(false);
        setTimeout(() => setSelectedFeature(null), 300);
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Box sx={{ flex: 1 }}>
                <Container maxWidth="lg" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Chip label="50+ FEATURES" sx={{ mb: 2, bgcolor: 'primary.main', color: 'white' }} />
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>Comprehensive Safety Features</Typography>
                        <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
                            Everything you need to stay safe with 50+ protection features across 10 categories. Click any feature to learn more.
                        </Typography>
                    </Box>
                    <Grid container spacing={3}>
                        {features.map((feature, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                <Card 
                                    sx={{ 
                                        height: '100%', 
                                        bgcolor: 'background.paper', 
                                        transition: 'transform 0.2s, box-shadow 0.2s', 
                                        cursor: 'pointer',
                                        '&:hover': { transform: 'translateY(-8px)', boxShadow: 8, borderColor: `${feature.color}.main` },
                                        border: '2px solid transparent'
                                    }}
                                    onClick={() => handleOpenFeature(feature)}
                                >
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: `${feature.color}.main`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                                {feature.icon}
                                            </Box>
                                            <Chip label={feature.category} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                        </Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>{feature.title}</Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>{feature.description}</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', color: feature.color, fontSize: '0.75rem', fontWeight: 600 }}>
                                            Click to learn more →
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>
            <Footer />

            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleCloseFeature}
                PaperProps={{ sx: { width: { xs: '100%', sm: 500 }, maxWidth: '100%' } }}
            >
                {selectedFeature && (
                    <>
                        <Box sx={{ bgcolor: `${selectedFeature.color}.main`, color: 'white', display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                            <Box sx={{ width: 50, height: 50, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {selectedFeature.icon}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedFeature.title}</Typography>
                                <Chip label={selectedFeature.category} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                            </Box>
                            <IconButton onClick={handleCloseFeature} sx={{ color: 'white' }}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <Box>
                            <Tabs 
                                value={tabValue} 
                                onChange={(e, v) => setTabValue(v)} 
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.100' }}
                            >
                                <Tab label="Overview" />
                                <Tab label="How It Works" />
                                <Tab label="Specs" />
                                <Tab label="Use Cases" />
                            </Tabs>

                            <Box sx={{ p: 2, maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
                                {tabValue === 0 && (
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: `${selectedFeature.color}.main` }}>
                                            Feature Overview
                                        </Typography>
                                        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                                            {selectedFeature.overview}
                                        </Typography>
                                        
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                            Key Benefits
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {selectedFeature.benefits.map((benefit, i) => (
                                                <Grid item xs={6} sm={3} key={i}>
                                                    <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                                                        <CheckCircleIcon sx={{ color: 'success.main', fontSize: 32, mb: 1 }} />
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{benefit}</Typography>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}

                                {tabValue === 1 && (
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: `${selectedFeature.color}.main` }}>
                                            How to Use This Feature
                                        </Typography>
                                        <Stepper orientation="vertical">
                                            {selectedFeature.howItWorks.map((step, i) => (
                                                <Step key={i} active>
                                                    <StepLabel>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Step {i + 1}</Typography>
                                                    </StepLabel>
                                                    <StepContent>
                                                        <Typography>{step}</Typography>
                                                    </StepContent>
                                                </Step>
                                            ))}
                                        </Stepper>
                                    </Box>
                                )}

                                {tabValue === 2 && (
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: `${selectedFeature.color}.main` }}>
                                            Technical Specifications
                                        </Typography>
                                        <TableContainer component={Paper} variant="outlined">
                                            <Table>
                                                <TableBody>
                                                    {Object.entries(selectedFeature.specifications).map(([key, value]) => (
                                                        <TableRow key={key}>
                                                            <TableCell sx={{ fontWeight: 600, width: '40%' }}>{key}</TableCell>
                                                            <TableCell>{value}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}

                                {tabValue === 3 && (
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: `${selectedFeature.color}.main` }}>
                                            Common Use Cases
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {selectedFeature.useCases.map((useCase, i) => (
                                                <Grid item xs={12} sm={6} key={i}>
                                                    <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Box sx={{ width: 40, height: 40, bgcolor: `${selectedFeature.color}.main`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                                                            {i + 1}
                                                        </Box>
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{useCase}</Typography>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                        
                                        <Box sx={{ mt: 4, p: 3, bgcolor: `${selectedFeature.color}.main`, borderRadius: 2, color: 'white' }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                                Status: Implemented & Active
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                This feature is fully implemented and ready to use. Download Nirbhaya to access all 50+ safety features.
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                        <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider', display: 'flex', gap: 2 }}>
                            <Button onClick={handleCloseFeature} variant="outlined" fullWidth>Close</Button>
                            <Button variant="contained" color={selectedFeature.color} onClick={handleCloseFeature} fullWidth>
                                Get the App
                            </Button>
                        </Box>
                    </>
                )}
            </Drawer>
        </Box>
    );
};

export const HowItWorksPage = () => {
    const navigate = useNavigate();
    const steps = [
        { label: 'Download & Register', description: 'Download Nirbhaya from app store and create your account with email or phone.', icon: <HowToRegIcon /> },
        { label: 'Add Emergency Contacts', description: 'Add up to 10 trusted family members or friends to your safety circle.', icon: <FamilyIcon /> },
        { label: 'Configure Safety Settings', description: 'Set up voice triggers, volume button SOS, and preferred safety features.', icon: <SecurityIcon /> },
        { label: 'Create Safe Zones', description: 'Set up geofenced areas around home, work, or school for automatic alerts.', icon: <GeofenceIcon /> },
        { label: 'Activate SOS in Emergency', description: 'Press and hold SOS button or use voice command to alert contacts instantly.', icon: <EmergencyIcon /> },
    ];

    const triggers = [
        { name: 'One-Tap SOS Button', icon: '👆' },
        { name: 'Voice Keywords', icon: '🎤' },
        { name: 'Volume Button Press', icon: '🔊' },
        { name: 'Power Button Press', icon: '⚡' },
        { name: 'Shake Device', icon: '📱' },
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Box sx={{ flex: 1 }}>
                <Container maxWidth="lg" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Chip label="GET STARTED" sx={{ mb: 2, bgcolor: 'primary.main', color: 'white' }} />
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>Stay Safe in 5 Simple Steps</Typography>
                        <Typography variant="h6" sx={{ color: 'text.secondary' }}>Getting protected is quick and easy</Typography>
                    </Box>
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Stepper orientation="vertical">
                                {steps.map((step, index) => (
                                    <Step key={index} active>
                                        <StepLabel icon={step.icon}>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{step.label}</Typography>
                                        </StepLabel>
                                        <StepContent>
                                            <Typography sx={{ color: 'text.secondary' }}>{step.description}</Typography>
                                        </StepContent>
                                    </Step>
                                ))}
                            </Stepper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ p: 4, bgcolor: 'background.paper' }}>
                                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>Multiple SOS Triggers</Typography>
                                <Grid container spacing={2}>
                                    {triggers.map((trigger, i) => (
                                        <Grid item xs={6} key={i}>
                                            <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.900' }}>
                                                <Box sx={{ fontSize: 32, mb: 1 }}>{trigger.icon}</Box>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{trigger.name}</Typography>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Card>
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 6, textAlign: 'center' }}>
                        <Button variant="contained" size="large" onClick={() => navigate('/contact')} sx={{ px: 6 }}>Get Started Now</Button>
                    </Box>
                </Container>
            </Box>
            <Footer />
        </Box>
    );
};

export const AboutPage = () => {
    const values = [
        { icon: <SecurityIcon />, title: 'Safety First', desc: 'Your safety is our top priority in every feature we build.', color: 'primary' },
        { icon: <ShieldIcon />, title: 'Privacy Protected', desc: 'Your data is encrypted and never shared without consent.', color: 'secondary' },
        { icon: <SpeedIcon />, title: 'Fast Response', desc: 'Instant alerts reach help within seconds of activation.', color: 'success' },
        { icon: <AccessibleIcon />, title: 'Always Available', desc: '24/7 support and AI assistance whenever you need it.', color: 'warning' },
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Box sx={{ flex: 1 }}>
                <Container maxWidth="lg" sx={{ py: 6 }}>
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Chip label="ABOUT US" sx={{ mb: 2, bgcolor: 'primary.main', color: 'white' }} />
                            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>Empowering Women with Technology</Typography>
                            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.8 }}>
                                Nirbhaya (meaning "fearless" in Sanskrit) is an AI-powered women's safety application designed to provide instant protection, emergency assistance, and 24/7 support. Our mission is to create a safer world for women through innovative technology with 50+ built-in protection features.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {[
                                    { num: '50+', label: 'Safety Features', color: 'primary' },
                                    { num: '96%', label: 'Complete', color: 'secondary' },
                                    { num: '24/7', label: 'AI Support', color: 'success' },
                                    { num: '100K+', label: 'Downloads', color: 'warning' },
                                ].map((stat, i) => (
                                    <Box key={i} sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: `${stat.color}.main` }}>{stat.num}</Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{stat.label}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ p: 4, bgcolor: 'background.paper' }}>
                                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Our Core Values</Typography>
                                <List>
                                    {values.map((value, i) => (
                                        <ListItem key={i}>
                                            <ListItemIcon><Box sx={{ color: `${value.color}.main` }}>{value.icon}</Box></ListItemIcon>
                                            <ListItemText primary={value.title} secondary={value.desc} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
            <Footer />
        </Box>
    );
};

export const SOSFeaturesPage = () => {
    const [expanded, setExpanded] = useState(false);

    const sosFeatures = [
        { title: 'One-Tap SOS Activation', icon: <EmergencyIcon />, color: 'error', overview: 'The One-Tap SOS feature provides instant emergency alert capability with a single tap. Designed for situations where every second counts, this feature ensures your emergency reaches help within 3 seconds of activation.', howItWorks: ['Press and hold the SOS button for 3 seconds', 'System immediately captures your GPS location', 'Emergency SMS sent to all priority contacts', 'Location updates begin in real-time', 'Audio/video recording starts automatically'], specifications: { 'Activation Time': '< 3 seconds', 'Location Accuracy': '5-10 meters', 'Max Contacts': '10', 'Recording Duration': 'Up to 30 minutes', 'Offline Support': 'Yes (SMS based)' }, useCases: ['Walking alone at night', 'Taxi/Ride-share situations', 'Unwanted attention', 'Medical emergencies'] },
        { title: 'Live Location Tracking', icon: <LocationIcon />, color: 'warning', overview: 'Share your precise GPS coordinates with emergency contacts in real-time during SOS activation. The system continuously updates location every 10 seconds until the SOS is deactivated.', howItWorks: ['GPS coordinates captured immediately on SOS', 'Location shared via SMS to all contacts', 'Real-time updates every 10 seconds', 'Web dashboard for contacts to track', 'Location history saved for evidence'], specifications: { 'Location Update Interval': '10 seconds', 'GPS Accuracy': '5-10 meters', 'Background Tracking': 'Yes', 'Map Integration': 'Google Maps / Apple Maps', 'Offline Caching': 'Yes' }, useCases: ['Family monitoring during travel', 'Elderly parent tracking', 'Child safety during school hours', 'Late-night travel tracking'] },
        { title: 'Emergency Contacts', icon: <GroupIcon />, color: 'info', overview: 'Add and manage up to 10 trusted emergency contacts with customizable priority ordering. Contacts receive alerts based on their priority level.', howItWorks: ['Navigate to Settings > Emergency Contacts', 'Click "Add Contact" and select from phonebook', 'Set priority order (1 = highest priority)', 'Enable/disable individual contact alerts', 'Contacts can be family, friends, or authorities'], specifications: { 'Max Contacts': '10', 'Priority Levels': '1-10', 'Contact Types': 'Family, Friends, Authority', 'Alert Methods': 'SMS, Push, Call', 'Group Support': 'Yes (Family Circle)' }, useCases: ['Family emergency network', 'Friends support group', 'Office safety contacts', 'Neighborhood watch'] },
        { title: 'Audio/Video Recording', icon: <VideoIcon />, color: 'error', overview: 'Automatic evidence capture when SOS is activated. Both audio and video recording begin immediately to document events for later investigation and legal proceedings.', howItWorks: ['Recording starts automatically on SOS trigger', 'Audio recorded at 128kbps quality', 'Video recorded at 720p resolution', 'Files saved to secure encrypted storage', 'Automatic upload when connectivity restored'], specifications: { 'Audio Quality': '128 kbps AAC', 'Video Quality': '720p HD', 'Max Duration': '30 minutes', 'Storage': 'Encrypted local + cloud', 'Auto Upload': 'When WiFi available' }, useCases: ['Evidence for police reports', 'Deterrent to attackers', 'Documentation for legal proceedings', 'Insurance claims'] },
        { title: 'Loud Siren', icon: <FlashIcon />, color: 'warning', overview: 'Activate a loud siren to draw attention and deter potential threats. The siren can be triggered independently or as part of the SOS sequence.', howItWorks: ['Press siren icon or include in SOS sequence', 'Loud alarm plays at 120+ dB', 'Automatic strobe light effect on screen', 'Continuous until manually stopped', 'Can be set to auto-stop after 30 seconds'], specifications: { 'Siren Volume': '120+ dB', 'Duration': 'Manual or auto (30s)', 'Background Play': 'Yes', 'Strobe Effect': 'Yes (screen)', 'Stealth Mode': 'Yes (silent vibration)' }, useCases: ['Deter potential attackers', 'Draw public attention', 'Self-defense situations', 'Help attractors'] },
        { title: 'Offline SOS Support', icon: <WifiIcon />, color: 'info', overview: 'SOS functionality works even without internet connection using SMS and offline capabilities. Your safety is never compromised by connectivity issues.', howItWorks: ['System detects no internet connection', 'Automatically switches to SMS mode', 'GPS coordinates sent via SMS', 'Pre-configured emergency SMS sent', 'Queued for cloud sync when online'], specifications: { 'SMS Based': 'Yes', 'Offline Storage': 'Unlimited alerts', 'Auto Reconnect': 'Yes', 'Sync Queue': 'Automatic', 'Location via SMS': 'Google Maps link' }, useCases: ['Basement/elevator situations', 'Remote areas', 'Poor network coverage', 'Network outages'] },
        { title: 'Battery Monitoring', icon: <BatteryIcon />, color: 'success', overview: 'Smart battery monitoring ensures your emergency response is never compromised. System warns contacts if your device battery is critically low.', howItWorks: ['Continuous battery level monitoring', 'Alerts sent at 20% and 10% battery', 'Emergency contacts notified of low battery', 'Last known location shared before shutdown', 'Power-saving mode suggested'], specifications: { 'Warning Thresholds': '20%, 10%, 5%', 'Alert Types': 'SMS + Push', 'Low Power Mode': 'Automatic suggestion', 'Last Location': 'Auto-shared', 'Charging Detection': 'Yes' }, useCases: ['Long journeys', 'Outdoor activities', 'Emergency situations', 'Child monitoring'] },
        { title: 'Auto Emergency Call', icon: <PhoneIcon />, color: 'error', overview: 'Option to automatically dial emergency services (112/911/100) during SOS activation. This feature ensures authorities are notified even if contacts don\'t respond.', howItWorks: ['Enable auto-call in SOS settings', 'Select emergency number (112/911/100)', 'On SOS, automatically dials after 10 seconds', 'Plays pre-recorded emergency message', 'Shares location via SMS simultaneously'], specifications: { 'Emergency Numbers': '112, 911, 100, 102', 'Auto-dial Delay': '10 seconds', 'Pre-recorded Message': 'Yes', 'Location Sharing': 'Automatic SMS', 'Retry on Failure': '3 attempts' }, useCases: ['Unconscious victim scenarios', 'Kidnapping situations', 'Critical medical emergencies', 'Life-threatening situations'] },
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Box sx={{ flex: 1 }}>
                <Box sx={{ bgcolor: 'error.main', py: 8 }}>
                    <Container maxWidth="lg">
                        <Box sx={{ textAlign: 'center' }}>
                            <EmergencyIcon sx={{ fontSize: 80, color: 'white', mb: 3 }} />
                            <Typography variant="h2" sx={{ fontWeight: 800, color: 'white', mb: 2 }}>SOS Emergency Features</Typography>
                            <Typography variant="h6" sx={{ color: 'white', opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
                                Instant emergency response when you need it most. One tap sends alerts to all trusted contacts with your precise location.
                            </Typography>
                        </Box>
                    </Container>
                </Box>

                <Container maxWidth="lg" sx={{ py: 6 }}>
                    {sosFeatures.map((feature, index) => (
                        <Card key={index} sx={{ mb: 4, bgcolor: 'background.paper' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Box sx={{ width: 60, height: 60, borderRadius: 2, bgcolor: `${feature.color}.main`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                        {feature.icon}
                                    </Box>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: `${feature.color}.main` }}>{feature.title}</Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Status: <Chip label="Implemented" size="small" color="success" /></Typography>
                                    </Box>
                                </Box>

                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Overview</Typography>
                                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.8 }}>{feature.overview}</Typography>

                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="h6">How It Works</Typography></AccordionSummary>
                                    <AccordionDetails>
                                        <List>{feature.howItWorks.map((step, i) => (<ListItem key={i}><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon><ListItemText primary={step} /></ListItem>))}</List>
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="h6">Technical Specifications</Typography></AccordionSummary>
                                    <AccordionDetails>
                                        <TableContainer component={Paper} variant="outlined">
                                            <Table size="small"><TableBody>{Object.entries(feature.specifications).map(([key, value]) => (<TableRow key={key}><TableCell sx={{ fontWeight: 600 }}>{key}</TableCell><TableCell>{value}</TableCell></TableRow>))}</TableBody></Table>
                                        </TableContainer>
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="h6">Use Cases</Typography></AccordionSummary>
                                    <AccordionDetails>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{feature.useCases.map((useCase, i) => (<Chip key={i} label={useCase} variant="outlined" sx={{ m: 0.5 }} />))}</Box>
                                    </AccordionDetails>
                                </Accordion>
                            </CardContent>
                        </Card>
                    ))}
                </Container>
            </Box>
            <Footer />
        </Box>
    );
};

export const AIFeaturesPage = () => {
    const aiFeatures = [
        { title: 'AI Chat Assistant', icon: <SmartToyIcon />, color: 'primary', overview: '24/7 AI-powered safety guidance through natural conversation. Powered by Groq API with advanced language models for instant support.', features: ['Natural language conversation', 'Safety tips and advice', 'Emergency guidance', 'Emotional support', 'Crisis intervention'], capabilities: { 'Response Time': '< 2 seconds', 'Languages': 'English, Hindi, 10+ more', 'Model': 'Groq LLaMA 3', 'Context Memory': '10 conversations', 'Available': '24/7' } },
        { title: 'AI Vision Analysis', icon: <VisionIcon />, color: 'success', overview: 'Upload photos for real-time safety analysis and threat assessment using advanced computer vision AI.', features: ['Real-time image analysis', 'Threat detection', 'Location context', 'Safety rating', 'Recommendation engine'], capabilities: { 'Analysis Time': '< 3 seconds', 'Image Sources': 'Camera, Gallery', 'Threat Categories': '15+ types', 'Accuracy': '95%+', 'Privacy Mode': 'On-device processing' } },
        { title: 'Behavior Pattern Analysis', icon: <BehaviorIcon />, color: 'secondary', overview: 'Machine learning detects unusual patterns and potential threats by analyzing your daily routines and travel patterns.', features: ['Route learning', 'Routine pattern recognition', 'Deviation detection', 'Risk scoring', 'Anomaly alerts'], capabilities: { 'Learning Period': '7 days', 'Pattern Types': 'Location, Time, Duration', 'Alert Threshold': 'Customizable', 'False Positive Rate': '< 5%', 'Background Processing': 'Yes' } },
        { title: 'Safe Route Analysis', icon: <RouteIcon />, color: 'primary', overview: 'AI-powered route safety scoring with alternative path suggestions to ensure you take the safest route.', features: ['Safety score calculation', 'Alternative routes', 'Crime data integration', 'Lighting analysis', 'Time-based recommendations'], capabilities: { 'Route Options': 'Up to 5 alternatives', 'Safety Factors': '15+ parameters', 'Update Frequency': 'Real-time', 'Map Sources': 'Google, Apple, OSM', 'Offline Maps': 'Yes' } },
        { title: 'Speech to Text', icon: <SpeechIcon />, color: 'warning', overview: 'Convert voice to text for hands-free emergency documentation and communication.', features: ['Real-time transcription', 'Multi-language support', 'Punctuation auto-insert', 'Background recording', 'Export to text files'], capabilities: { 'Languages': '50+ languages', 'Accuracy': '98%+', 'Processing': 'On-device', 'Offline Mode': 'Yes', 'Speaker Diarization': 'Yes' } },
        { title: 'Text to Speech', icon: <VolumeIcon />, color: 'info', overview: 'Audible safety instructions and emergency alerts for accessibility and hands-free operation.', features: ['Emergency announcements', 'Safety instructions', 'Navigation guidance', 'Multi-language voice', 'Adjustable speed'], capabilities: { 'Voice Options': '5+ voices', 'Speed Control': '0.5x - 2x', 'Languages': '30+ languages', 'Background Play': 'Yes', 'Volume Override': 'Yes' } },
        { title: 'Route Deviation Detection', icon: <TrackIcon />, color: 'warning', overview: 'Intelligent alerts when your route deviates from normal patterns, indicating potential safety concerns.', features: ['Real-time tracking', 'Deviation alerts', 'Alternate route suggestions', 'Contact notifications', 'Incident logging'], capabilities: { 'Update Interval': '10 seconds', 'Deviation Threshold': '200m default', 'Alert Methods': 'SMS, Push, Call', 'History Retention': '30 days', 'Custom Zones': 'Yes' } },
        { title: 'Risk Score Calculation', icon: <ShieldIcon />, color: 'error', overview: 'Real-time risk assessment based on location, time, behavior patterns, and environmental factors.', features: ['Multi-factor analysis', 'Real-time scoring', 'Trend analysis', 'Predictive alerts', 'Historical comparison'], capabilities: { 'Score Range': '0-100', 'Update Frequency': 'Continuous', 'Factors': '20+ parameters', 'Alert Threshold': 'Customizable', 'Visual Dashboard': 'Yes' } },
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Box sx={{ flex: 1 }}>
                <Box sx={{ bgcolor: 'primary.main', py: 8 }}>
                    <Container maxWidth="lg">
                        <Box sx={{ textAlign: 'center' }}>
                            <SmartToyIcon sx={{ fontSize: 80, color: 'white', mb: 3 }} />
                            <Typography variant="h2" sx={{ fontWeight: 800, color: 'white', mb: 2 }}>AI-Powered Safety</Typography>
                            <Typography variant="h6" sx={{ color: 'white', opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
                                Advanced machine learning algorithms working 24/7 to keep you safe with intelligent threat detection and analysis.
                            </Typography>
                        </Box>
                    </Container>
                </Box>

                <Container maxWidth="lg" sx={{ py: 6 }}>
                    <Grid container spacing={4}>
                        {aiFeatures.map((feature, index) => (
                            <Grid item xs={12} key={index}>
                                <Card sx={{ bgcolor: 'background.paper' }}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Grid container spacing={4}>
                                            <Grid item xs={12} md={4}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                                    <Box sx={{ width: 60, height: 60, borderRadius: 2, bgcolor: `${feature.color}.main`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                                        {feature.icon}
                                                    </Box>
                                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{feature.title}</Typography>
                                                </Box>
                                                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>{feature.overview}</Typography>
                                                <Chip label="Powered by Groq AI" color="primary" />
                                            </Grid>
                                            <Grid item xs={12} md={8}>
                                                <Typography variant="h6" sx={{ mb: 2 }}>Key Features</Typography>
                                                <Grid container spacing={1} sx={{ mb: 3 }}>
                                                    {feature.features.map((f, i) => (<Grid item xs={12} sm={6} key={i}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CheckCircleIcon color="success" fontSize="small" /><Typography variant="body2">{f}</Typography></Box></Grid>))}
                                                </Grid>
                                                <Typography variant="h6" sx={{ mb: 2 }}>Technical Capabilities</Typography>
                                                <TableContainer component={Paper} variant="outlined">
                                                    <Table size="small"><TableBody>{Object.entries(feature.capabilities).map(([key, value]) => (<TableRow key={key}><TableCell sx={{ fontWeight: 600 }}>{key}</TableCell><TableCell>{value}</TableCell></TableRow>))}</TableBody></Table>
                                                </TableContainer>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>
            <Footer />
        </Box>
    );
};

export const FamilyFeaturesPage = () => {
    const familyFeatures = [
        { title: 'Family Group Management', icon: <GroupIcon />, color: 'success', overview: 'Create and manage multiple family groups with different permission levels and access controls.', features: ['Multiple family groups', 'Role-based permissions', 'Admin controls', 'Member management', 'Invite via link/code'], maxMembers: 20, groups: 5 },
        { title: 'Real-Time Location Sharing', icon: <MyLocationIcon />, color: 'info', overview: 'Share your live location with family members automatically at configurable intervals.', features: ['Live GPS tracking', '30-second updates', 'Battery optimized', 'Background tracking', 'Privacy controls'], updateInterval: '30 seconds', accuracy: '5-10 meters' },
        { title: 'Location History', icon: <RouteIcon />, color: 'warning', overview: 'View location history to see where your loved ones have been throughout the day.', features: ['24-hour history', '7-day history (premium)', 'Route visualization', 'Place detection', 'Export capability'], retention: '30 days', detail: 'Minute by minute' },
        { title: 'Safe Zone Alerts', icon: <GeofenceIcon />, color: 'error', overview: 'Get notified when family members arrive or leave designated safe zones like home or school.', features: ['Custom zones', 'Arrival alerts', 'Departure alerts', 'Zone radius control', 'Multiple zones per person'], zoneTypes: ['Home', 'School', 'Work', 'Custom'], maxZones: 10 },
        { title: 'Emergency Status', icon: <EmergencyIcon />, color: 'error', overview: 'Instant visibility when a family member triggers SOS with their location and status.', features: ['Instant notifications', 'Live location tracking', 'One-tap response', 'Status updates', 'Crisis mode'], responseTime: '< 5 seconds', coverage: 'All family members' },
        { title: 'Private Messaging', icon: <MessageIcon />, color: 'primary', overview: 'Secure in-app messaging with family members for coordination and check-ins.', features: ['End-to-end encryption', 'Read receipts', 'Media sharing', 'Voice messages', 'Location sharing in chat'], encryption: 'AES-256' },
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Box sx={{ flex: 1 }}>
                <Box sx={{ bgcolor: 'success.main', py: 8 }}>
                    <Container maxWidth="lg">
                        <Box sx={{ textAlign: 'center' }}>
                            <FamilyIcon sx={{ fontSize: 80, color: 'white', mb: 3 }} />
                            <Typography variant="h2" sx={{ fontWeight: 800, color: 'white', mb: 2 }}>Family Circle & Tracking</Typography>
                            <Typography variant="h6" sx={{ color: 'white', opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
                                Keep your loved ones safe with real-time location sharing and instant emergency alerts.
                            </Typography>
                        </Box>
                    </Container>
                </Box>

                <Container maxWidth="lg" sx={{ py: 6 }}>
                    <Grid container spacing={4}>
                        {familyFeatures.map((feature, index) => (
                            <Grid item xs={12} md={6} key={index}>
                                <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                            <Box sx={{ width: 50, height: 50, borderRadius: 2, bgcolor: `${feature.color}.main`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                                {feature.icon}
                                            </Box>
                                            <Typography variant="h5" sx={{ fontWeight: 700 }}>{feature.title}</Typography>
                                        </Box>
                                        <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary', lineHeight: 1.7 }}>{feature.overview}</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                            {feature.features.map((f, i) => (<Chip key={i} label={f} size="small" variant="outlined" />))}
                                        </Box>
                                        {feature.maxMembers && (<Box sx={{ display: 'flex', gap: 3 }}><Typography variant="body2" color="text.secondary">Members: {feature.maxMembers}</Typography><Typography variant="body2" color="text.secondary">Groups: {feature.groups}</Typography></Box>)}
                                        {feature.updateInterval && (<Box sx={{ display: 'flex', gap: 3 }}><Typography variant="body2" color="text.secondary">Updates: {feature.updateInterval}</Typography><Typography variant="body2" color="text.secondary">Accuracy: {feature.accuracy}</Typography></Box>)}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>
            <Footer />
        </Box>
    );
};

export const SmartLocationPage = () => {
    const locationFeatures = [
        { title: 'Geofencing / Safe Zones', icon: <GeofenceIcon />, color: 'info', overview: 'Create virtual boundaries around locations that matter - home, work, school - and receive alerts when someone enters or leaves.', howItWorks: ['Open Smart Location in main menu', 'Tap "Create Safe Zone"', 'Choose location on map or use current location', 'Set radius (100m - 1km)', 'Name the zone and set alert preferences'], settings: { 'Radius Options': '100m, 250m, 500m, 1km', 'Max Zones': '20 per user', 'Alert Types': 'Enter, Exit, Both', 'Notifications': 'Instant push + SMS' } },
        { title: 'Dynamic Route Monitoring', icon: <RouteIcon />, color: 'warning', overview: 'Real-time monitoring of your travel route with automatic deviation detection and alerts.', howItWorks: ['Enable Journey Tracking before travel', 'System monitors your route continuously', 'If deviation detected, alert is triggered', 'Emergency contacts are notified', 'Alternative routes suggested'], settings: { 'Update Interval': '10 seconds', 'Deviation Threshold': '200 meters', 'Alert Delay': '30 seconds', 'Route History': '7 days' } },
        { title: 'Route Re-routing', icon: <ArrowIcon />, color: 'primary', overview: 'AI-powered suggestions for safer alternative routes when your current route is deemed unsafe.', howItWorks: ['System analyzes current route safety', 'If unsafe areas detected, alert shown', 'Tap "Safer Route" for alternatives', 'Routes ranked by safety score', 'One-tap navigation to selected route'], settings: { 'Safety Factors': '15+ parameters', 'Route Options': 'Up to 5 alternatives', 'Re-routing Time': '< 2 seconds', 'Offline Capability': 'Yes (cached)' } },
        { title: 'Darkness Reminder', icon: <DarkIcon />, color: 'secondary', overview: 'Smart alerts reminding you to be cautious during evening and night hours based on sunset times.', howItWorks: ['System calculates local sunset time', 'Reminder sent 30 minutes before sunset', 'Additional reminder at full dark', 'Tips provided for night safety', 'Option to enable Journey Tracking'], settings: { 'Sunset Alert': '30 min before', 'Dark Alert': 'At sunset + 30 min', 'Custom Time': 'Available', 'Quiet Hours': 'Configurable' } },
        { title: 'Sunset Journey Alerts', icon: <FlashAutoIcon />, color: 'warning', overview: 'Automatic warnings for journeys that may extend past sunset, with safety recommendations.', howItWorks: ['Enter destination for planned journey', 'System estimates arrival time', 'If arrival past sunset, warning shown', 'Options: change time, add escort, share trip', 'Journey Tracking auto-enabled'], settings: { 'Warning Threshold': 'Sunset time', 'Recommendation Types': '5+ options', 'Auto-enable Tracking': 'Optional', 'Contact Notification': 'Optional' } },
        { title: 'Nearby Safe Points', icon: <LocationIcon />, color: 'success', overview: 'Find police stations, hospitals, safe shelters, and other emergency services near your location.', howItWorks: ['Tap "Find Safe Places" on map', 'Filter by type (police, hospital, shelter)', 'View distance and directions', 'One-tap call to selected location', 'Share location with contacts'], settings: { 'Place Types': 'Police, Hospital, Shelter, Fire', 'Search Radius': 'Up to 10 km', 'Offline Caching': 'Major locations', 'One-Tap Call': 'Yes' } },
        { title: 'Parked Car Location', icon: <ParkingIcon />, color: 'info', overview: 'Never lose your car again - save and share parking locations with automatic reminders.', howItWorks: ['Auto-capture when you stop driving', 'Or manually tap "Save Car Location"', 'View on map with walking directions', 'Set reminder for meter/parking expiry', 'Share location with friends/family'], settings: { 'Auto-detect': 'Motion-based', 'Manual Save': 'One-tap', 'Reminders': 'Customizable', 'Share Options': 'All contacts' } },
        { title: 'AR Escape Guidance', icon: <WalkIcon />, color: 'error', overview: 'Augmented reality navigation to the nearest safe point or exit in emergency situations.', howItWorks: ['Point camera in direction of travel', 'AR overlay shows safe directions', 'Distance to nearest safe point', 'Turn-by-turn AR navigation', 'Voice guidance available'], settings: { 'AR Distance': 'Up to 500 meters', 'Update Frequency': 'Real-time', 'Voice Guidance': 'Yes', 'Offline Mode': 'Partial' } },
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Box sx={{ flex: 1 }}>
                <Box sx={{ bgcolor: 'info.main', py: 8 }}>
                    <Container maxWidth="lg">
                        <Box sx={{ textAlign: 'center' }}>
                            <LocationIcon sx={{ fontSize: 80, color: 'white', mb: 3 }} />
                            <Typography variant="h2" sx={{ fontWeight: 800, color: 'white', mb: 2 }}>Smart Location Features</Typography>
                            <Typography variant="h6" sx={{ color: 'white', opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
                                Intelligent location services that keep you aware of your surroundings and guide you to safety.
                            </Typography>
                        </Box>
                    </Container>
                </Box>

                <Container maxWidth="lg" sx={{ py: 6 }}>
                    <Grid container spacing={4}>
                        {locationFeatures.map((feature, index) => (
                            <Grid item xs={12} key={index}>
                                <Card sx={{ bgcolor: 'background.paper' }}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Grid container spacing={4}>
                                            <Grid item xs={12} md={5}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                    <Box sx={{ width: 60, height: 60, borderRadius: 2, bgcolor: `${feature.color}.main`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                                        {feature.icon}
                                                    </Box>
                                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{feature.title}</Typography>
                                                </Box>
                                                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>{feature.overview}</Typography>
                                            </Grid>
                                            <Grid item xs={12} md={7}>
                                                <Typography variant="h6" sx={{ mb: 2 }}>How to Use</Typography>
                                                <Stepper orientation="vertical">
                                                    {feature.howItWorks.map((step, i) => (<Step key={i} active><StepLabel>{step}</StepLabel></Step>))}
                                                </Stepper>
                                                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Settings</Typography>
                                                <Grid container spacing={1}>
                                                    {Object.entries(feature.settings).map(([key, value]) => (
                                                        <Grid item xs={12} sm={6} key={key}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                                                                <Typography variant="body2">{key}</Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                                                            </Box>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>
            <Footer />
        </Box>
    );
};

export const DisguisedFeaturesPage = () => {
    const disguisedFeatures = [
        { title: 'Fake Incoming Call', icon: <CallIcon />, color: 'default', overview: 'Schedule realistic fake calls with custom caller names to escape uncomfortable situations discreetly.', howItWorks: ['Open Fake Call from disguised menu (Calculator)', 'Set caller name (Mom, Boss, Police, etc.)', 'Set timer or immediate call', 'At scheduled time, phone rings with realistic UI', 'Answer to have "conversation" or let it ring'], settings: { 'Caller Names': 'Custom + Presets', 'Ringtone': 'Standard phone ringtone', 'Vibration': 'Realistic pattern', 'Schedule': 'Immediate or delayed', 'Call History': 'Appears in history' }, presets: ['Mom', 'Dad', 'Boss', 'Husband', 'Police', 'Taxi Driver'] },
        { title: 'Custom Caller Name', icon: <PersonIcon />, color: 'default', overview: 'Set any name you want to appear on the fake call - mom, boss, police, anyone.', howItWorks: ['Choose from preset names', 'Or type custom name', 'Name appears on incoming call screen', 'Works with photo if available', 'Multiple saved custom names'], settings: { 'Preset Names': '10+ options', 'Custom Names': 'Unlimited', 'Photo Option': 'Stock + Custom', 'Save Favorites': 'Yes' } },
        { title: 'Shake to Decline', icon: <VibrationIcon />, color: 'default', overview: 'Naturally end the fake call by shaking your phone, mimicking a declined call.', howItWorks: ['During fake call, shake phone gently', 'Call automatically ends', 'Appears as "Missed Call" in history', 'Natural gesture, no suspicious tapping', 'Sensitivity adjustable in settings'], settings: { 'Shake Sensitivity': 'Low/Medium/High', 'Min Shake Duration': '0.5 seconds', 'Haptic Feedback': 'Yes', 'Audio Confirmation': 'Optional' } },
        { title: 'Realistic Call UI', icon: <PhoneIcon />, color: 'default', overview: 'Pixel-perfect recreation of phone call screens for maximum authenticity.', howItWorks: ['Full-screen incoming call display', 'Caller name and photo', 'Accept/Decline buttons', 'Call timer if answered', 'Speakerphone indicator'], settings: { 'Screen Lock Display': 'Yes', 'Lock Screen Notification': 'Yes', 'Status Bar Notification': 'Yes', 'Answer Animation': 'Standard' } },
        { title: 'Call Timer', icon: <TimerIcon />, color: 'default', overview: 'Built-in timer to track fake call duration and auto-end calls after set time.', howItWorks: ['Set call duration before starting', 'Timer displays during "call"', 'Auto-end at timer expiry', 'Or manually end anytime', 'End sound plays naturally'], settings: { 'Timer Range': '30 sec - 10 min', 'Auto End': 'Yes/No', 'End Sound': 'Call dropped', 'Timer Display': 'On call screen' } },
        { title: 'Vibration Patterns', icon: <VibrationIcon />, color: 'default', overview: 'Realistic vibration patterns that mimic actual incoming phone calls.', howItWorks: ['Vibration starts before ringtone', 'Standard phone vibration pattern', 'Continues during ring', 'Stops when answered/declined', 'Can be disabled in settings'], settings: { 'Vibration Pattern': 'Standard iOS/Android', 'Duration': 'Until answered', 'Intensity': 'Device default', 'Enable/Disable': 'Yes' } },
        { title: 'Fake Message Alert', icon: <MessageIcon />, color: 'default', overview: 'Discreet fake message notifications that look completely real for excuse purposes.', howItWorks: ['Choose contact and message', 'Set notification time', 'Fake notification appears', 'Message appears in messaging app', 'Looks completely authentic'], settings: { 'App Integration': 'All messaging apps', 'Custom Messages': 'Unlimited', 'Notification Style': 'Per app style', 'Reply Simulation': 'Optional' } },
        { title: 'Fake Battery Death', icon: <BatteryIcon />, color: 'default', overview: 'Display fake low battery warning to excuse yourself from situations.', howItWorks: ['Set fake battery percentage', 'Trigger immediately or scheduled', 'Phone shows "battery dying" warning', 'Phone eventually "shuts down"', 'Natural excuse to leave'], settings: { 'Battery Levels': '20%, 10%, 5%, 1%', 'Shutdown Delay': '30 sec - 5 min', 'Auto Recovery': 'After 5 minutes', 'Sound Effect': 'Optional' } },
        { title: 'Disguised App Icons', icon: <CalculatorIcon />, color: 'default', overview: 'Change Nirbhaya\'s icon to look like a calculator, notes, weather, calendar, or other common apps.', iconOptions: [{ name: 'Calculator', icon: '🧮' }, { name: 'Notes', icon: '📝' }, { name: 'Weather', icon: '☀️' }, { name: 'Calendar', icon: '📅' }, { name: 'Health', icon: '❤️' }, { name: 'Music', icon: '🎵' }, { name: 'Shopping', icon: '🛒' }, { name: 'Cloud', icon: '☁️' }] },
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Box sx={{ flex: 1 }}>
                <Box sx={{ bgcolor: 'grey.800', py: 8 }}>
                    <Container maxWidth="lg">
                        <Box sx={{ textAlign: 'center' }}>
                            <LockIcon sx={{ fontSize: 80, color: 'white', mb: 3 }} />
                            <Typography variant="h2" sx={{ fontWeight: 800, color: 'white', mb: 2 }}>Disguised Safety Features</Typography>
                            <Typography variant="h6" sx={{ color: 'white', opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
                                Safety features disguised as everyday apps - nobody will ever know.
                            </Typography>
                        </Box>
                    </Container>
                </Box>

                <Container maxWidth="lg" sx={{ py: 6 }}>
                    {disguisedFeatures.map((feature, index) => (
                        <Card key={index} sx={{ mb: 4, bgcolor: 'background.paper' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={5}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                            <Box sx={{ width: 60, height: 60, borderRadius: 2, bgcolor: 'grey.700', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 28 }}>
                                                {feature.icon}
                                            </Box>
                                            <Typography variant="h4" sx={{ fontWeight: 700 }}>{feature.title}</Typography>
                                        </Box>
                                        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>{feature.overview}</Typography>
                                        {feature.iconOptions && (
                                            <Box>
                                                <Typography variant="h6" sx={{ mb: 2 }}>Available Icons</Typography>
                                                <Grid container spacing={1}>
                                                    {feature.iconOptions.map((opt, i) => (
                                                        <Grid item xs={6} sm={3} key={i}>
                                                            <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100' }}>
                                                                <Box sx={{ fontSize: 32, mb: 1 }}>{opt.icon}</Box>
                                                                <Typography variant="caption">{opt.name}</Typography>
                                                            </Card>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </Box>
                                        )}
                                        {feature.presets && (<Box sx={{ mt: 2 }}><Typography variant="body2" color="text.secondary">Preset Names: {feature.presets.join(', ')}</Typography></Box>)}
                                    </Grid>
                                    <Grid item xs={12} md={7}>
                                        {feature.howItWorks && (
                                            <>
                                                <Typography variant="h6" sx={{ mb: 2 }}>How to Use</Typography>
                                                <Stepper orientation="vertical" sx={{ mb: 3 }}>
                                                    {feature.howItWorks.map((step, i) => (<Step key={i} active><StepLabel>{step}</StepLabel></Step>))}
                                                </Stepper>
                                            </>
                                        )}
                                        {feature.settings && (
                                            <>
                                                <Typography variant="h6" sx={{ mb: 2 }}>Settings</Typography>
                                                <Grid container spacing={1}>
                                                    {Object.entries(feature.settings).map(([key, value]) => (
                                                        <Grid item xs={12} sm={6} key={key}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                                                                <Typography variant="body2">{key}</Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                                                            </Box>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </>
                                        )}
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    ))}
                </Container>
            </Box>
            <Footer />
        </Box>
    );
};

export const SafetyResourcesPage = () => {
    const resources = {
        helplines: { title: 'Emergency Helplines', icon: <PhoneNumberIcon />, color: 'error', items: [{ name: 'Women Helpline', number: '181', type: 'National', availability: '24/7', description: 'For women in distress' }, { name: 'Police Emergency', number: '100', type: 'National', availability: '24/7', description: 'Police emergency response' }, { name: 'Ambulance', number: '108', type: 'National', availability: '24/7', description: 'Medical emergencies' }, { name: 'National Emergency', number: '112', type: 'National', availability: '24/7', description: 'All emergencies' }, { name: 'Women in Distress', number: '1091', type: 'National', availability: '24/7', description: 'Women safety helpline' }, { name: 'Child Helpline', number: '1098', type: 'National', availability: '24/7', description: 'Child protection' }] },
        laws: { title: 'Safety Laws & Acts', icon: <LawIcon />, color: 'primary', items: [{ name: 'Protection of Women from Domestic Violence Act', year: '2005', sections: 'Sections 3-36', description: 'Protection against domestic violence' }, { name: 'Sexual Harassment of Women at Workplace Act', year: '2013', sections: 'Sections 1-31', description: 'Workplace safety regulations' }, { name: 'Criminal Law Amendment Act', year: '2013', sections: 'Sections 354A-F', description: 'Sexual offence definitions' }, { name: 'Dowry Prohibition Act', year: '1961', sections: 'Sections 1-10', description: 'Dowry-related offences' }, { name: 'IT Act - Cyber Crime', year: '2000', sections: 'Sections 66A-E', description: 'Online harassment & stalking' }] },
        tutorials: { title: 'Safety Tutorials', icon: <BookIcon />, color: 'success', items: [{ category: 'Self-Defense', lessons: 12, duration: '2 hours', topics: ['Basic strikes', 'Escapes', 'Ground defense', 'Weapon awareness'] }, { category: 'Digital Safety', lessons: 8, duration: '1.5 hours', topics: ['Privacy settings', 'Password security', 'Social media safety', 'Online dating safety'] }, { category: 'Travel Safety', lessons: 10, duration: '1.5 hours', topics: ['Public transport', 'Ride-sharing', 'Hotel safety', 'Solo travel'] }, { category: 'Workplace Safety', lessons: 6, duration: '1 hour', topics: ['Office security', 'Harassment reporting', 'After-hours safety', 'Remote work'] }] },
        reports: { title: 'Report Portals', icon: <GavelIcon />, color: 'warning', items: [{ name: 'National Cyber Crime Portal', url: 'cybercrime.gov.in', description: 'Report cyber crimes online', type: 'Official' }, { name: 'NCRB Crime Reporting', url: 'cybercrime.gov.in', description: 'Crime statistics & reporting', type: 'Official' }, { name: 'National Commission for Women', url: 'ncw.nic.in', description: 'Women rights portal', type: 'Official' }, { name: 'Police Complaint Portal', url: 'phq.gov.in', description: 'Online FIR filing', type: 'Official' }] }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Box sx={{ flex: 1, py: 6 }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Chip label="RESOURCES" sx={{ mb: 2, bgcolor: 'warning.main', color: 'white' }} />
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>Safety Resources</Typography>
                        <Typography variant="h6" sx={{ color: 'text.secondary' }}>Complete guides, contacts, and legal information.</Typography>
                    </Box>

                    <Card sx={{ mb: 4, bgcolor: 'background.paper' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Box sx={{ width: 50, height: 50, borderRadius: 2, bgcolor: `${resources.helplines.color}.main`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{resources.helplines.icon}</Box>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>{resources.helplines.title}</Typography>
                            </Box>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Service</TableCell>
                                            <TableCell>Number</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell>Availability</TableCell>
                                            <TableCell>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {resources.helplines.items.map((item, i) => (
                                            <TableRow key={i}>
                                                <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                                                <TableCell sx={{ color: 'error.main', fontWeight: 700 }}>{item.number}</TableCell>
                                                <TableCell><Chip label={item.type} size="small" /></TableCell>
                                                <TableCell>{item.availability}</TableCell>
                                                <TableCell><Button variant="contained" color="error" size="small" href={`tel:${item.number}`}>Call Now</Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>

                    <Card sx={{ mb: 4, bgcolor: 'background.paper' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Box sx={{ width: 50, height: 50, borderRadius: 2, bgcolor: `${resources.laws.color}.main`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{resources.laws.icon}</Box>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>{resources.laws.title}</Typography>
                            </Box>
                            <Grid container spacing={3}>
                                {resources.laws.items.map((law, i) => (
                                    <Grid item xs={12} md={6} key={i}>
                                        <Card variant="outlined" sx={{ p: 2 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{law.name}</Typography>
                                            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                                <Chip label={law.year} size="small" />
                                                <Chip label={law.sections} size="small" variant="outlined" />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">{law.description}</Typography>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>

                    <Card sx={{ bgcolor: 'background.paper' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Box sx={{ width: 50, height: 50, borderRadius: 2, bgcolor: `${resources.tutorials.color}.main`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{resources.tutorials.icon}</Box>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>{resources.tutorials.title}</Typography>
                            </Box>
                            <Grid container spacing={3}>
                                {resources.tutorials.items.map((tutorial, i) => (
                                    <Grid item xs={12} sm={6} key={i}>
                                        <Card variant="outlined" sx={{ p: 3 }}>
                                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>{tutorial.category}</Typography>
                                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                                <Chip label={`${tutorial.lessons} Lessons`} size="small" />
                                                <Chip label={tutorial.duration} size="small" variant="outlined" />
                                            </Box>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {tutorial.topics.map((topic, j) => (<Chip key={j} label={topic} size="small" variant="outlined" />))}
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Container>
            </Box>
            <Footer />
        </Box>
    );
};

export const VoiceTriggerFeaturesPage = () => {
    const voiceFeatures = [
        { title: 'Voice Keyword Detection', icon: <VoiceChatIcon />, color: 'primary', overview: 'Trigger SOS using custom voice keywords even when the app is running in the background. Speak your secret word to activate emergency mode.', keywords: ['Help Me', 'Save Me', 'Emergency', 'Help', 'SOS'], specifications: { 'Detection': 'Background capable', 'Languages': 'English, Hindi', 'Accuracy': '95%+', 'False Trigger Rate': '< 1%', 'Response Time': '< 2 seconds' } },
        { title: 'Volume Button SOS', icon: <PanToolIcon />, color: 'error', overview: 'Configure volume buttons for quick SOS activation with customizable press counts and time windows.', specifications: { 'Press Count': '3-10 presses', 'Time Window': '3-10 seconds', 'Single Button': 'Volume Up only', 'Both Buttons': 'Up + Down', 'Background': 'Yes' } },
        { title: 'Shake to SOS', icon: <VibrationIcon />, color: 'warning', overview: 'Activate emergency by shaking your phone - natural gesture that doesn\'t require looking at screen.', specifications: { 'Shake Sensitivity': 'Low/Medium/High', 'Min Duration': '1 second', 'Pattern': '3 shakes in 3 seconds', 'Haptic Feedback': 'Yes', 'Audio Feedback': 'Optional alarm' } },
        { title: 'Power Button Press', icon: <FlashIcon />, color: 'info', overview: 'Triple press of power button triggers SOS - works even when phone is locked.', specifications: { 'Press Count': '3 presses', 'Time Window': '2 seconds', 'Screen Off': 'Works', 'Lock Screen': 'Works', 'Confirmation': 'Optional 3-second hold' } }
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Box sx={{ flex: 1 }}>
                <Box sx={{ bgcolor: 'secondary.main', py: 8 }}>
                    <Container maxWidth="lg">
                        <Box sx={{ textAlign: 'center' }}>
                            <VoiceChatIcon sx={{ fontSize: 80, color: 'white', mb: 3 }} />
                            <Typography variant="h2" sx={{ fontWeight: 800, color: 'white', mb: 2 }}>Voice & Trigger Features</Typography>
                            <Typography variant="h6" sx={{ color: 'white', opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
                                Multiple ways to activate emergency alerts without touching your screen.
                            </Typography>
                        </Box>
                    </Container>
                </Box>

                <Container maxWidth="lg" sx={{ py: 6 }}>
                    <Grid container spacing={4}>
                        {voiceFeatures.map((feature, index) => (
                            <Grid item xs={12} md={6} key={index}>
                                <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                            <Box sx={{ width: 60, height: 60, borderRadius: 2, bgcolor: `${feature.color}.main`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                                {feature.icon}
                                            </Box>
                                            <Typography variant="h4" sx={{ fontWeight: 700 }}>{feature.title}</Typography>
                                        </Box>
                                        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>{feature.overview}</Typography>
                                        {feature.keywords && (
                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="h6" sx={{ mb: 1 }}>Default Keywords:</Typography>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    {feature.keywords.map((kw, i) => (<Chip key={i} label={kw} variant="outlined" />))}
                                                </Box>
                                            </Box>
                                        )}
                                        <TableContainer component={Paper} variant="outlined">
                                            <Table size="small">
                                                <TableBody>
                                                    {Object.entries(feature.specifications).map(([key, value]) => (
                                                        <TableRow key={key}>
                                                            <TableCell sx={{ fontWeight: 600 }}>{key}</TableCell>
                                                            <TableCell>{value}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>
            <Footer />
        </Box>
    );
};

export default LandingPage;

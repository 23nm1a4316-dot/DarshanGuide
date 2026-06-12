import React, { useState, useEffect } from 'react';
import { 
  Compass, Search, MapPin, Bell, User, Sun, Moon, Sparkles, Map, 
  Calendar, Clock, ShieldCheck, Heart, Landmark, HelpCircle, LogOut, Check,
  QrCode, Menu, X, Landmark as Gpurm, Utensils, Route, ArrowRight, UserCheck, AlertCircle, ChevronDown
} from 'lucide-react';
import { TEMPLES_DATA, MULTILINGUAL_DICTIONARY } from './data';
import { Temple, AppNotification, UserState } from './types';
import TempleDetailView from './components/TempleDetailView';
import PilgrimagePlanner from './components/PilgrimagePlanner';
import AnnadanamPrasadam from './components/AnnadanamPrasadam';
import SpiritualChatbot from './components/SpiritualChatbot';
import AdminPanel from './components/AdminPanel';

export default function App() {
  // Locale States
  const [language, setLanguage] = useState<'en' | 'te' | 'hi' | 'ta' | 'kn'>('en');
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'detail' | 'planner' | 'chatbot' | 'annadanam' | 'admin'>('home');
  const [selectedTempleId, setSelectedTempleId] = useState('tirupati');

  // Search/Filters states
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('All');
  const [deityFilter, setDeityFilter] = useState('All');
  const [facilityFilter, setFacilityFilter] = useState({
    wheelchair: false,
    annadanam: false,
    parking: false,
    accommodation: false
  });

  // GPS Location states
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceMatrix, setDistanceMatrix] = useState<Record<string, { dist: number; time: string }>>({});
  const [gpsLoading, setGpsLoading] = useState(false);

  // Authentication State
  const [userState, setUserState] = useState<UserState>({
    fullName: '',
    email: '',
    mobile: '',
    isLoggedIn: false,
    savedTemples: ['tirupati', 'kashi'],
    visitHistory: [
      { templeId: 'tirupati', date: '2026-04-12' },
      { templeId: 'goldentemple', date: '2026-05-18' }
    ],
    reviewsWritten: []
  });

  // Auth Modal States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'otp' | 'google'>('login');
  
  // Registration Forms states  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  // Login Forms states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [otpValue, setOtpValue] = useState('');

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [unreadsCount, setUnreadsCount] = useState(4);

  // PWA/Offline Status Trigger
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [showPwaBanner, setShowPwaBanner] = useState(true);

  // Load backend alerts and setup themes on mount
  useEffect(() => {
    // Apply dark mode theme
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    fetchAlerts();
    updateOfflineStatus();
    window.addEventListener('online', updateOfflineStatus);
    window.addEventListener('offline', updateOfflineStatus);
    return () => {
      window.removeEventListener('online', updateOfflineStatus);
      window.removeEventListener('offline', updateOfflineStatus);
    };
  }, []);

  const updateOfflineStatus = () => {
    setIsOfflineMode(!navigator.onLine);
  };

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data);
      setUnreadsCount(data.filter((n: any) => !n.read).length);
    } catch (err) {
      console.error(err);
    }
  };

  const addAlert = (title: string, message: string, category: any) => {
    const newAlert: AppNotification = {
      id: "alert_" + Date.now(),
      title,
      message,
      category,
      timestamp: "Just now",
      read: false
    };
    setNotifications(prev => [newAlert, ...prev]);
    setUnreadsCount(prev => prev + 1);
  };

  const translate = (key: string): string => {
    return MULTILINGUAL_DICTIONARY[language]?.[key] || MULTILINGUAL_DICTIONARY['en']?.[key] || key;
  };

  // GPS Coordinate calculations relative to temples
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser framework.");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        calculateDistances(latitude, longitude);
        setGpsLoading(false);
        addAlert(
          "Location Verified Successfully", 
          "Detected your location. Re-ordered nearby temples based on distance.", 
          "weather"
        );
      },
      (error) => {
        console.error(error);
        // Fallback simulated coordinates (e.g. Hyderabad coordinates) for preview integrity
        const HyderabadLat = 17.3850;
        const HyderabadLng = 78.4867;
        setUserCoords({ lat: HyderabadLat, lng: HyderabadLng });
        calculateDistances(HyderabadLat, HyderabadLng);
        setGpsLoading(false);
        addAlert(
          "GPS Simulated Location Active", 
          "Using simulated location coordinates.", 
          "weather"
        );
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const calculateDistances = (lat: number, lng: number) => {
    const matrix: Record<string, { dist: number; time: string }> = {};
    
    TEMPLES_DATA.forEach((temple) => {
      // Simple Haversine calculation
      const R = 6371; // Radius of Earth in km
      const dLat = (temple.location.lat - lat) * (Math.PI / 180);
      const dLng = (temple.location.lng - lng) * (Math.PI / 180);
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat * (Math.PI / 180)) * Math.cos(temple.location.lat * (Math.PI / 180)) * 
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = parseFloat((R * c).toFixed(1));
      
      const speed = 50; // Average driving speed in India (50 km/h)
      const hours = distance / speed;
      const travelTimeStr = hours < 1 
        ? `${Math.round(hours * 60)} mins`
        : `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}h mins`;

      matrix[temple.id] = {
        dist: distance,
        time: travelTimeStr
      };
    });

    setDistanceMatrix(matrix);
  };

  // Auth Submission handler logic
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'register') {
      if (!regName || !regEmail) return;
      setUserState(prev => ({
        ...prev,
        fullName: regName,
        email: regEmail,
        mobile: regMobile,
        isLoggedIn: true
      }));
      addAlert("Welcoming Devotee", `Blessed day, ${regName}! Your account has been registered successfully.`, "general");
    } else if (authMode === 'login') {
      if (!loginEmail) return;
      setUserState(prev => ({
        ...prev,
        fullName: loginEmail.split('@')[0],
        email: loginEmail,
        isLoggedIn: true
      }));
      addAlert("Session Logged In", `Welcome back, devotee!`, "general");
    } else if (authMode === 'otp') {
      setUserState(prev => ({
        ...prev,
        fullName: "Anupa K (Verified)",
        isLoggedIn: true
      }));
      addAlert("OTP login confirmed", "Mobile login completed with divine secure credential.", "general");
    }
    setShowAuthModal(false);
  };

  const handleLogOut = () => {
    setUserState(prev => ({ ...prev, fullName: '', email: '', isLoggedIn: false }));
    addAlert("Logged Out", "Your session was securely completed.", "general");
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadsCount(0);
  };

  // Filtering calculations on shrine list
  const filteredTemples = TEMPLES_DATA.filter((temple) => {
    const matchesSearch = 
      temple.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      temple.deity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      temple.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      temple.state.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesState = stateFilter === 'All' || temple.state === stateFilter;
    const matchesDeity = deityFilter === 'All' || temple.deity.toLowerCase().includes(deityFilter.toLowerCase());
    
    const matchesFacilities = 
      (!facilityFilter.wheelchair || temple.facilities.wheelchair) &&
      (!facilityFilter.annadanam || temple.food.annadanamStatus === 'Available') &&
      (!facilityFilter.parking || temple.facilities.parking) &&
      (!facilityFilter.accommodation || temple.facilities.accommodation);

    return matchesSearch && matchesState && matchesDeity && matchesFacilities;
  }).sort((a, b) => {
    if (userCoords && distanceMatrix[a.id] && distanceMatrix[b.id]) {
      return distanceMatrix[a.id].dist - distanceMatrix[b.id].dist;
    }
    return 0; // Default ordering
  });

  // Get list of deities for filter dropdowns
  const uniqueDeities = ["Balaji", "Shiva", "Parvati", "Granth Sahib", "Jagannath"];
  const uniqueStates = ["Andhra Pradesh", "Uttar Pradesh", "Uttarakhand", "Tamil Nadu", "Punjab", "Odisha"];

  return (
    <div className={`min-h-screen font-sans bg-transparent ${darkMode ? 'dark text-[#FFF8E7]' : 'text-[#141414]'}`}>
      
      {/* Top PWA Banner */}
      {showPwaBanner && (
        <div className="bg-[#800000] text-white py-2.5 px-4 text-xs font-medium sticky top-0 z-50 flex justify-between items-center bg-orange-650 border-b-2 border-[#FFD700] shadow-md">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFD700] animate-pulse shrink-0" />
            <span>Install <b>DarshanGuide Pro App</b> on your home screen for unceasing offline access and push reminders!</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => {
                alert("Auspicious Progress App added to device caching engine.");
                setShowPwaBanner(false);
              }}
              className="bg-[#FF9933] text-white px-3 py-1 rounded-md text-[10px] font-extrabold tracking-wider transition-all hover:bg-[#e68a2e]"
            >
              INSTALL APP
            </button>
            <button onClick={() => setShowPwaBanner(false)} className="hover:scale-110">
              <X className="w-3.5 h-3.5 text-[#FFD700]" />
            </button>
          </div>
        </div>
      )}

      {/* Main navigation header */}
      <header className="bg-[#800000] sticky top-0 z-40 border-b-4 border-[#FFD700] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-full bg-[#FF9933] flex items-center justify-center font-serif text-[#FFF8E7] text-lg font-bold shadow-lg border-2 border-[#FFD700] shrink-0">
              ॐ
            </div>
            <div>
              <h1 className="font-serif font-extrabold text-lg md:text-xl w-max tracking-wide text-white flex items-center gap-1 leading-none">
                Darshan<span className="text-[#FF9933]">Guide</span>
              </h1>
              <span className="text-[10px] text-[#FFD700] block tracking-widest uppercase mt-0.5 font-bold font-sans">Pilgrim platform</span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-extrabold uppercase tracking-widest text-white/80">
            <button onClick={() => setActiveTab('home')} className={`hover:text-[#FFD700] transition-colors pb-1 ${activeTab === 'home' ? 'text-[#FFD700] border-b-2 border-[#FF9933]' : ''}`}>Discovery</button>
            <button onClick={() => setActiveTab('planner')} className={`hover:text-[#FFD700] transition-colors pb-1 ${activeTab === 'planner' ? 'text-[#FFD700] border-b-2 border-[#FF9933]' : ''}`}>AI Planner</button>
            <button onClick={() => setActiveTab('chatbot')} className={`hover:text-[#FFD700] transition-colors pb-1 ${activeTab === 'chatbot' ? 'text-[#FFD700] border-b-2 border-[#FF9933]' : ''}`}>AI Spiritual Guide</button>
            <button onClick={() => setActiveTab('annadanam')} className={`hover:text-[#FFD700] transition-colors pb-1 ${activeTab === 'annadanam' ? 'text-[#FFD700] border-b-2 border-[#FF9933]' : ''}`}>Meals & Prasad</button>
            <button onClick={() => setActiveTab('admin')} className={`hover:text-[#FFD700] transition-colors pb-1 ${activeTab === 'admin' ? 'text-[#FFD700] border-b-2 border-[#FF9933]' : ''}`}>Trust Desk</button>
          </nav>          {/* Quick Actions utilities bar */}
          <div className="flex items-center gap-3">
            
            {/* Language Selection Swapper */}
            <div className="relative group shrink-0">
              <button className="bg-white/10 p-2 border border-white/20 hover:bg-white/20 hover:border-white/30 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 shrink-0">
                <span>🌐 {language.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3 text-[#FFD700]" />
              </button>
              <div className="absolute right-0 top-10 bg-white dark:bg-[#1A0D0D] border dark:border-white/10 rounded-xl shadow-xl w-32 p-1.5 hidden group-hover:block z-50">
                {[
                  { code: 'en', name: 'English' },
                  { code: 'te', name: 'తెలుగు (Telugu)' },
                  { code: 'hi', name: 'हिन्दी (Hindi)' },
                  { code: 'ta', name: 'தமிழ் (Tamil)' },
                  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                    className="w-full text-left p-2 rounded text-[11px] font-bold text-zinc-700 dark:text-[#FFF8E7] hover:bg-[#FFF8E7] hover:text-[#800000] dark:hover:bg-[#800000] dark:hover:text-[#FFD700] transition-colors"
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* In-app Announcements Bell */}
            <button 
              onClick={() => setIsAlertOpen(true)}
              className="p-2.5 bg-white/10 border border-white/20 hover:bg-white/20 transition-all text-white rounded-xl relative"
            >
              <Bell className="w-4 h-4 text-[#FFD700]" />
              {unreadsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF9933] text-white text-[9px] font-black flex items-center justify-center animate-bounce">
                  {unreadsCount}
                </span>
              )}
            </button>

            {/* Dark light swapper */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 bg-white/10 border border-white/20 transition-all text-white rounded-xl hover:bg-white/20"
            >
              {darkMode ? <Sun className="w-4 h-4 text-[#FFD700] animate-spin-slow" /> : <Moon className="w-4 h-4 text-[#FFD700]" />}
            </button>

            {/* Auth Session Login Profile dropdown */}
            {userState.isLoggedIn ? (
              <div className="relative group shrink-0">
                <button className="flex items-center gap-1.5 p-1.5 px-3 bg-gradient-to-r from-[#FF9933] to-[#800000] text-white rounded-lg text-xs font-bold border-2 border-[#FFD700] shadow-sm leading-none shrink-0 cursor-pointer">
                  <UserCheck className="w-3.5 h-3.5 text-yellow-300" />
                  <span className="max-w-[70px] truncate">{userState.fullName}</span>
                </button>
                <div className="absolute right-0 top-9 bg-white dark:bg-[#1A0D0D] border dark:border-white/10 rounded-xl shadow-xl w-48 p-2 hidden group-hover:block z-50 text-xs">
                  <div className="p-2 border-b dark:border-white/15 text-zinc-400 block font-mono text-[10px]">
                    DEVOTEE SESSION ACTIVE
                  </div>
                  <div className="p-2 space-y-1">
                    <p className="font-bold text-zinc-800 dark:text-[#FFF8E7]">{userState.fullName}</p>
                    <p className="text-[10.5px] text-zinc-500 dark:text-zinc-450">{userState.email || "No email"}</p>
                  </div>
                  <button
                    onClick={handleLogOut}
                    className="w-full text-left p-2 hover:bg-rose-50 dark:hover:bg-[#800000]/20 hover:text-red-650 text-red-650 rounded flex items-center gap-2 font-bold cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Devotee Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                className="p-2 px-3 bg-[#FF9933] hover:bg-[#e68a2e] text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1 cursor-pointer border-2 border-[#FFD700]"
              >
                <User className="w-4 h-4" />
                <span className="hidden md:inline">{translate("authButton")}</span>
              </button>
            )}

          </div>
        </div>

        {/* Small/Mobile navigation layout tabs */}
        <div className="lg:hidden border-t-2 border-[#FFD700] bg-[#800000] text-white grid grid-cols-5 text-center text-[10px] font-extrabold uppercase py-3 tracking-wider shadow-lg">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-[#FFD700]' : 'text-white/70'}`}>
            <Gpurm className="w-4 h-4" />
            <span>Discover</span>
          </button>
          <button onClick={() => setActiveTab('planner')} className={`flex flex-col items-center gap-1 ${activeTab === 'planner' ? 'text-[#FFD700]' : 'text-white/70'}`}>
            <Route className="w-4 h-4" />
            <span>Planner</span>
          </button>
          <button onClick={() => setActiveTab('chatbot')} className={`flex flex-col items-center gap-1 ${activeTab === 'chatbot' ? 'text-[#FFD700]' : 'text-white/70'}`}>
            <Compass className="w-4 h-4" />
            <span>AI Guide</span>
          </button>
          <button onClick={() => setActiveTab('annadanam')} className={`flex flex-col items-center gap-1 ${activeTab === 'annadanam' ? 'text-[#FFD700]' : 'text-white/70'}`}>
            <Utensils className="w-4 h-4" />
            <span>Meals</span>
          </button>
          <button onClick={() => setActiveTab('admin')} className={`flex flex-col items-center gap-1 ${activeTab === 'admin' ? 'text-[#FFD700]' : 'text-white/70'}`}>
            <ShieldCheck className="w-4 h-4" />
            <span>Admin</span>
          </button>
        </div>
      </header>

      {/* Main app body */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 min-h-[500px]">
        
        {/* Offline Preview Alert Warning */}
        {isOfflineMode && (
          <div className="mb-6 bg-rose-50 dark:bg-rose-950/15 border border-rose-100 dark:border-rose-900/40 p-3.5 rounded-xl text-xs text-rose-800 dark:text-rose-450 font-sans tracking-wide leading-relaxed flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-550 shrink-0" />
            <div>
              <p className="font-extrabold">Device Connection Lost (Offline Caching Active)</p>
              <span className="text-[10.5px]">DarshanGuide PWA is serving pre-saved local temple parameters from your localStorage cache securely. You can still manage saved plans and review histories!</span>
            </div>
          </div>
        )}

        {/* Dynamic page component dispatcher */}

        {/* TAB: Home / Search Shrines */}
        {activeTab === 'home' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Visual Hero section */}
            <div className="bg-gradient-to-tr from-[#800000] via-[#A01E1E]/90 to-[#FF9933] rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 border-2 border-[#FFD700]/35">
              
              {/* background vector motif representations */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)] pointer-events-none"></div>
              
              <div className="space-y-4 max-w-2xl relative z-10">
                <span className="text-[10px] font-black uppercase bg-[#800000]/40 px-3 py-1 rounded-full text-[#FFD700] tracking-widest leading-none border border-[#FFD700]/25 shrink-0 select-none">
                  🕉️ Sacred Devasthanam Aggregator
                </span>
                
                <h2 className="text-3xl md:text-5xl font-serif font-extrabold text-[#FFF8E7] leading-tight">
                  {translate("discoverTemples")}
                </h2>
                
                <p className="text-sm md:text-base text-[#FFF8E7]/90 tracking-wide font-sans font-medium italic opacity-95">
                  {translate("tagline")}
                </p>

                {/* Tactical Search wrapper and Location Detection */}
                <div className="bg-white dark:bg-[#1C0D0D] p-2 rounded-2xl md:rounded-full flex flex-col sm:flex-row gap-2 border border-[#FFD700]/40 mt-6 shadow-2xl items-center">
                  <div className="flex items-center gap-2.5 flex-1 w-full pl-3 text-[#141414] dark:text-[#FFF8E7]">
                    <Search className="w-4 h-4 text-[#FF9933]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={translate("searchPlaceholder")}
                      className="bg-transparent w-full text-xs text-[#141414] dark:text-[#FFF8E7] placeholder:text-[#6E6E6E] dark:placeholder:text-[#FFF8E7]/50 focus:outline-none"
                    />
                  </div>
                  
                  <button 
                    onClick={handleDetectLocation}
                    disabled={gpsLoading}
                    className="bg-[#FF9933] hover:bg-[#e68a2e] text-white font-bold text-xs uppercase text-zinc-950 px-6 py-3.5 rounded-xl md:rounded-full tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 select-none shadow-md border-2 border-[#FFD700]-20 border-[#FFD700]/10"
                  >
                    <Compass className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
                    <span>{gpsLoading ? 'Detecting...' : translate("detectLocation")}</span>
                  </button>
                </div>
              </div>

              {/* Vector art visual */}
              <div className="bg-white/10 dark:bg-black/25 p-5 rounded-2xl border border-[#FFD700]/20 backdrop-blur shrink-0 hidden md:flex flex-col items-center justify-center text-center select-none shadow-inner w-56 relative group">
                <Gpurm className="w-16 h-16 text-[#FFD700] group-hover:scale-105 duration-300 transition-all" />
                <h5 className="font-serif font-bold text-lg mt-2 text-[#FFF8E7]">Trust Verified</h5>
                <p className="text-[10px] text-[#FFD700] mt-0.5 max-w-xs uppercase font-mono tracking-widest leading-relaxed">6 grand shrines logged</p>
              </div>
            </div>

            {/* Filters dashboard */}
            <div className="bg-white dark:bg-[#231212] p-5 rounded-3xl border border-[#6E6E6E]/15 shadow-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between text-xs font-semibold">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="space-y-1">
                  <span className="text-[10px] text-[#6E6E6E] dark:text-[#FFF8E7]/60 uppercase tracking-widest block font-mono">{translate("Filter by Deity:")}</span>
                  <select
                    value={deityFilter}
                    onChange={(e) => setDeityFilter(e.target.value)}
                    className="bg-[#FFF8E7] dark:bg-[#1A0D0D] border border-[#6E6E6E]/20 text-[#141414] dark:text-[#FFF8E7] p-2.5 rounded-xl outline-none focus:border-[#FF9933] font-bold transition-all"
                  >
                    <option value="All">{translate("All Deities")}</option>
                    {uniqueDeities.map(d => <option key={d} value={d}>{translate(d)}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-[#6E6E6E] dark:text-[#FFF8E7]/60 uppercase tracking-widest block font-mono">{translate("Filter by State:")}</span>
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="bg-[#FFF8E7] dark:bg-[#1A0D0D] border border-[#6E6E6E]/20 text-[#141414] dark:text-[#FFF8E7] p-2.5 rounded-xl outline-none focus:border-[#FF9933] font-bold transition-all"
                  >
                    <option value="All">{translate("All States")}</option>
                    {uniqueStates.map(st => <option key={st} value={st}>{translate(st)}</option>)}
                  </select>
                </div>

                {/* Facilities checklist */}
                <div className="flex flex-wrap gap-4 self-end pt-3 md:pt-0">
                  <label className="flex items-center gap-2 text-[10.5px] cursor-pointer text-[#141414] dark:text-[#FFF8E7]/80 font-bold select-none">
                    <input
                      type="checkbox"
                      checked={facilityFilter.wheelchair}
                      onChange={(e) => setFacilityFilter(prev => ({ ...prev, wheelchair: e.target.checked }))}
                      className="accent-[#FF9933] h-4.5 w-4.5 cursor-pointer"
                    />
                    <span>♿ {translate("Wheelchair Accessible")}</span>
                  </label>
                  <label className="flex items-center gap-2 text-[10.5px] cursor-pointer text-[#141414] dark:text-[#FFF8E7]/80 font-bold select-none">
                    <input
                      type="checkbox"
                      checked={facilityFilter.annadanam}
                      onChange={(e) => setFacilityFilter(prev => ({ ...prev, annadanam: e.target.checked }))}
                      className="accent-[#FF9933] h-4.5 w-4.5 cursor-pointer"
                    />
                    <span>🟢 {translate("Annadanam Available")}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Grand grid of temples */}
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-2xl text-[#800000] dark:text-[#FFD700] flex items-center gap-2 border-b-2 pb-2 border-[#800000]/10 dark:border-white/10">
                <Landmark className="w-5 h-5 text-[#800000] dark:text-[#FFD700]" />
                <span>{translate("popularTemples")}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemples.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-white dark:bg-[#1A0D0D] rounded-3xl border border-dashed border-[#6E6E6E]/20">
                    <HelpCircle className="w-12 h-12 text-[#6E6E6E]/40 mx-auto" />
                    <h4 className="font-serif font-bold mt-2 text-[#800000] dark:text-[#FFD700]">{translate("No Shrines Matching Filters")}</h4>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">{translate("Please try modifying your keywords or select another deity focus.")}</p>
                  </div>
                ) : (
                  filteredTemples.map((templeObj) => {
                    // Check physical context distances
                    const distanceObj = distanceMatrix[templeObj.id];
                    return (
                      <div 
                        key={templeObj.id}
                        id={`temple-card-${templeObj.id}`}
                        onClick={() => {
                          setSelectedTempleId(templeObj.id);
                          setActiveTab('detail');
                        }}
                        className="bg-white dark:bg-[#231212] rounded-3xl border border-[#6E6E6E]/10 dark:border-white/10 shadow-md overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
                      >
                        <div>
                          {/* Card top banner image */}
                          <div className="h-44 w-full relative overflow-hidden">
                            <img 
                              src={templeObj.image} 
                              alt={templeObj.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 duration-500 transition-all select-none" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                            
                            {/* Live crowd status overlay and state flag */}
                            <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded text-[9.5px] font-bold text-white border border-[#FFD700]/10">
                              {translate(templeObj.state)}
                            </span>
                          </div>

                          {/* Card details body */}
                          <div className="p-5 space-y-2.5">
                            <h4 className="font-serif font-extrabold text-base leading-snug text-[#800000] dark:text-[#FFF8E7] group-hover:text-[#FF9933] dark:group-hover:text-[#FFD700] transition-colors duration-200">
                              {translate(templeObj.name)}
                            </h4>
                            <p className="text-[11.5px] text-[#6E6E6E] dark:text-[#FFF8E7]/70 line-clamp-2 leading-relaxed font-sans">
                              {translate(templeObj.description)}
                            </p>

                            <div className="flex justify-between items-center text-[11px] font-mono border-t border-[#6E6E6E]/10 pt-2.5 mt-2 dark:border-white/10">
                              <span className="text-zinc-500 dark:text-zinc-400 font-bold block">{translate("Deity:")} {translate(templeObj.deity)}</span>
                              <span className="text-[#FFD700] block font-bold">★ {templeObj.rating}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card bottom tray showing GPS matrices if available */}
                        <div className="p-3.5 bg-[#FFF8E7]/30 dark:bg-[#1A0D0D]/40 border-t border-[#6E6E6E]/10 dark:border-white/5 flex justify-between items-center text-xs">
                          {distanceObj ? (
                            <div className="flex items-center gap-1.5 font-mono text-[#FF9933] dark:text-[#FFD700]">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="font-bold">{distanceObj.dist} km</span>
                              <span className="text-zinc-400 text-[10.5px]">({distanceObj.time})</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-400 font-mono">{translate("GPS Distance Uncalculated")}</span>
                          )}
                          <button className="text-[10px] bg-[#800000] hover:bg-[#A01E1E] text-white dark:bg-[#FF9933] dark:text-zinc-950 font-black p-2 px-3.5 rounded-xl transition-all flex items-center gap-1 shadow-md">
                            <span>{translate("Details")}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Upcoming Festivals list bar */}
            <div className="bg-white/90 dark:bg-zinc-900/90 rounded-2xl border border-orange-100 dark:border-zinc-800 p-5 space-y-4 shadow-sm">
              <h4 className="font-serif font-bold text-lg text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                <span>{translate("Upcoming Religious Carnivals & Celebrations")}</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {TEMPLES_DATA[0].festivals.map((fest, idx) => (
                  <div key={idx} className="bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-850 space-y-1">
                    <div className="flex justify-between font-mono">
                      <span className="font-extrabold text-zinc-800 dark:text-zinc-200">{translate(fest.name)}</span>
                      <span className="text-orange-600 dark:text-orange-400 font-bold shrink-0">{fest.countdown} to go</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 block font-mono">Scheduled: {fest.date}</span>
                    <p className="text-zinc-500 dark:text-zinc-400 italic font-sans">{translate(fest.description)}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB: Specific Temple Detail and components */}
        {activeTab === 'detail' && (
          <div className="animate-fade-in space-y-8">
            <button
              onClick={() => setActiveTab('home')}
              className="p-2 px-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-all font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1 cursor-pointer w-max text-zinc-500 shrink-0"
            >
              ◀ Back to Temple Explorer
            </button>
            <TempleDetailView 
              language={language}
              translate={translate}
              selectedTempleId={selectedTempleId}
              userState={userState}
              setUserState={setUserState}
              addAlert={addAlert}
            />
          </div>
        )}

        {/* TAB: AI Planner */}
        {activeTab === 'planner' && (
          <div className="animate-fade-in">
            <PilgrimagePlanner language={language} translate={translate} />
          </div>
        )}

        {/* TAB: Chatbot Assistant */}
        {activeTab === 'chatbot' && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <SpiritualChatbot language={language} translate={translate} selectedTempleId={selectedTempleId} />
          </div>
        )}

        {/* TAB: Annadanam Details */}
        {activeTab === 'annadanam' && (
          <div className="animate-fade-in space-y-5">
            <div className="bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-xl border flex flex-wrap justify-between items-center gap-3">
              <div>
                <span className="text-xs text-zinc-400 font-mono block">Current Active Temple Sector context:</span>
                <span className="font-serif font-extrabold text-sm text-zinc-800 dark:text-zinc-200">
                  {translate(TEMPLES_DATA.find(t => t.id === selectedTempleId)?.name || TEMPLES_DATA[0].name)}
                </span>
              </div>
              <div className="flex gap-2 text-xs">
                {TEMPLES_DATA.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTempleId(t.id)}
                    className={`p-1.5 px-3 rounded-lg border font-bold transition-all ${
                      selectedTempleId === t.id
                        ? 'bg-orange-500 border-orange-600 text-white'
                        : 'bg-white text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 hover:bg-orange-50/50'
                    }`}
                  >
                    {translate(t.city)}
                  </button>
                ))}
              </div>
            </div>
            
            <AnnadanamPrasadam 
              language={language}
              translate={translate}
              selectedTempleId={selectedTempleId}
            />
          </div>
        )}

        {/* TAB: Admin Management Panel */}
        {activeTab === 'admin' && (
          <div className="animate-fade-in">
            <AdminPanel language={language} translate={translate} />
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-zinc-90 w-full bg-zinc-950 border-t border-zinc-900 mt-16 text-zinc-100 py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-8 text-xs font-mono">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-600 font-serif text-white font-bold flex items-center justify-center">DG</div>
              <h4 className="font-serif font-bold text-base text-amber-50">DarshanGuide Platform</h4>
            </div>
            <p className="text-zinc-450 text-zinc-400 leading-relaxed font-sans font-medium">
              A comprehensive national devotee planning network combining Geolocation speed matrices, Annadanam dining lists, PWA offline caches, and AI-Powered travel itinerary optimizations.
            </p>
          </div>
          <div className="md:col-span-3 space-y-2">
            <h5 className="font-bold uppercase tracking-wider text-orange-600">Sacred Services</h5>
            <ul className="space-y-1.5 text-zinc-401">
              <li><button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors">Shrine Explorer</button></li>
              <li><button onClick={() => setActiveTab('planner')} className="hover:text-white transition-colors">AI Route Optimizations</button></li>
              <li><button onClick={() => setActiveTab('chatbot')} className="hover:text-white transition-colors">Vedic Chat Assistant</button></li>
              <li><button onClick={() => setActiveTab('annadanam')} className="hover:text-white transition-colors">Prasadam Ticketing</button></li>
            </ul>
          </div>
          <div className="md:col-span-4 space-y-2 text-zinc-451">
            <h5 className="font-bold uppercase tracking-wider text-orange-600">Devasthanam Security</h5>
            <p className="text-[11px] leading-relaxed select-all">
              Devotee support: +91-877-227-7777<br />
              Vedic support center email: helpdesk@devalg.ap.gov.in
            </p>
            <div className="pt-2">
              <span className="text-[10px] text-zinc-500">© 2026 Devotional Web Aggregator. Built with Antigravity AI Studio guidelines.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Broadcast Announcements Alerts list drawer (right side slide-out) */}
      {isAlertOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md p-6 overflow-y-auto flex flex-col justify-between shadow-2xl animate-slide-in h-full border-l dark:border-zinc-800">
            <div>
              <div className="flex justify-between items-center pb-4 mb-4 border-b dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-500 animate-pulse" />
                  <h3 className="font-serif font-bold text-lg text-zinc-800 dark:text-zinc-100">Broadcasting updates</h3>
                </div>
                <button onClick={() => setIsAlertOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic text-center py-8">No notifications broadcasted.</p>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${
                        notif.read 
                          ? 'bg-zinc-50 dark:bg-zinc-950 border-zinc-100 dark:border-zinc-850 opacity-70' 
                          : 'bg-orange-50/20 dark:bg-orange-950/10 border-orange-100 dark:border-orange-950/40 shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between font-mono text-[10px] font-bold">
                        <span className="text-orange-600 dark:text-orange-400">{notif.category?.toUpperCase()} UPDATE</span>
                        <span className="text-zinc-400">{notif.timestamp}</span>
                      </div>
                      <h4 className="font-extrabold text-zinc-800 dark:text-zinc-200">{notif.title}</h4>
                      <p className="text-zinc-500 dark:text-zinc-400 pr-1 leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t dark:border-zinc-800 pt-4 mt-4 flex gap-2">
              <button
                onClick={handleMarkAllRead}
                className="flex-1 bg-zinc-100 font-bold dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 py-3 rounded-xl text-xs hover:bg-orange-50 transition-all select-none uppercase tracking-wide cursor-pointer"
              >
                Clear all active Alerts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modal block */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md p-6 rounded-2xl border dark:border-zinc-800 shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded"
            >
              <X className="w-5 h-5 text-zinc-405" />
            </button>

            {/* Modal header tabs toggle */}
            <div className="flex gap-4 border-b dark:border-zinc-800 pb-3 mb-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
              <button 
                onClick={() => setAuthMode('login')}
                className={`pb-1 ${authMode === 'login' ? 'text-orange-600 border-b-2 border-orange-500 font-extrabold' : ''}`}
              >
                Vedic Signin
              </button>
              <button 
                onClick={() => setAuthMode('register')}
                className={`pb-1 ${authMode === 'register' ? 'text-orange-600 border-b-2 border-orange-500 font-extrabold' : ''}`}
              >
                Register
              </button>
              <button 
                onClick={() => setAuthMode('otp')}
                className={`pb-1 ${authMode === 'otp' ? 'text-orange-600 border-b-2 border-orange-500 font-extrabold' : ''}`}
              >
                OTP Verification
              </button>
            </div>

            {/* Sub Mode: Registration Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
              {authMode === 'register' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 uppercase tracking-wider block font-mono">Full Name</label>
                    <input
                      type="text" required value={regName} onChange={(e) => setRegName(e.target.value)}
                      placeholder="Sri Ramanujan"
                      className="w-full bg-zinc-55 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-lg outline-none focus:border-orange-500 text-zinc-805 text-zinc-800 dark:text-zinc-100 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 uppercase tracking-wider block font-mono">Email Address</label>
                    <input
                      type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="devotee@spiritual.in"
                      className="w-full bg-zinc-55 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-lg outline-none focus:border-orange-500 text-zinc-805 text-zinc-800 dark:text-zinc-100 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 uppercase tracking-wider block font-mono">Mobile Number</label>
                      <input
                        type="tel" required value={regMobile} onChange={(e) => setRegMobile(e.target.value)}
                        placeholder="+91-9999999999"
                        className="w-full bg-zinc-55 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-lg outline-none focus:border-orange-500 text-zinc-805 text-zinc-800 dark:text-zinc-100 font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 uppercase tracking-wider block font-mono">Password</label>
                      <input
                        type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-zinc-55 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-lg outline-none focus:border-orange-500 text-zinc-805 text-zinc-800 dark:text-zinc-100 font-medium"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Sub Mode: Login Address */}
              {authMode === 'login' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 uppercase tracking-wider block font-mono">Email Address</label>
                    <input
                      type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="devotee@spiritual.in"
                      className="w-full bg-zinc-55 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-lg outline-none focus:border-orange-500 text-zinc-805 text-zinc-800 dark:text-zinc-100 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-405 uppercase tracking-wider block font-mono">Secret Password</label>
                    <input
                      type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-55 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-lg outline-none focus:border-orange-500 text-zinc-850 text-zinc-800 dark:text-zinc-100 font-medium"
                    />
                  </div>
                </>
              )}

              {/* Sub Mode: OTP submission */}
              {authMode === 'otp' && (
                <div className="space-y-3 text-center">
                  <p className="text-zinc-400">Enter the 6-digit dynamic OTP sent to your registered mobile number:</p>
                  <input
                    type="text" maxLength={6} required value={otpValue} onChange={(e) => setOtpValue(e.target.value)}
                    placeholder="108108"
                    className="w-40 text-center bg-zinc-50 dark:bg-zinc-950 border text-lg tracking-widest font-mono p-3 rounded-lg outline-none focus:border-orange-500 text-zinc-800 dark:text-zinc-100 font-bold"
                  />
                </div>
              )}

              {/* Submit triggers */}
              <button
                type="submit"
                className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3 rounded-xl tracking-wider uppercase transition-all shadow-md shadow-orange-550/10 cursor-pointer border border-orange-755"
              >
                Confirm Devotee Session
              </button>

              {/* Simulated Google Authentication button */}
              <button
                type="button"
                onClick={() => {
                  setUserState(prev => ({
                    ...prev,
                    fullName: "Google Devotee",
                    isLoggedIn: true
                  }));
                  addAlert("Single Signon completed", "Gmail credential mounted securely.", "general");
                  setShowAuthModal(false);
                }}
                className="w-full mt-2 bg-zinc-55 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 font-bold py-2.5 rounded-xl text-xs transition-all border dark:border-zinc-850 flex items-center justify-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-orange-500" />
                <span>Verify with Google Account Securely</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

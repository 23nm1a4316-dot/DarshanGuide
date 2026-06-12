import React, { useState, useEffect } from 'react';
import { Temple, UserReview, AppNotification } from '../types';
import { TEMPLES_DATA } from '../data';
import { 
  Heart, Star, Clock, User, Check, AlertTriangle, ShieldCheck, MapPin, 
  Tv, Compass, CloudSun, Calendar, MessageSquare, Plus, Bell, ChevronDown, Camera,
  Utensils, Hotel, ArrowRight, CornerRightDown, Map, CheckCircle2, Navigation
} from 'lucide-react';

interface TempleDetailViewProps {
  language: string;
  translate: (key: string) => string;
  selectedTempleId: string;
  userState: any;
  setUserState: React.Dispatch<React.SetStateAction<any>>;
  addAlert: (title: string, message: string, category: any) => void;
}

export default function TempleDetailView({ 
  language, 
  translate, 
  selectedTempleId, 
  userState, 
  setUserState,
  addAlert
}: TempleDetailViewProps) {
  
  // Retrieve the selected temple object
  const temple = TEMPLES_DATA.find(t => t.id === selectedTempleId) || TEMPLES_DATA[0];

  const [activeTab, setActiveTab] = useState<'info' | 'schedule' | 'reviews' | 'services'>('info');
  const [activeCam, setActiveCam] = useState<'garbha' | 'gopuram' | 'hall'>('garbha');
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const [cameraPan, setCameraPan] = useState(0);
  const [cameraTilt, setCameraTilt] = useState(0);

  // Load reviews on mount or temple change
  useEffect(() => {
    fetchReviews();
    setIsSaved(userState.savedTemples.includes(temple.id));
  }, [temple.id, userState.savedTemples]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews/${temple.id}`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveToggle = () => {
    if (isSaved) {
      setUserState((prev: any) => ({
        ...prev,
        savedTemples: prev.savedTemples.filter((id: string) => id !== temple.id)
      }));
      addAlert("Saved Shrines Updated", `${temple.name} removed from your quick wishlist.`, "general");
    } else {
      setUserState((prev: any) => ({
        ...prev,
        savedTemples: [...prev.savedTemples, temple.id]
      }));
      addAlert("Shrine Saved", `🟢 ${temple.name} successfully bookmarked key travel guidelines.`, "general");
    }
    setIsSaved(!isSaved);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templeId: temple.id,
          userName: userState.fullName || "Girish Kumar (Devotee)",
          rating: newReviewRating,
          text: newReviewText
        })
      });
      const data = await res.json();
      setReviews(prev => [data, ...prev]);
      setNewReviewText('');
      setNewReviewRating(5);
      addAlert("Review Submitted", "Thank you for sharing your spiritual darshan experience!", "general");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAlertSubscription = (category: string) => {
    addAlert(
      `Alert Subscribed`, 
      `You've registered for ${temple.name}'s real-time ${category} notifications.`,
      category as any
    );
  };

  return (
    <div className="bg-white/90 dark:bg-zinc-900/90 rounded-2xl border border-orange-100 dark:border-zinc-800 shadow-xl overflow-hidden">
      {/* Top Hero image section with Title Overlay */}
      <div className="relative h-96 w-full select-none">
        <img 
          src={temple.image} 
          alt={temple.name} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover brightness-[0.7] transition-all duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        
        {/* Header content overlay */}
        <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs bg-orange-600/90 font-extrabold uppercase tracking-widest px-2.5 py-1 rounded shadow-sm border border-orange-500/30">
                {translate(temple.architecture)}
              </span>
              <span className="text-xs bg-black/40 backdrop-blur-md font-bold font-mono px-2.5 py-1 rounded">
                Est: {temple.established}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-serif font-extrabold tracking-wide drop-shadow text-amber-50 leading-tight">
              {translate(temple.name)}
            </h1>
            
            <p className="text-xs text-orange-200 font-medium italic">
              {translate(temple.originalName)} • Main Deity: <b className="text-white not-italic">{translate(temple.deity)}</b>
            </p>

            <div className="flex items-center gap-4 text-xs text-zinc-350 pt-2 font-mono">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-orange-400" /> {translate(temple.city)}, {translate(temple.state)}</span>
              <span className="flex items-center gap-1 text-yellow-400"><Star className="w-3.5 h-3.5 fill-yellow-400" /> {temple.rating} / 5</span>
            </div>
          </div>

          {/* Quick buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSaveToggle}
              className={`p-3 rounded-xl backdrop-blur-md border transition-all active:scale-95 flex items-center justify-center gap-2 font-semibold text-xs cursor-pointer ${
                isSaved 
                  ? 'bg-rose-600 border-rose-700 text-white shadow-lg shadow-rose-600/10' 
                  : 'bg-white/10 hover:bg-white/20 border-white/25 text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
              <span>{isSaved ? 'Bookmarked' : 'Save To Wishlist'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid segments: Details on left, Live Cam/Info pane on right */}
      <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Side: Dynamic tabs panel */}
        <div className="xl:col-span-8 space-y-6">
          <div className="flex border-b border-zinc-150 dark:border-zinc-800 pb-0.5 overflow-x-auto gap-4">
            {[
              { id: 'info', label: translate("historyTitle") },
              { id: 'schedule', label: translate("dailyTimeline") },
              { id: 'reviews', label: translate("reviews") },
              { id: 'services', label: translate("nearbyServicesLabel") }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 text-sm font-bold border-b-2 transition-all relative cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-extrabold'
                    : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Detailed General Information */}
          {activeTab === 'info' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-lg text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-orange-500 animate-spin-slow" />
                  <span>{translate("Mysteries & Sacred Chronicles")}</span>
                </h3>
                <p className="text-zinc-650 dark:text-zinc-350 text-sm leading-relaxed">
                  {translate(temple.description)}
                </p>
                <div className="bg-orange-50/20 dark:bg-zinc-950 p-4 rounded-xl border border-orange-100/30 text-xs text-zinc-600 dark:text-zinc-400 font-serif leading-relaxed italic border-l-4 border-l-orange-500">
                  <h5 className="font-bold font-sans not-italic text-amber-850 dark:text-orange-300 text-xs uppercase tracking-wider mb-1">{translate("Established Legends & Heritage:")}</h5>
                  {translate(temple.history)}
                </div>
              </div>

              {/* Dress Code restrictions banner */}
              <div className="bg-amber-50/30 dark:bg-zinc-950/20 rounded-xl border border-orange-100/50 dark:border-zinc-800 p-5 space-y-4">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-500 uppercase tracking-widest flex items-center gap-1.5 border-b pb-2 border-orange-100 dark:border-zinc-800">
                  <ShieldCheck className="w-4 h-4 text-orange-500 animate-pulse" />
                  <span>{translate("dressCodeTitle")}</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-850">
                    <span className="font-extrabold text-zinc-800 dark:text-zinc-300 block mb-1">🧍‍♂️ Male Dress Code:</span>
                    <p className="text-zinc-500 dark:text-zinc-400 tracking-wide leading-relaxed">{temple.dressCode.men}</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-850">
                    <span className="font-extrabold text-zinc-800 dark:text-zinc-300 block mb-1">🧍‍♀️ Female Dress Code:</span>
                    <p className="text-zinc-500 dark:text-zinc-400 tracking-wide leading-relaxed">{temple.dressCode.women}</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center text-[10.5px] bg-red-50 dark:bg-red-950/10 text-red-800 dark:text-red-400 p-2.5 rounded-lg border border-red-100 dark:border-red-950/20">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span><b>Strictly Restricted:</b> {temple.dressCode.restricted}</span>
                </div>
              </div>

              {/* Facilities grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{translate("facilitiesTitle")}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: 'parking', label: 'Secure Parking' },
                    { key: 'restrooms', label: 'Satvik Restrooms' },
                    { key: 'water', label: 'Mineral Water' },
                    { key: 'wheelchair', label: 'Wheelchair Access' },
                    { key: 'lockers', label: 'Safety Lockers' },
                    { key: 'accommodation', label: 'Trust Lodging' },
                    { key: 'medical', label: 'First Aid Medical' }
                  ].map((fac) => {
                    const exists = (temple.facilities as any)[fac.key];
                    return (
                      <div 
                        key={fac.key} 
                        className={`p-3 rounded-xl text-center border transition-all text-xs flex flex-col justify-center items-center gap-1.5 ${
                          exists 
                            ? 'bg-emerald-50/20 border-emerald-100 dark:bg-emerald-950/5 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300' 
                            : 'bg-zinc-50 border-zinc-150 text-zinc-400 dark:bg-zinc-950 dark:border-zinc-900 line-through'
                        }`}
                      >
                        <Check className={`w-4 h-4 ${exists ? 'text-emerald-500 font-bold' : 'text-zinc-300'}`} />
                        <span className="font-semibold">{fac.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Daily schedule timeline */}
          {activeTab === 'schedule' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-xl border flex justify-between items-center text-xs">
                <div>
                  <span className="font-extrabold text-zinc-700 dark:text-zinc-300 block">General Darshan timings</span>
                  <span className="text-zinc-400 block mt-0.5">Morning & Evening batches</span>
                </div>
                <div className="text-right font-mono text-zinc-650 dark:text-orange-400 font-bold">
                  <div>{temple.timings.morningDarshan}</div>
                  <div>{temple.timings.eveningDarshan}</div>
                </div>
              </div>

              <div className="relative pl-6 border-l border-orange-200 dark:border-zinc-800 space-y-5 pb-4">
                {temple.timeline.map((event, i) => (
                  <div key={i} className="relative text-xs">
                    {/* Event item indicator bullet */}
                    <span className={`absolute -left-[30px] top-1 w-4 h-4 rounded-full flex items-center justify-center border ${
                      event.type === 'seva' 
                        ? 'bg-amber-600 text-white border-amber-700 font-bold' 
                        : event.type === 'food' 
                          ? 'bg-emerald-600 text-white border-emerald-700 font-bold' 
                          : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    </span>
                    
                    <div className="flex justify-between font-mono">
                      <span className="text-zinc-405 font-bold text-orange-550 dark:text-orange-400">{event.time}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded">
                        {event.type}
                      </span>
                    </div>
                    <p className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200 mt-0.5">{event.event}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Detailed Reviews section */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-serif font-bold text-lg text-zinc-800 dark:text-zinc-100">
                Pilgrim Spiritual Experiences
              </h3>

              {/* Submit Review form */}
              <form onSubmit={handleSubmitReview} className="bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-850 space-y-4">
                <h4 className="text-xs font-bold text-zinc-650 dark:text-zinc-350 uppercase tracking-wider block">Write your experience</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Your Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className="p-0.5 text-yellow-400 hover:scale-110 transition-all outline-none"
                      >
                        <Star className={`w-4 h-4 ${newReviewRating >= star ? 'fill-yellow-450 fill-yellow-400' : 'text-zinc-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <textarea
                    required
                    rows={3}
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Describe queue situations, food quality, dress verification or general tranquility..."
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg text-xs outline-none focus:border-orange-500 text-zinc-800 dark:text-zinc-100 leading-relaxed font-sans"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingReview || !newReviewText.trim()}
                    className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg cursor-pointer transition-all active:scale-95 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-450 shadow-sm"
                  >
                    Post Pilgrim Comment
                  </button>
                </div>
              </form>

              {/* Review listing */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {reviews.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic text-center py-6">No pilgrim comments post yet. Be the first!</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-xl shadow-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange-100 border dark:bg-zinc-850 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">{rev.userName}</span>
                            <span className="text-[10px] text-zinc-400 block font-mono">{rev.date}</span>
                          </div>
                        </div>
                        <div className="flex gap-0.5 text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-yellow-400' : 'text-zinc-200 dark:text-zinc-800'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-650 dark:text-zinc-350 leading-relaxed font-sans">
                        {rev.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Nearby essential services */}
          {activeTab === 'services' && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="font-serif font-bold text-lg text-zinc-800 dark:text-zinc-100">
                Essential services near temple perimeter
              </h3>
              <p className="text-zinc-400 text-xs">
                Highly verified vegetarian rest spots, trust hotels, trauma hospitals, and ATMs near the main entrance gates.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {temple.nearbyServices.map((srv, i) => (
                  <div key={i} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 flex justify-between items-center shadow-xs">
                    <div className="space-y-1">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        srv.type === 'Hotel' || srv.type === 'Restaurant'
                          ? 'bg-orange-100/35 text-orange-800 dark:bg-zinc-800 dark:text-orange-400'
                          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400'
                      }`}>
                        {srv.type}
                      </span>
                      <h4 className="font-bold text-sm text-zinc-850 dark:text-zinc-200 pt-1 leading-tight">{srv.name}</h4>
                      <p className="text-[10.5px] text-zinc-400">{srv.address}</p>
                    </div>
                    
                    <div className="text-right font-mono shrink-0">
                      <span className="text-xs font-bold text-orange-600 dark:text-orange-400 block">{srv.distance}</span>
                      <span className="text-[10px] text-yellow-400 block pt-0.5">★ {srv.rating}</span>
                      <button 
                        onClick={() => window.open(`https://maps.google.com/?q=${srv.name}`, '_blank')}
                        className="mt-2 text-[10px] bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-orange-400 font-bold p-1 px-2.5 rounded transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Navigation className="w-3 h-3 text-orange-500" />
                        <span>Go GMap</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side Pane: Camera feed widget & Weather, Alerts */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Virtual Live feeding module */}
          <div className="bg-zinc-950 text-zinc-100 rounded-xl p-4 space-y-4 border border-zinc-800 shadow-lg relative">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-orange-500 animate-pulse" />
                <span className="text-xs font-bold text-zinc-300 font-mono">LIVE FEED</span>
              </div>
              <span className="text-[9px] bg-red-650 bg-red-600 text-white font-bold px-2 py-0.5 rounded animate-pulse font-mono tracking-widest">
                ● BROADCAST ACTIVE
              </span>
            </div>

            {/* Virtual Video Feed viewport */}
            <div className="bg-zinc-900 border border-zinc-850 rounded-lg h-44 overflow-hidden relative flex flex-col items-center justify-center select-none group">
              <Tv className="w-12 h-12 text-zinc-850 text-zinc-700 scale-100 group-hover:scale-110 transition-all [animation-delay:0.2s] duration-300" />
              <div className="absolute top-2 left-2 text-[10px] bg-black/70 backdrop-blur px-2 py-0.5 rounded flex items-center gap-1.5 border border-zinc-800">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span className="font-mono text-zinc-300 uppercase">CAMERA: {activeCam.toUpperCase()}</span>
              </div>

              {/* Dynamic pan/tilt simulator indicators on layout screen */}
              <div className="absolute bottom-2 left-2 text-[9px] text-zinc-400 font-mono">
                Pan: {cameraPan}° | Tilt: {cameraTilt}°
              </div>

              {/* Virtual background visual representation simulated */}
              <div className="absolute inset-0 bg-orange-950/5 pointer-events-none"></div>
              <div className="text-center p-3 z-10">
                <span className="text-xs font-serif font-semibold text-zinc-300 drop-shadow">
                  {activeCam === 'garbha' ? `Virtual Altar of ${temple.deity}` : activeCam === 'gopuram' ? `East Gopuram Entrance Stream` : `Langar Assembly Corridor`}
                </span>
                <p className="text-[9.5px] text-zinc-500 mt-1">Camera panning enabled via controls. Refresh rate 1s.</p>
              </div>
            </div>

            {/* Video Controls / Switches */}
            <div className="space-y-3">
              <div className="flex gap-2">
                {[
                  { id: 'garbha', label: 'Main Sanctum' },
                  { id: 'gopuram', label: 'East Gopuram' },
                  { id: 'hall', label: 'Langar Hall' }
                ].map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => setActiveCam(cam.id as any)}
                    className={`flex-1 text-[10px] py-1.5 rounded font-bold border transition-all active:scale-95 uppercase tracking-wider ${
                      activeCam === cam.id
                        ? 'bg-orange-500 border-orange-600 text-white shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cam.label}
                  </button>
                ))}
              </div>

              {/* Pan Tilt tactile buttons */}
              <div className="bg-zinc-900/60 p-2 border border-zinc-850/50 rounded-lg flex items-center justify-around gap-2 text-[10px] font-mono">
                <button 
                  onClick={() => setCameraPan(prev => Math.max(-90, prev - 15))}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300 font-bold active:scale-95 border border-zinc-700"
                >
                  ◀ PAN L
                </button>
                <span className="text-zinc-500 font-bold">PTZ CAMERA</span>
                <button 
                  onClick={() => setCameraPan(prev => Math.min(90, prev + 15))}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300 font-bold active:scale-95 border border-zinc-700"
                >
                  PAN R ▶
                </button>
              </div>
            </div>
          </div>

          {/* Core Weather tracker */}
          <div className="bg-white/90 dark:bg-zinc-900/90 rounded-xl p-5 border border-orange-150/40 dark:border-zinc-800 shadow-md space-y-4">
            <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b pb-2 dark:border-zinc-800">
              <CloudSun className="w-4 h-4 text-orange-500" />
              <span>{translate("weatherTitle")}</span>
            </h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-2xl font-black text-zinc-800 dark:text-zinc-200 font-mono">
                  {temple.weather.temp}°C
                </span>
                <span className="bg-orange-50 dark:bg-zinc-800 text-orange-700 dark:text-orange-400 text-[10.5px] font-bold px-2 py-0.5 rounded block w-max uppercase">
                  {temple.weather.text}
                </span>
              </div>
              <CloudSun className="w-12 h-12 text-amber-500 animate-pulse [animation-duration:4s]" />
            </div>

            <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans mt-2">
              <p className="font-semibold block text-zinc-750 text-zinc-700 dark:text-zinc-300">Climate Brief:</p>
              {temple.weather.forecast}
            </div>

            {temple.weather.warning && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/15 border border-rose-100 dark:border-rose-950/20 text-[11px] text-rose-800 dark:text-rose-400 rounded-lg flex items-start gap-2 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span><b>Pilgrim Health Guide:</b> {temple.weather.warning}</span>
              </div>
            )}
          </div>

          {/* Crowds Meter Widget */}
          <div className="bg-white/95 dark:bg-zinc-900/95 rounded-xl p-5 border border-orange-100 dark:border-zinc-800 shadow-md space-y-4">
            <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b pb-2 dark:border-zinc-800">
              <MessageSquare className="w-4 h-4 text-orange-500 animate-pulse" />
              <span>{translate("crowdPrediction")}</span>
            </h4>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400 font-mono block">Real-time Congestion</span>
                <span className={`text-sm font-extrabold block mt-0.5 ${
                  temple.crowdLevel === 'High' ? 'text-red-500' : temple.crowdLevel === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  {temple.crowdLevel === 'High' ? translate("highCrowd") : temple.crowdLevel === 'Medium' ? translate("mediumCrowd") : translate("lowCrowd")}
                </span>
              </div>
              <div className="h-2 w-28 bg-zinc-155 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${
                  temple.crowdLevel === 'High' ? 'w-[90%] bg-red-500' : temple.crowdLevel === 'Medium' ? 'w-[60%] bg-amber-500' : 'w-[25%] bg-emerald-500'
                }`}></div>
              </div>
            </div>

            {/* Display list of crowd trends over hourly blocks */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase block font-mono">Today's Congestion Trend:</span>
              <div className="space-y-1.5 text-xs font-mono">
                {temple.crowdTrend.map((trend, tidx) => (
                  <div key={tidx} className="flex justify-between items-center">
                    <span className="text-zinc-450 dark:text-zinc-500">{trend.hour}</span>
                    <div className="w-24 h-1.5 bg-zinc-155 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0 mx-2">
                      <div className="h-full bg-orange-500" style={{ width: `${trend.count}%` }}></div>
                    </div>
                    <span className="text-[10.5px] text-zinc-650 dark:text-zinc-400 truncate max-w-[120px]">{trend.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Festivals Block with notifications register */}
          <div className="bg-white/90 dark:bg-zinc-900/90 rounded-xl p-5 border border-orange-100 dark:border-zinc-800 shadow-md space-y-4">
            <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b pb-2 dark:border-zinc-800">
              <Calendar className="w-4 h-4 text-orange-500 animate-pulse" />
              <span>{translate("upcomingFestivals")}</span>
            </h4>

            <div className="space-y-4 max-h-[190px] overflow-y-auto pr-1">
              {temple.festivals.map((fest, idx) => (
                <div key={idx} className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-850 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200">{fest.name}</span>
                    <span className="text-[10.5px] text-orange-600 dark:text-orange-400 font-mono shrink-0">{fest.countdown} to go</span>
                  </div>
                  <p className="text-[10.5px] text-zinc-450 text-zinc-400 leading-relaxed font-sans">{fest.description}</p>
                  
                  <button 
                    onClick={() => handleAlertSubscription(fest.name)}
                    className="text-[9px] bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-1 px-2.5 rounded transition-all active:scale-95 flex items-center gap-1 mt-2.5 ml-auto cursor-pointer"
                  >
                    <Bell className="w-3 h-3 text-yellow-300 animate-pulse" />
                    <span>Watch Reminders</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

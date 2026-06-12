import React, { useState } from 'react';
import { TEMPLES_DATA } from '../data';
import { 
  Lock, LayoutDashboard, Plus, Settings, Sparkles, CheckCircle2, Trash, 
  RefreshCw, TrendingUp, Users, MapPin, Eye, Edit2, ShieldAlert, FileText 
} from 'lucide-react';

interface AdminPanelProps {
  language: string;
  translate: (key: string) => string;
}

export default function AdminPanel({ language, translate }: AdminPanelProps) {
  // Local reactive list of temples for administration
  const [temples, setTemples] = useState(TEMPLES_DATA);
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'temples' | 'food' | 'reviews'>('analytics');
  
  // New temple form states
  const [formName, setFormName] = useState('');
  const [formDeity, setFormDeity] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('Telangana');
  const [formHours, setFormHours] = useState('05:00 AM - 10:00 PM');
  const [formStatus, setFormStatus] = useState<'Available' | 'Limited' | 'Closed'>('Available');
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddTemple = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDeity.trim()) return;

    const newTemple: any = {
      id: formName.toLowerCase().replace(/\s+/g, '-'),
      name: formName,
      originalName: formName + " నిలయం",
      deity: formDeity,
      state: formState,
      city: formCity,
      district: formCity,
      rating: 4.5,
      isPopular: false,
      description: "A newly registered grand temple in the system.",
      history: "Sacred historical records being uploaded by Trust board.",
      established: "Modern Era Reconstruction",
      architecture: "Modern Vedic Stone style",
      image: "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=800&q=80",
      location: { lat: 15.0000, lng: 79.0000 },
      timings: {
        opening: "05:00 AM",
        closing: "10:00 PM",
        morningDarshan: "06:00 AM - 12:00 PM",
        eveningDarshan: "04:30 PM - 09:30 PM",
        specialDarshan: "05:15 AM - 09:00 PM"
      },
      dressCode: {
        men: "Traditional Dhoti or trousers with shoulders completely covered.",
        women: "Traditional Sarees, half sarees, salwar or pants with overlay dupatta.",
        restricted: "Short trousers, ripped items, hats, or metallic luggage inside parameter."
      },
      facilities: {
        parking: true, restrooms: true, water: true, wheelchair: true,
        lockers: false, accommodation: false, medical: true
      },
      food: {
        annadanamStatus: formStatus,
        annadanamTimings: "11:30 AM to 02:30 PM daily",
        breakfast: "No Breakfast",
        lunch: "11:30 AM - 02:30 PM",
        dinner: "Closed",
        capacity: 1000,
        diningHallLocation: "Trust Dining Compound, Ground floor Mada Street",
        prasadamList: [
          { name: "Peda Sweets", type: "Peda", price: 30, free: false, collectionPoint: "Stall Counter A" }
        ]
      },
      contact: { phone: "+91-9999999999", website: "https://temple.gov.in", email: "info@temple.gov.in" },
      timeline: [],
      crowdLevel: 'Low',
      crowdTrend: [{ hour: "08:00 AM", count: 40, text: "Pleasant flow" }],
      weather: { temp: 28, text: "Favorable", forecast: "Mild and sunny guidelines", warning: null },
      festivals: [],
      nearbyServices: [],
      liveStreamUrl: ""
    };

    setTemples(prev => [...prev, newTemple]);
    // Clear forms
    setFormName('');
    setFormDeity('');
    setFormCity('');
    triggerToast(`🟢 ${formName} successfully added to Pilgrim database.`);
  };

  const handleDeleteTemple = (id: string, name: string) => {
    setTemples(prev => prev.filter(t => t.id !== id));
    triggerToast(`🗑️ ${name} removed from registry.`);
  };

  const handleToggleAnnadanam = (id: string) => {
    setTemples(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.food.annadanamStatus === 'Available' 
          ? 'Limited' 
          : t.food.annadanamStatus === 'Limited' ? 'Closed' : 'Available';
        return {
          ...t,
          food: { ...t.food, annadanamStatus: nextStatus }
        };
      }
      return t;
    }));
    triggerToast(`Updated Annadanam level.`);
  };

  return (
    <div className="bg-white/90 dark:bg-zinc-900/90 rounded-2xl border border-orange-100 dark:border-zinc-800 shadow-xl overflow-hidden p-6 my-6">
      
      {/* Title header panel bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-orange-100 dark:border-zinc-800 pb-5 mb-5 gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-zinc-500 font-bold text-xs uppercase tracking-widest font-mono">
            <Lock className="w-3.5 h-3.5 text-orange-500" />
            <span>Devasthanam Security Terminal</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-zinc-800 dark:text-zinc-100 mt-1">
            {translate("adminDashboard")}
          </h2>
          <p className="text-zinc-400 text-xs mt-0.5">
            Internal trust desk to update timings, food slots, edit newly registered shrines and audit growth metrics.
          </p>
        </div>
        
        {/* Quick toast notifications banner inside dashboard */}
        {toastMessage && (
          <div className="bg-orange-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md border border-orange-600 animate-pulse font-mono shrink-0">
            {toastMessage}
          </div>
        )}
      </div>

      {/* Sub tabs hierarchy buttons */}
      <div className="flex border-b border-zinc-100 dark:border-zinc-800 gap-4 mb-6 pb-0.5 overflow-x-auto">
        {[
          { id: 'analytics', label: 'Spiritual Analytics', icon: LayoutDashboard },
          { id: 'temples', label: 'Shrine Registry management', icon: Plus },
          { id: 'food', label: 'Annadanam & Prasad slots', icon: Settings },
          { id: 'reviews', label: 'Experience Moderation', icon: FileText }
        ].map((sub) => {
          const Icon = sub.icon;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id as any)}
              className={`py-2 text-xs font-bold border-b-2 transition-all relative cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeSubTab === sub.id
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-extrabold'
                  : 'border-transparent text-zinc-450 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{sub.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content panel switch */}

      {/* Sub tab 1: Analytics graphs */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Stat 1 */}
            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-850 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono block">Devotee Registrations</span>
                <span className="text-2xl font-black text-zinc-800 dark:text-zinc-100 block mt-1">1,48,250 Pax</span>
                <span className="text-[10px] text-emerald-500 font-semibold block mt-1">▲ +12% this quarter</span>
              </div>
              <Users className="w-10 h-10 text-orange-500/25 dark:text-orange-400/10" />
            </div>
            {/* Stat 2 */}
            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-850 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono block">Average Darshan Waits</span>
                <span className="text-2xl font-black text-zinc-800 dark:text-zinc-100 block mt-1">3.5 Hours</span>
                <span className="text-[10px] text-amber-500 font-semibold block mt-1">● Constant with peak sevas</span>
              </div>
              <TrendingUp className="w-10 h-10 text-orange-500/25 dark:text-orange-400/10" />
            </div>
            {/* Stat 3 */}
            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-850 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono block">Langar Meals Served</span>
                <span className="text-2xl font-black text-zinc-800 dark:text-zinc-100 block mt-1">3,45,000 / daily</span>
                <span className="text-[10px] text-emerald-550 text-emerald-500 font-semibold block mt-1">▲ +8% annual capacity</span>
              </div>
              <CheckCircle2 className="w-10 h-10 text-orange-500/25 dark:text-orange-400/10" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Most Visited bar chart representation */}
            <div className="bg-zinc-50/50 dark:bg-zinc-950/20 p-5 border border-zinc-100 dark:border-zinc-850 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-350 uppercase tracking-widest block font-sans">
                Most Visited Shrines (Visits/Month)
              </h4>
              <div className="space-y-3 font-mono text-[11px]">
                {[
                  { name: "Tirupati Balaji", count: "4.2M", percent: 100, color: "bg-orange-500" },
                  { name: "Kashi Vishwanath", count: "3.5M", percent: 83, color: "bg-amber-600" },
                  { name: "Golden Temple", count: "3.1M", percent: 74, color: "bg-yellow-500" },
                  { name: "Meenakshi Madam", count: "1.8M", percent: 43, color: "bg-orange-650" },
                  { name: "Kedarnath Jyotir", count: "0.8M", percent: 19, color: "bg-rose-500" }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-bold dark:text-zinc-300">
                      <span>{item.name}</span>
                      <span>{item.count}</span>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-850 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Search Trends */}
            <div className="bg-zinc-50/50 dark:bg-zinc-950/20 p-5 border border-zinc-100 dark:border-zinc-850 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-350 uppercase tracking-widest block font-sans">
                AI Assistant Search queries popularity percentage
              </h4>
              <div className="space-y-3 font-mono text-[11px]">
                {[
                  { query: "Dress code rules & restricted garments", share: "35%", percent: 35, color: "bg-orange-650" },
                  { query: "Annadanam hall locations & dining hours", share: "28%", percent: 28, color: "bg-emerald-650" },
                  { query: "Himalayan weather warnings & medical fitness", share: "21%", percent: 21, color: "bg-amber-650" },
                  { query: "Chariot festivals countdowns & special ticks", share: "16%", percent: 16, color: "bg-zinc-650" }
                ].map((trend, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between font-bold dark:text-zinc-350">
                      <span className="truncate max-w-[220px]">{trend.query}</span>
                      <span>{trend.share}</span>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-155 bg-zinc-200 dark:bg-zinc-850 rounded-full overflow-hidden">
                      <div className={`h-full ${trend.color} rounded-full`} style={{ width: `${trend.percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub tab 2: Add dynamic temples */}
      {activeSubTab === 'temples' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start animate-fade-in">
          {/* Add Temple form */}
          <div className="md:col-span-5 bg-zinc-50 dark:bg-zinc-950 p-5 rounded-xl border border-zinc-100 dark:border-zinc-850 space-y-4">
            <h4 className="font-serif font-bold text-sm text-zinc-800 dark:text-zinc-200 tracking-wide">
              Post New Temple To Registry
            </h4>

            <form onSubmit={handleAddTemple} className="space-y-3 text-xs">
              <div className="space-y-0.5">
                <label className="text-zinc-400 block font-mono">Temple Name</label>
                <input
                  type="text" required value={formName} onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Yadadri Sri Lakshmi Narasimha Temple"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded outline-none focus:border-orange-500 text-zinc-805 text-zinc-800 dark:text-zinc-100 font-medium"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-zinc-400 block font-mono">Principal Presiding Deity</label>
                <input
                  type="text" required value={formDeity} onChange={(e) => setFormDeity(e.target.value)}
                  placeholder="Lord Lakshmi Narasimha"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded outline-none focus:border-orange-500 text-zinc-805 text-zinc-800 dark:text-zinc-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-zinc-400 block font-mono">City / Town</label>
                  <input
                    type="text" required value={formCity} onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Yadagirigutta"
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded outline-none focus:border-orange-500 text-zinc-805 text-zinc-800 dark:text-zinc-100 font-medium"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-zinc-400 block font-mono">State</label>
                  <select
                    value={formState} onChange={(e) => setFormState(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded outline-none text-zinc-800 dark:text-zinc-100"
                  >
                    {["Telangana", "Andhra Pradesh", "Karnataka", "Tamil Nadu", "Maharashtra", "Kerala"].map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-zinc-400 block font-mono">Opening hours (General)</label>
                <input
                  type="text" value={formHours} onChange={(e) => setFormHours(e.target.value)}
                  placeholder="05:00 AM - 10:00 PM"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded outline-none focus:border-orange-500 text-zinc-805 text-zinc-800 dark:text-zinc-100 font-medium"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-zinc-400 block font-mono">Annadanam Availability status</label>
                <select
                  value={formStatus} onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded outline-none text-zinc-800 dark:text-zinc-100"
                >
                  <option value="Available">🟢 Active (Continuous)</option>
                  <option value="Limited">🟡 Limited Availability</option>
                  <option value="Closed">🔴 Closed / Holiday</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-2.5 rounded shadow cursor-pointer transition-all uppercase tracking-wide border border-orange-750"
              >
                Insert Shrine to Live database
              </button>
            </form>
          </div>

          {/* List of current administered temples */}
          <div className="md:col-span-7 space-y-3.5">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest block font-mono">Active Registered Shrines ({temples.length})</h4>
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {temples.map((t) => (
                <div key={t.id} className="bg-white dark:bg-zinc-950 p-3 rounded-xl border border-zinc-100 dark:border-zinc-850 flex justify-between items-center text-xs">
                  <div className="flex gap-3 items-center">
                    <img src={t.image} alt="" className="w-12 h-12 object-cover rounded-md shadow-sm shrink-0" />
                    <div>
                      <h5 className="font-extrabold text-zinc-800 dark:text-zinc-200 leading-snug">{t.name}</h5>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">{t.city}, {t.state}</span>
                      <span className="text-[9.5px] font-mono text-orange-600 dark:text-orange-400 block mt-0.5">Deity: {t.deity}</span>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div className="font-mono text-zinc-400 text-[10px] hidden md:block">
                      <span>Wait: 2 hrs</span>
                    </div>
                    <button
                      onClick={() => handleDeleteTemple(t.id, t.name)}
                      className="p-2 border border-rose-100 dark:border-rose-900/40 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all"
                      title="Deregister Temple"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub tab 3: Food inventory toggles */}
      {activeSubTab === 'food' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-orange-50/20 dark:bg-zinc-950 p-4 rounded-xl border border-orange-100/35 mb-2">
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-500 uppercase tracking-widest flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-orange-500" />
              <span>Annadanam Hall capacity & active level override</span>
            </h4>
            <p className="text-zinc-400 text-[11px] mt-1">
              Adjust dynamic availability status during major festivals or crowd peak hours. Devotees will receive instant notifications when status switches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {temples.map((t) => (
              <div key={t.id} className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-850 flex justify-between items-center text-xs">
                <div>
                  <h5 className="font-extrabold text-zinc-800 dark:text-zinc-200">{t.name}</h5>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Hall capacity: {t.food.capacity} Pax/Batch</span>
                  <span className="text-[10px] font-mono text-zinc-400 block">Stall location: {t.food.diningHallLocation}</span>
                </div>

                <div className="text-right space-y-1 shrink-0">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full block text-center ${
                    t.food.annadanamStatus === 'Available'
                      ? 'bg-emerald-100/60 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300'
                      : t.food.annadanamStatus === 'Limited'
                        ? 'bg-amber-100/60 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
                        : 'bg-rose-100/60 text-rose-800 dark:bg-rose-950/20 dark:text-rose-450'
                  }`}>
                    {t.food.annadanamStatus === 'Available' ? '🟢 Active' : t.food.annadanamStatus === 'Limited' ? '🟡 Limited' : '🔴 Closed'}
                  </span>
                  
                  <button
                    onClick={() => handleToggleAnnadanam(t.id)}
                    className="p-1 px-2.5 bg-zinc-50 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 text-zinc-650 dark:text-zinc-300 hover:border-orange-500 rounded text-[9.5px] font-bold font-mono transition-all flex items-center gap-1 active:scale-95 cursor-pointer mt-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Override</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub tab 4: Experience Moderation */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-zinc-55 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-850 flex justify-between items-center whitespace-normal">
            <div>
              <p className="font-extrabold text-xs text-zinc-850 dark:text-zinc-200 leading-snug">Continuous Experience stream checks</p>
              <p className="text-[10.5px] text-zinc-400 mt-0.5">Protect devotional content from inappropriate texts, commercial advertisements or offensive remarks.</p>
            </div>
            <ShieldAlert className="w-6 h-6 text-orange-500 shrink-0 hidden md:block" />
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 text-xs">
            {[
              { id: "mod_01", author: "Ganesh Prasad", text: "Great place, clean rest rooms. Highly recommended.", status: "Pending approval" },
              { id: "mod_02", author: "Sai Kumar", text: "Buy cheap entry passes here at discount coupon code 'DEVAL10'", status: "Flagged spam" },
              { id: "mod_03", author: "Ramanathan T", text: "Suprabhata seva was amazing. Felt absolute tranquility.", status: "Pending approval" }
            ].map((usr) => (
              <div key={usr.id} className="bg-white dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-850 flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200">{usr.author}</span>
                    <span className={`text-[9px] px-1.5 rounded ${
                      usr.status.includes('spam') ? 'bg-red-100 text-red-800 dark:bg-red-950/20' : 'bg-orange-100 text-orange-850 dark:bg-amber-955'
                    }`}>{usr.status}</span>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400">{usr.text}</p>
                </div>

                <div className="flex gap-1 shrink-0">
                  <button 
                    onClick={() => triggerToast(`Experience approved and published.`)}
                    className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px] active:scale-95 transition-all"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => triggerToast(`Experience permanently deleted.`)}
                    className="p-1 px-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-rose-500 hover:text-white text-zinc-600 dark:text-zinc-400 font-bold rounded text-[10px] active:scale-95 transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

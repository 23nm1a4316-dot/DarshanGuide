import React, { useState } from 'react';
import { Sparkles, Calendar, Users, IndianRupee, MapPin, Route, ChevronRight, HelpCircle, Compass, Printer, CheckCircle, Info } from 'lucide-react';
import { TEMPLES_DATA } from '../data';
import { PilgrimPlan } from '../types';

interface PilgrimagePlannerProps {
  language: string;
  translate: (key: string) => string;
}

export default function PilgrimagePlanner({ language, translate }: PilgrimagePlannerProps) {
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(25000);
  const [familySize, setFamilySize] = useState(2);
  const [selectedTemples, setSelectedTemples] = useState<string[]>(["tirupati"]);
  const [preferredDeity, setPreferredDeity] = useState('');
  const [isPlannig, setIsPlanning] = useState(false);
  const [plan, setPlan] = useState<PilgrimPlan | null>(null);

  const toggleTempleSelection = (id: string) => {
    setSelectedTemples(prev => 
      prev.includes(id) 
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
  };

  const handleGeneratePlan = async () => {
    if (selectedTemples.length === 0) return;
    
    setIsPlanning(true);
    setPlan(null);

    try {
      const response = await fetch('/api/gemini/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget,
          days,
          familySize,
          temples: selectedTemples,
          preferredDeities: preferredDeity
        })
      });
      const data = await response.json();
      setPlan(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <div className="bg-white/90 dark:bg-zinc-900/90 rounded-2xl border border-orange-100 dark:border-zinc-800 shadow-xl overflow-hidden p-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-orange-100 dark:border-zinc-800 pb-5 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold text-xs uppercase tracking-widest">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span>AI Divine Algorithm</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-zinc-800 dark:text-zinc-100 mt-1">
            {translate("darshanPlanner")}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Build optimized routes, family cost breakdowns, and hourly itinerary schedules backed by GenAI logic.
          </p>
        </div>
        <div className="w-1.5 h-12 bg-orange-500 rounded-full hidden md:block"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form panel */}
        <div className="lg:col-span-5 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-500" />
              <span>Itinerary Duration (Days)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 5].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                    days === d
                      ? 'bg-orange-500 text-white border-orange-600 shadow-md'
                      : 'bg-zinc-50 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-orange-50/50'
                  }`}
                >
                  {d} {d === 1 ? 'Day' : 'Days'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-orange-500" />
              <span>Devotees count (Family Size)</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 4, 6, 8].map((n) => (
                <button
                  key={n}
                  onClick={() => setFamilySize(n)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                    familySize === n
                      ? 'bg-orange-550 bg-orange-600 text-white border-orange-700'
                      : 'bg-zinc-50 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {n} {n === 1 ? 'Person' : 'Pax'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-orange-500" />
              <span>Total Estimated Pilgrimage Budget</span>
            </label>
            <div className="relative">
              <input
                type="range"
                min="5000"
                max="100000"
                step="5000"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-zinc-400 dark:text-zinc-650 mt-1.5 font-mono">
                <span>₹5,000</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-bold bg-orange-100/50 dark:bg-zinc-800 px-2 py-0.5 rounded">
                  ₹{budget.toLocaleString('en-IN')} INR
                </span>
                <span>₹1,00,000</span>
              </div>
            </div>
          </div>

          {/* Temple multiselect */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span>Select Shrines to Visit</span>
              </span>
              <span className="text-[10px] text-orange-600 lowercase font-mono">
                {selectedTemples.length} selected
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-[170px] overflow-y-auto pr-1">
              {TEMPLES_DATA.map((t) => {
                const active = selectedTemples.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTempleSelection(t.id)}
                    className={`p-2.5 rounded-xl text-left border text-xs transition-all flex flex-col gap-0.5 relative overflow-hidden active:scale-95 ${
                      active
                        ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/20 text-orange-900 dark:text-orange-200 font-medium'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-350 hover:bg-zinc-50'
                    }`}
                  >
                    <span className="font-bold truncate">{t.name}</span>
                    <span className="text-[10px] text-zinc-400 truncate">{t.city}, {t.state}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Preferred Deity Focus (Optional)
            </label>
            <input
              type="text"
              value={preferredDeity}
              onChange={(e) => setPreferredDeity(e.target.value)}
              placeholder="e.g. Shiva, Vaishnavite, Ganga ghats, Himalayan"
              className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs border border-zinc-200 dark:border-zinc-850 py-2 px-3 rounded-lg outline-none focus:border-orange-500 text-zinc-800 dark:text-zinc-100"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGeneratePlan}
            disabled={selectedTemples.length === 0 || isPlannig}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-700 hover:from-orange-600 hover:to-amber-800 transition-all text-white font-bold py-3.5 rounded-xl shadow-lg border border-orange-600 cursor-pointer disabled:from-zinc-100 disabled:to-zinc-200 dark:disabled:from-zinc-800 dark:disabled:to-zinc-800 disabled:text-zinc-400 disabled:border-zinc-200 dark:disabled:border-zinc-750 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-orange-500/10"
          >
            <Sparkles className="w-4 h-4 animate-spin-slow text-yellow-300" />
            <span>{isPlannig ? 'Optimizing Pilgrimage Plan...' : 'Generate AI Pilgrimage Plan'}</span>
          </button>
        </div>

        {/* Results display panel */}
        <div className="lg:col-span-7 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 flex flex-col justify-between min-h-[400px]">
          {isPlannig && (
            <div className="flex-1 flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
              <div className="text-center">
                <h4 className="font-serif font-bold text-lg text-zinc-800 dark:text-zinc-200">Consulting Devotional Route Tables</h4>
                <p className="text-zinc-400 text-xs max-w-sm mt-1">
                  Using Gemini to calculate Vincenty distances, optimize order of worship, estimate local boarding fees, and create family boarding timelines.
                </p>
              </div>
            </div>
          )}

          {!isPlannig && !plan && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-orange-100/50 dark:bg-orange-950/20 rounded-full flex items-center justify-center">
                <Route className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-zinc-700 dark:text-zinc-400">Generate Your Guided Custom Journey</h4>
                <p className="text-zinc-400 text-xs max-w-sm mt-2">
                  Select your targeted temples on the left side, configure duration and budget constraints, and our AI pipeline will spit out a beautiful travel brochure.
                </p>
              </div>
            </div>
          )}

          {!isPlannig && plan && (
            <div className="space-y-6">
              {/* Plan title banner */}
              <div className="bg-gradient-to-r from-orange-550 to-amber-700 bg-orange-650 p-4 rounded-xl text-white shadow-md flex justify-between items-center">
                <div>
                  <span className="text-[9px] uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full font-bold">
                    {plan.isSimulated ? "SIMULATED FLIGHT PLAN" : "LIVE AI AGENT RESPONSE"}
                  </span>
                  <h3 className="font-serif font-bold text-lg mt-1 text-zinc-50">{plan.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-orange-100 mt-2 font-mono">
                    <span>Dist: <b>{plan.totalDistance}</b></span>
                    <span>•</span>
                    <span>Travel Time: <b>{plan.totalDuration}</b></span>
                  </div>
                </div>
                <button
                  onClick={() => window.print()}
                  className="p-2 bg-white/15 hover:bg-white/25 rounded-lg text-white transition-all border border-white/10"
                  title="Print Itinerary"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>

              {/* Day activities slider/itinerary */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b pb-1 dark:border-zinc-800">
                  <Calendar className="w-3.5 h-3.5 text-orange-500" />
                  <span>Activity Schedule Timeline</span>
                </h4>
                
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {plan.itinerary.map((dayPlan, idx) => (
                    <div key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-3.5 rounded-xl space-y-3 shadow-sm">
                      <div className="flex justify-between items-center border-b border-zinc-50 dark:border-zinc-800 pb-1.5">
                        <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400 font-mono">
                          Day {dayPlan.day}
                        </span>
                        <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded font-bold font-mono">
                          Active Seva
                        </span>
                      </div>

                      <div className="space-y-3 pl-2 border-l-2 border-orange-200 dark:border-zinc-800">
                        {dayPlan.activities.map((act, aIdx) => (
                          <div key={aIdx} className="text-xs relative">
                            <span className="absolute -left-[14px] top-1.5 w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                            <div className="flex justify-between font-mono">
                              <span className="text-[11px] text-zinc-400">{act.time}</span>
                              <span className="text-[10px] text-amber-700 bg-amber-50 dark:bg-zinc-800 dark:text-amber-400 px-1 py-0.1 select-none font-bold rounded">
                                {act.locationName}
                              </span>
                            </div>
                            <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{act.activity}</p>
                            {act.notes && (
                              <p className="text-[10px] text-zinc-400 italic mt-0.5">Note: {act.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optimized order layout */}
              <div className="bg-orange-50/30 dark:bg-zinc-900/30 border border-orange-100/30 dark:border-zinc-800/80 p-3.5 rounded-xl">
                <h4 className="text-[11px] font-bold text-amber-800 dark:text-amber-450 uppercase tracking-wider flex items-center gap-1.5 mb-2 font-mono">
                  <Route className="w-3.5 h-3.5" />
                  <span>Optimized Route Sequence</span>
                </h4>
                <div className="flex items-center flex-wrap gap-1.5 text-xs">
                  <span className="px-2 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 font-bold rounded">Start (GPS)</span>
                  {plan.routeOrder.map((step, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <ChevronRight className="w-3 h-3 text-zinc-400" />
                      <span className="px-2.5 py-1 bg-orange-600 text-white font-bold rounded shadow-sm">
                        {TEMPLES_DATA.find(t => t.id === step)?.city || step}
                      </span>
                    </React.Fragment>
                  ))}
                  <ChevronRight className="w-3 h-3 text-zinc-400" />
                  <span className="px-2 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 font-bold rounded">Return</span>
                </div>
              </div>

              {/* Cost breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b pb-1 dark:border-zinc-800">
                  <IndianRupee className="w-3.5 h-3.5 text-orange-500" />
                  <span>Pilgrimage Budget breakdown</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center shadow-sm">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono block">Travel (Cab)</span>
                    <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 block mt-1">₹{plan.costBreakdown.travel.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center shadow-sm">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono block">Rooms</span>
                    <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 block mt-1">₹{plan.costBreakdown.accommodation.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center shadow-sm">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono block">Prasadam (Food)</span>
                    <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 block mt-1">₹{plan.costBreakdown.prasadamFood.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center shadow-sm">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono block">Special Entry</span>
                    <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 block mt-1">₹{plan.costBreakdown.donationTickets.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-100/30 dark:bg-zinc-900 border border-orange-200/40 dark:border-zinc-850 rounded-xl text-xs font-mono font-bold mt-1 text-zinc-800 dark:text-zinc-200">
                  <span>Cumulative Projected Cost:</span>
                  <span className="text-sm text-orange-600 dark:text-orange-400 font-extrabold font-serif">₹{plan.costBreakdown.total.toLocaleString('en-IN')} INR</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

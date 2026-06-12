import React, { useState } from 'react';
import { TEMPLES_DATA } from '../data';
import { Coffee, MapPin, Compass, CheckCircle2, Ticket, Printer, BellRing, Sparkles, Clock, QrCode } from 'lucide-react';
import { Temple, PrasadamItem } from '../types';

interface AnnadanamPrasadamProps {
  language: string;
  translate: (key: string) => string;
  selectedTempleId: string;
}

export default function AnnadanamPrasadam({ language, translate, selectedTempleId }: AnnadanamPrasadamProps) {
  // Find current temple context or fallback to Tirupati
  const temple = TEMPLES_DATA.find(t => t.id === selectedTempleId) || TEMPLES_DATA[0];

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [orderedTicket, setOrderedTicket] = useState<{
    id: string;
    items: Array<{ name: string; quantity: number; cost: number }>;
    total: number;
    devoteeName: string;
    date: string;
    collectionRoom: string;
  } | null>(null);

  const [devoteeName, setDevoteeName] = useState('');
  const [subscribedReminders, setSubscribedReminders] = useState<string[]>([]);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  const handleQtyChange = (name: string, amt: number) => {
    setQuantities(prev => ({
      ...prev,
      [name]: Math.max(0, (prev[name] || 0) + amt)
    }));
  };

  const getOrderStatus = () => {
    return temple.food.annadanamStatus;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500 text-white animate-pulse';
      case 'Limited': return 'bg-amber-500 text-white';
      case 'Closed': return 'bg-rose-500 text-white';
      default: return 'bg-zinc-500 text-white';
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devoteeName.trim()) return;

    const itemsToOrder = temple.food.prasadamList
      .filter(item => (quantities[item.name] || 0) > 0)
      .map(item => ({
        name: item.name,
        quantity: quantities[item.name],
        cost: item.price * quantities[item.name]
      }));

    if (itemsToOrder.length === 0) return;

    const total = itemsToOrder.reduce((acc, curr) => acc + curr.cost, 0);

    setOrderedTicket({
      id: "PRSD-" + Math.floor(1000 + Math.random() * 9000),
      items: itemsToOrder,
      total,
      devoteeName,
      date: new Date().toLocaleDateString(),
      collectionRoom: temple.food.prasadamList[0]?.collectionPoint || "Prasadam Sales Stall"
    });

    // Clear quantities
    setQuantities({});
    setDevoteeName('');
  };

  const handleReminderToggle = (reminderType: string) => {
    if (subscribedReminders.includes(reminderType)) {
      setSubscribedReminders(prev => prev.filter(r => r !== reminderType));
      setNotificationStatus(`Cancelled reminder alert for ${reminderType}.`);
    } else {
      setSubscribedReminders(prev => [...prev, reminderType]);
      setNotificationStatus(`🔔 Reminders configured. We will send an SMS alert 15 mins before ${reminderType}.`);
    }

    setTimeout(() => {
      setNotificationStatus(null);
    }, 4000);
  };

  return (
    <div id="annadanam-and-prasadam-module" className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6">
      {/* Food Status card */}
      <div className="lg:col-span-4 bg-white dark:bg-[#231212] rounded-3xl p-5 border border-[#6E6E6E]/15 dark:border-white/10 shadow-xl space-y-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FFD700] bg-[#800000] dark:bg-[#800055]/30 px-3 py-1 rounded-full border border-[#FFD700]/20">
            Devotional Feeding Status
          </span>
          <h3 className="text-xl font-serif font-bold text-[#800000] dark:text-[#FFD700] mt-3 flex items-center gap-2">
            Annadanam Kitchen
          </h3>
          <p className="text-zinc-500 dark:text-[#FFF8E7]/70 text-xs mt-1">
            Real-time status updates and scheduled hours for multi-hall divine dining.
          </p>
        </div>

        {/* Live food status label */}
        <div className="bg-[#FFF8E7] dark:bg-[#1A0D0D] p-4 rounded-xl border border-[#6E6E6E]/10 dark:border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-mono block">Dining Kitchen Status</span>
            <span className="text-sm font-bold text-zinc-800 dark:text-[#FFF8E7] block mt-0.5">
              {translate(temple.food.diningHallLocation)}
            </span>
          </div>
          <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${getStatusColor(getOrderStatus())}`}>
            {getOrderStatus() === 'Available' ? '🟢 Active' : getOrderStatus() === 'Limited' ? '🟡 Limited' : '🔴 Closed'}
          </span>
        </div>

        {/* Feeding Timings */}
        <div className="space-y-3.5">
          <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1 dark:border-white/10">
            <Clock className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>Scheduled Dining Daily Batches</span>
          </h4>
          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 dark:text-[#FFF8E7]/60 font-bold">Breakfast Timings:</span>
              <span className="font-mono text-zinc-700 dark:text-zinc-300">{temple.food.breakfast}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 dark:text-[#FFF8E7]/60 font-bold">Mid-day Prasadam Lunch:</span>
              <span className="font-mono text-zinc-700 dark:text-zinc-300">{temple.food.lunch}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 dark:text-[#FFF8E7]/60 font-bold">Evening Prasad Distribution:</span>
              <span className="font-mono text-zinc-700 dark:text-zinc-300">{temple.food.dinner}</span>
            </div>
          </div>
          <div className="bg-[#FFF8E7] dark:bg-[#1A0D0D] p-3 rounded-lg border border-[#FFD700]/20 text-[11px] text-[#800000] dark:text-[#FF9933] mt-2 font-serif italic">
            Note: All meals are cooked using traditional firewood/solar furnaces and served without charge as Satvik Bhandara.
          </div>
        </div>

        {/* Subscribing Alerts */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-500 dark:text-[#FFF8E7]/70 uppercase tracking-wider flex items-center gap-1.5 pt-2">
            <BellRing className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>Devotee Meal Reminders</span>
          </h4>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleReminderToggle("Annadanam Starts")}
              className={`p-2.5 rounded-xl text-left text-xs border transition-all flex items-center justify-between ${
                subscribedReminders.includes("Annadanam Starts")
                  ? 'bg-[#FF9933] border-[#FF9933] text-white font-extrabold shadow-sm'
                  : 'bg-white hover:bg-[#FFF8E7] text-zinc-705 dark:bg-[#1A0D0D] dark:text-[#FFF8E7] dark:border-white/10 dark:hover:bg-[#800000]/10'
              }`}
            >
              <span>Annadanam Start Bell (15m prior)</span>
              <BellRing className="w-3.5 h-3.5 opacity-80" />
            </button>
            <button
              onClick={() => handleReminderToggle("Prasadam Distribution Begins")}
              className={`p-2.5 rounded-xl text-left text-xs border transition-all flex items-center justify-between ${
                subscribedReminders.includes("Prasadam Distribution Begins")
                  ? 'bg-[#FF9933] border-[#FF9933] text-white font-extrabold shadow-sm'
                  : 'bg-white hover:bg-[#FFF8E7] text-zinc-705 dark:bg-[#1A0D0D] dark:text-[#FFF8E7] dark:border-white/10 dark:hover:bg-[#800000]/10'
              }`}
            >
              <span>Prasadam Counters Launch Alert</span>
              <BellRing className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
          {notificationStatus && (
            <p className="text-[11px] font-mono text-center text-emerald-600 dark:text-emerald-400 mt-2 animate-bounce font-bold">
              {notificationStatus}
            </p>
          )}
        </div>
      </div>

      {/* Online booking simulation card */}
      <div className="lg:col-span-8 bg-white dark:bg-[#231212] rounded-3xl p-5 border border-[#6E6E6E]/15 dark:border-white/10 shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#6E6E6E]/10 dark:border-white/10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FF9933] dark:text-[#FFD700]">
                Auspicious Traditional Offerings
              </span>
              <h3 className="text-xl font-serif font-bold text-[#800000] dark:text-[#FFF8E7] mt-1">
                Prasadam Shop & Pre-Order Counter
              </h3>
            </div>
            <Ticket className="w-6 h-6 text-[#FF9933] hidden md:block animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* List of Prasadam Items */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-[#6E6E6E] dark:text-zinc-450 uppercase tracking-widest font-sans">Available Sweets & Rice Bowls</h4>
              <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
                {temple.food.prasadamList.map((prasad) => (
                  <div key={prasad.name} className="bg-[#FFF8E7]/30 dark:bg-[#1A0D0D]/40 p-2.5 rounded-xl border border-[#6E6E6E]/10 dark:border-white/5 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-extrabold text-zinc-900 dark:text-[#FFF8E7] block">{translate(prasad.name)}</span>
                      <span className="text-[9.5px] text-zinc-450 dark:text-zinc-400 block mt-0.5">{translate("Counter:")} {translate(prasad.collectionPoint)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#FF9933] dark:text-[#FFD700] font-mono">
                        {prasad.price === 0 ? 'FREE' : `₹${prasad.price}`}
                      </span>
                      <div className="flex items-center border border-zinc-200 dark:border-white/10 rounded-lg overflow-hidden shrink-0 bg-white dark:bg-[#231212]">
                        <button
                          onClick={() => handleQtyChange(prasad.name, -1)}
                          className="px-2 py-1 bg-transparent hover:bg-[#FFF8E7] dark:hover:bg-[#800000]/20 font-black border-r border-zinc-200 dark:border-white/10 text-[#FF9933]"
                        >
                          -
                        </button>
                        <span className="px-3 font-mono font-bold text-zinc-800 dark:text-[#FFF8E7]">
                          {quantities[prasad.name] || 0}
                        </span>
                        <button
                          onClick={() => handleQtyChange(prasad.name, 1)}
                          className="px-2 py-1 bg-transparent hover:bg-[#FFF8E7] dark:hover:bg-[#800000]/20 font-black border-l border-zinc-200 dark:border-white/10 text-[#FF9933]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Receipt Form */}
            <div className="bg-[#FFF8E7] dark:bg-[#1A0D0D] p-5 border border-[#FFD700]/20 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-[#800000] dark:text-[#FFD700] uppercase tracking-widest flex items-center gap-1.5 font-sans">
                <Ticket className="w-3.5 h-3.5" />
                <span>Devotee Authentication Voucher</span>
              </h4>

              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 dark:text-[#FFF8E7]/50 tracking-wider block">Lead Devotee Full Name</label>
                  <input
                    type="text"
                    required
                    value={devoteeName}
                    onChange={(e) => setDevoteeName(e.target.value)}
                    placeholder="Sri Ramanujam K"
                    className="w-full bg-white dark:bg-[#231212] text-xs border border-zinc-200 dark:border-white/10 p-3 rounded-lg outline-none focus:border-[#FF9933] text-zinc-800 dark:text-[#FFF8E7] font-bold shadow-inner"
                  />
                </div>

                <div className="space-y-2 mt-4 pt-2 border-t border-zinc-100 dark:border-white/10 text-xs">
                  <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
                    <span>Prasadam Ticket subtotals:</span>
                    <span className="font-mono font-bold text-zinc-700 dark:text-[#FFF8E7]">
                      ₹{temple.food.prasadamList.reduce((acc, curr) => acc + (curr.price * (quantities[curr.name] || 0)), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400 dark:text-zinc-550 text-[10px]">
                    <span>Sacred Devasthanam tax handles:</span>
                    <span>₹0.00 (Exempt)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!devoteeName.trim() || temple.food.prasadamList.reduce((acc, curr) => acc + (quantities[curr.name] || 0), 0) === 0}
                  className="w-full mt-4 bg-[#800000] hover:bg-[#A01E1E] dark:bg-[#FF9933] dark:hover:bg-[#e68a2e] dark:text-zinc-950 transition-all text-white font-black py-3 rounded-xl text-xs tracking-wider cursor-pointer disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:text-zinc-400 disabled:cursor-not-allowed uppercase border-2 border-[#FFD700]/30 shadow-md"
                >
                  Confirm & Generate Auspicious Slip
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Display virtual check slip once completed */}
        {orderedTicket && (
          <div className="mt-6 pt-5 border-t-2 border-dashed border-[#FFD700]/35 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-4 overflow-hidden">
              <div className="flex gap-3 items-center bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/40 p-3 rounded-xl text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold">Auspicious Transaction Accepted Successfully!</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Please gather your prasadam portions after queue exit at counter room.</p>
                </div>
              </div>

              {/* Digital docket */}
              <div className="bg-[#FFF8E7] dark:bg-[#1A0D0D] p-5 rounded-2xl border-2 border-dashed border-[#FFD700]/30 relative overflow-hidden font-mono text-xs shadow-inner text-[#141414] dark:text-[#FFF8E7]">
                {/* Visual side holes to mimic paper docket */}
                <div className="absolute top-0 bottom-0 left-0 w-2 bg-white dark:bg-[#231212] flex flex-col justify-around pointer-events-none">
                  {[...Array(6)].map((_, i) => <span key={i} className="w-2 h-2 rounded-full bg-[#1A0D0D] dark:bg-[#1A0D0D] -ml-1.5 border border-[#FFD700]/20"></span>)}
                </div>
                <div className="absolute top-0 bottom-0 right-0 w-2 bg-white dark:bg-[#231212] flex flex-col justify-around pointer-events-none">
                  {[...Array(6)].map((_, i) => <span key={i} className="w-2 h-2 rounded-full bg-[#1A0D0D] dark:bg-[#1A0D0D] -mr-1.5 border border-[#FFD700]/20"></span>)}
                </div>

                <div className="px-3 pl-5">
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase font-bold">
                    <span>Ticket ID: {orderedTicket.id}</span>
                    <span>Date: {orderedTicket.date}</span>
                  </div>
                  <h4 className="font-serif font-extrabold text-sm text-[#800000] dark:text-[#FFD700] mt-1.5 select-none border-b border-dashed border-[#6E6E6E]/20 pb-1.5">
                    {temple.name} Divine Ticket
                  </h4>

                  <ul className="space-y-1.5 text-[11px] text-zinc-700 dark:text-zinc-300 mt-3 font-bold">
                    {orderedTicket.items.map((item, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{item.name} (Qty: {item.quantity})</span>
                        <span>₹{item.cost}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-dashed border-[#6E6E6E]/20 mt-3 pt-2.5 text-xs flex justify-between font-extrabold text-zinc-800 dark:text-zinc-100">
                    <span>Devotee: {orderedTicket.devoteeName}</span>
                    <span className="text-[#FF9933] dark:text-[#FFD700] font-black">Total: ₹{orderedTicket.total}</span>
                  </div>

                  <p className="text-[9.5px] text-zinc-500 italic text-center mt-3 pt-1.5 border-t border-[#6E6E6E]/10">
                    Collection Stall: {orderedTicket.collectionRoom}
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col items-center justify-center space-y-3">
              <div className="bg-white p-3.5 rounded-2xl shadow-xl border border-[#FFD700]/20 hover:border-orange-300 transition-all">
                <QrCode className="w-28 h-28 text-zinc-950" />
              </div>
              <button
                onClick={() => window.print()}
                className="p-2.5 px-4 bg-[#800000] hover:bg-[#A01E1E] text-[#FFF8E7] dark:bg-[#FF9933] dark:hover:bg-[#e68a2e] dark:text-zinc-950 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 active:scale-95 border-2 border-[#FFD700]/20 shadow-md cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Auspicious Slip</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

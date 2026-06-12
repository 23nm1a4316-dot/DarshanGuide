import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Bot, User, RefreshCw, Compass } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isSimulated?: boolean;
}

interface SpiritualChatbotProps {
  language: string;
  translate: (key: string) => string;
  selectedTempleId: string;
}

export default function SpiritualChatbot({ language, translate, selectedTempleId }: SpiritualChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      sender: "ai",
      text: translate("chatGreeting"),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const SUGGESTED_TOPICS = [
    { title: "Tirupati Rules", prompt: "What are the timings and dress code for Tirupati Balaji Temple?" },
    { title: "Kashi Corridor", prompt: "Tell me the history of Kashi Vishwanath Corridor and local Ganga Aarti timings." },
    { title: "Kedarnath Trek", prompt: "What safety, medical, and clothing measures are required for Kedarnath mountain pilgrimage?" },
    { title: "Langar Devotion", prompt: "Explain the philosophy of continuous Langar food at Harmandir Sahib Amritsar." },
    { title: "Puri Prasadam", prompt: "Why is Lord Jagannath Mahaprasad called Abadha and how is it cooked?" }
  ];

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, templeId: selectedTempleId })
      });

      if (!res.ok) {
        throw new Error(`Server status returned: ${res.status}`);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server response was not JSON.");
      }

      const data = await res.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSimulated: data.isSimulated
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I am temporarily disconnected from the cosmic stream. Please ensure internet access or verify local Express processes.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: "initial",
        sender: "ai",
        text: translate("chatGreeting"),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div id="ai-spiritual-chatbot" className="bg-white/80 dark:bg-zinc-900/85 backdrop-blur-md rounded-2xl border border-orange-100 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col h-[650px]">
      {/* Target header bar */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 p-4 sticky top-0 z-10 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-200/20 flex items-center justify-center border border-amber-300/30 animate-pulse">
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg tracking-wide text-amber-50">
              {translate("spiritualBot")}
            </h3>
            <span className="text-xs text-orange-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Vedic & Travel Intelligence • Active
            </span>
          </div>
        </div>
        
        <button
          onClick={handleReset}
          title="Reset Conversational Stream"
          className="p-1 px-3 bg-white/10 hover:bg-white/20 transition-all text-xs text-amber-100 rounded-md flex items-center gap-1.5 active:scale-95 border border-white/10"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {language === 'te' ? 'రీసెట్' : language === 'hi' ? 'रीसेट' : 'Clear'}
        </button>
      </div>

      {/* Suggested topics banner */}
      <div className="bg-orange-50/50 dark:bg-zinc-800/40 p-2.5 px-4 border-b border-orange-100/40 dark:border-zinc-800/60 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2">
        <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 text-xs font-medium mr-2">
          <Compass className="w-3.5 h-3.5 animate-spin-slow" />
          <span>Quick Inquire:</span>
        </div>
        {SUGGESTED_TOPICS.map((topic, i) => (
          <button
            key={i}
            onClick={() => handleSend(topic.prompt)}
            className="text-xs bg-white hover:bg-orange-500 hover:text-white dark:bg-zinc-800 dark:hover:bg-orange-600 text-zinc-700 dark:text-zinc-300 px-3 py-1 rounded-full border border-orange-100 dark:border-zinc-700 transition-all font-medium cursor-pointer shadow-sm"
          >
            {topic.title}
          </button>
        ))}
      </div>

      {/* Chat messages viewport */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[460px] bg-[#FFF8E7]/30 dark:bg-[#100808]/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar circle */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${
                msg.sender === 'user' 
                  ? 'bg-[#FF9933] text-white border-[#FF9933]' 
                  : 'bg-[#800000] text-white border-[#FFD700]/30'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message bubble */}
              <div className="flex flex-col">
                <div className={`rounded-2xl p-3.5 shadow-md text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#FF9933] text-white rounded-tr-none font-medium'
                    : 'bg-white dark:bg-[#231212] text-[#141414] dark:text-[#FFF8E7] border border-[#6E6E6E]/10 dark:border-white/10 rounded-tl-none'
                }`}>
                  <div className="whitespace-pre-line prose prose-sm dark:prose-invert">
                    {msg.text}
                  </div>
                  
                  {msg.isSimulated && (
                    <div className="mt-2 pt-1.5 border-t border-[#6E6E6E]/10 text-[10px] text-amber-700 dark:text-[#FF9933] italic flex items-center gap-1 justify-end font-mono">
                      <span>Offline Guide Simulator Active</span>
                    </div>
                  )}
                </div>
                <span className={`text-[10px] mt-1 text-zinc-400 dark:text-zinc-500 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-[#FF9933] text-white flex items-center justify-center shrink-0 animate-spin">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-orange-50 dark:bg-[#231212] p-3 rounded-2xl rounded-tl-none shadow-inner border border-[#6E6E6E]/10 text-xs text-orange-700 dark:text-[#FF9933] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF9933] animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-[#FF9933] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#FF9933] animate-bounce [animation-delay:0.4s]"></span>
                <span className="italic font-bold">Listening to high vibration channels...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Message input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(query);
        }}
        className="p-4 bg-white dark:bg-[#1A0D0D] border-t border-[#6E6E6E]/10 dark:border-white/10 flex gap-2 items-center"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={translate("searchPlaceholder")}
          className="flex-1 bg-[#FFF8E7] dark:bg-[#1A0D0D] focus:bg-white dark:focus:bg-[#100808] border border-[#6E6E6E]/15 dark:border-white/10 focus:border-[#FF9933] dark:focus:border-[#FF9933] text-[#141414] dark:text-[#FFF8E7] text-sm rounded-xl py-3 px-4 outline-none transition-all font-bold placeholder:text-zinc-400 dark:placeholder:text-[#FFF8E7]/40 shadow-inner"
        />
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="w-12 h-12 bg-[#800000] hover:bg-[#A01E1E] dark:bg-[#FF9933] dark:hover:bg-[#e68a2e] disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:text-zinc-350 dark:disabled:text-zinc-700 text-white dark:text-zinc-950 rounded-xl transition-all flex items-center justify-center shrink-0 active:scale-95 shadow-md animate-none"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

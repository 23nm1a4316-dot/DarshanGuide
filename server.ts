import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { TEMPLES_DATA } from "./src/data.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON body parsing
app.use(express.json());

// Initialize Google GenAI client if key exists and is non-default
const rawApiKey = process.env.GEMINI_API_KEY;
const hasValidGeminiKey = rawApiKey && rawApiKey !== "MY_GEMINI_API_KEY" && rawApiKey.trim() !== "";

let ai: GoogleGenAI | null = null;
if (hasValidGeminiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: rawApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    console.log("Google GenAI client successfully initialized with local secret.");
  } catch (err) {
    console.warn("Failed to initialize Google GenAI client:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY found. Running in Smart Simulator Mode.");
}

// Timeout wrapper helper to prevent api failures or long latency from timing out raw express response
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeoutMs)
    )
  ]);
};

// Global In-memory simulated storage for user-submitted reviews
let reviewsDatabase = [
  {
    id: "rev1",
    templeId: "tirupati",
    userName: "Darshan Venkat",
    rating: 5,
    text: "Sublime, life-changing experience standing in the Sarvadarsanam queue. The Matrusri Tarigonda meal was extremely pure, hot, and tasty! Srivari Laddu is the ultimate prasadam.",
    date: "2026-06-10",
    likes: 24
  },
  {
    id: "rev2",
    templeId: "kashi",
    userName: "Aditi Sharma",
    rating: 5,
    text: "Standing in the new Ganga path corridor during Sapta Rishi Aarti made me realize the majestic spiritual heritage of ancient India. The queue is highly organized now. Highly recommend local Sattu prasad.",
    date: "2026-06-08",
    likes: 18
  },
  {
    id: "rev3",
    templeId: "kedarnath",
    userName: "Rohan Rawat",
    rating: 5,
    text: "The trek was demanding but the first glimpse of Lord Shiva's Himalayan stone shrine erased all bodily exhaustion. Please carry warm layers even in summer months.",
    date: "2026-06-07",
    likes: 31
  },
  {
    id: "rev4",
    templeId: "goldentemple",
    userName: "Gurpreet Singh",
    rating: 5,
    text: "Langar serves thousands with identical dignity. The pristine golden look reflection at sunset is a visual miracle of pure human devotion and peace.",
    date: "2026-06-09",
    likes: 42
  }
];

// App-wide notifications simulator
let dynamicNotifications = [
  {
    id: "notif_001",
    title: "Vaikuntam Complex Queue Up",
    message: "Tirupati general queue wait time decreased to 4 hours. Perfect time for prompt Darshan.",
    category: "crowd" as const,
    timestamp: "10 mins ago",
    read: false
  },
  {
    id: "notif_002",
    title: "Maha Sandhya Aarti timing",
    message: "Kashi Vishwanath team preparing for evening Shringar decoration. Devotees gathering in mass corridors.",
    category: "aarti" as const,
    timestamp: "30 mins ago",
    read: false
  },
  {
    id: "notif_003",
    title: "Himalayan Rain Alert",
    message: "Kedarnath path showing heavy wind draft. Devotees are requested to pack waterproof warm windcheaters.",
    category: "weather" as const,
    timestamp: "1 hour ago",
    read: false
  },
  {
    id: "notif_004",
    title: "Continuous Langar active",
    message: "Golden Temple Langar Hall distribution operating at full capacity. Fresh Kheer being served.",
    category: "food" as const,
    timestamp: "2 hours ago",
    read: false
  }
];

// -------------------------------------------------------------
// REST API Routes
// -------------------------------------------------------------

// 1. Health & Status
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    aiMode: hasValidGeminiKey ? "Real Gemini API" : "Interactive Smart Simulation Mode",
    activeTemplesCount: TEMPLES_DATA.length
  });
});

// 2. Fetch all temples
app.get("/api/temples", (req, res) => {
  res.json(TEMPLES_DATA);
});

// 3. Fetch reviews for a temple
app.get("/api/reviews/:templeId", (req, res) => {
  const { templeId } = req.params;
  const filtered = reviewsDatabase.filter(r => r.templeId === templeId);
  res.json(filtered);
});

// 4. Post a review
app.post("/api/reviews", (req, res) => {
  const { templeId, userName, rating, text } = req.body;
  if (!templeId || !userName || !rating || !text) {
    return res.status(400).json({ error: "Missing required review payload fields." });
  }

  const newReview = {
    id: "rev_" + Date.now(),
    templeId,
    userName,
    rating: parseInt(rating) || 5,
    text,
    date: new Date().toISOString().split('T')[0],
    likes: 0
  };

  reviewsDatabase.unshift(newReview);
  res.status(201).json(newReview);
});

// 5. Fetch live alerts/notifications
app.get("/api/notifications", (req, res) => {
  res.json(dynamicNotifications);
});

// 6. Simulate subscribing to notification channels
app.post("/api/notifications/subscribe", (req, res) => {
  const { templeId, channelType, alertCategory } = req.body;
  res.json({
    success: true,
    message: `Successfully connected devotee alert system to ${templeId}'s ${alertCategory} via ${channelType}.`
  });
});

// 7. AI Spiritual Chatbot Assistant
app.post("/api/gemini/chat", async (req, res) => {
  const { message, history, templeId } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Empty query received from user" });
  }

  const currentTemple = TEMPLES_DATA.find(t => t.id === templeId) || TEMPLES_DATA[0];

  // Fallback simulator for offline mode or missing API keys, enhanced with specific temple details context
  const getSimulatedResponse = (query: string, activeTemple: typeof currentTemple): string => {
    const q = query.toLowerCase();
    
    if (q.includes("langar") || q.includes("food") || q.includes("annadanam") || q.includes("prasadam") || q.includes("offer") || q.includes("eat") || q.includes("lunch")) {
      const prasadString = activeTemple.food.prasadamList.map(p => `${p.name} (${p.price === 0 ? "Free" : `Rs ${p.price}`})`).join(", ");
      return `At **${activeTemple.name}** in ${activeTemple.city}, the divine Annadanam details are:
- **Prasadam Options**: ${prasadString}. All satvik offerings are prepared with devotion.
- **Meals Location**: ${activeTemple.food.diningHallLocation}
- **Service Timings**: Lunch is served during **${activeTemple.food.lunch}**, and Diner distribution happens around **${activeTemple.food.dinner}**.`;
    }

    if (q.includes("dress") || q.includes("clothing") || q.includes("wear")) {
      return `For **${activeTemple.name}**, the traditional decorum rules are:
- **Men's dress code**: ${activeTemple.dressCode.men}
- **Women's dress code**: ${activeTemple.dressCode.women}
- **Restricted garments**: ${activeTemple.dressCode.restricted}`;
    }

    if (q.includes("tirupati") || q.includes("balaji")) {
      return "The Tirumala Venkateswara Temple is accessible via Alipiri and Srivari Mettu pathways. The mandatory dress code is Dhoti and Kurta for men, and Saree or Chundidar for women. Make sure to pre-book Special Entry Darshan ($300 to Rs 300 ticket) at least three months in advance. Annadanam is available continuous 09:00 AM to 11:00 PM at Matrusri Tarigonda Vengamamba Complex.";
    }
    if (q.includes("kedarnath") || q.includes("valley") || q.includes("himalaya")) {
      return "Kedarnath Temple, high in Uttarakhand, opens around April-May (Akshaya Tritiya) and closes in November during Karthik Purnima. Pilgrims must execute medical checks. It requires a 16km trek from Gaurikund. Helicopter reservations open early online. General weather is extremely cold, carry triple thermals.";
    }
    if (q.includes("madurai") || q.includes("meenakshi") || q.includes("gopuram")) {
      return "Madurai Meenakshi Temple is built with 14 sprawling towers with stunning color representations. The most popular ritual is the Palliyarai pooja at 09:00 PM when the Lord is taken to the Goddess' sleeping chamber. Local food of interest is Murugan Idli, and Meenakshi Laddu.";
    }
    if (q.includes("jagannath") || q.includes("puri") || q.includes("ratha")) {
      return "Jagannath Temple in Puri is world famous for its Rath Yatra chariot festival. It is a strict Char Dham shrine. Only Indian origin Hindu devotees are permitted inside. Food consists of the massive Mahaprasad Abadha, cooked using 7 stacked clay pots over holy fire.";
    }

    return `Namaste! I would love to guide you on your journey to **${activeTemple.name}** as your AI Spiritual Companion.
- **Deity**: Worshiped here is **${activeTemple.deity}**.
- **Timings**: Morning Darshan is from **${activeTemple.timings.morningDarshan}**, and evening is **${activeTemple.timings.eveningDarshan}**.
Please ask me about this shrine's dress-code rules, Annadanam kitchen timings, or holy history.`;
  };

  if (!ai) {
    // Return high quality simulation response with a brief indicator
    const text = getSimulatedResponse(message, currentTemple);
    return res.json({ text, isSimulated: true });
  }

  try {
    const prasadString = currentTemple.food.prasadamList.map(p => `${p.name} (${p.price === 0 ? "Free" : `Rs ${p.price}`})`).join(", ");
    
    const chatPrompt = `You are "DarshanGuide's" master AI Spiritual Guide Chatbot. 
Your character is highly knowledgeable, helpful, respectful, and speaks with peaceful traditional Indian hospitality.

The user is currently inquiring about or viewing: **${currentTemple.name}** in ${currentTemple.city}, ${currentTemple.state}.
- Main Deity: ${currentTemple.deity}
- Main prasadam details: ${prasadString}
- Dining Kitchen information: ${currentTemple.food.diningHallLocation}, serves meals: breakfast (${currentTemple.food.breakfast}), lunch (${currentTemple.food.lunch}), dinner (${currentTemple.food.dinner}).
- Dress Code regulations: Men (${currentTemple.dressCode.men}), Women (${currentTemple.dressCode.women}), Restricted garments (${currentTemple.dressCode.restricted}).

Provide accurate information regarding:
1. Temple schedules and timing
2. Dress code regulations
3. Annadanam and Prasadam food timings
4. Fasting norms, weather conditions, festivals
5. Historical details and local travel recommendations

Keep your answers helpful, beautifully formatted with bold phrases, and crisp (under 120 words).
Under no circumstance should you make up timing or pricing. Refer to the specific temple's real pricing: ${currentTemple.name}'s prasadams list is: ${prasadString}.

Current user question: "${message}"`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: chatPrompt,
        config: {
          systemInstruction: "You are the ultimate traditional, humble Vedic spiritual advisor for DarshanGuide. Format with markdown cleanly.",
          temperature: 0.7,
        }
      }),
      15000 // 15 seconds timeout
    );

    res.json({ text: response.text || "I am currently meditating on the gods. Please try again soon." });
  } catch (err: any) {
    console.warn("Gemini Chat simulated fallback activated due to:", err?.message || err);
    res.json({ text: getSimulatedResponse(message, currentTemple), isSimulated: true });
  }
});

// 8. AI Pilgrimage Planner
app.post("/api/gemini/plan", async (req, res) => {
  const { budget, days, familySize, temples, preferredDeities } = req.body;
  
  if (!temples || temples.length === 0) {
    return res.status(400).json({ error: "Please select at least 1 temple to design an itinerary." });
  }

  // Construct a beautiful fall-back plan based on inputs
  const makeSimulatedPlan = () => {
    const templeNames = temples.map((id: string) => {
      const match = TEMPLES_DATA.find(t => t.id === id);
      return match ? match.name : id;
    }).join(" and ");

    const dailyItinerary = [];
    const totalDays = parseInt(days) || 2;
    const numFamily = parseInt(familySize) || 2;
    const budVal = parseInt(budget) || 15000;

    for (let d = 1; d <= totalDays; d++) {
      dailyItinerary.push({
        day: d,
        activities: [
          { time: "06:30 AM", activity: "Morning holy Snanam bathing & Suprabhata chanting", locationName: temples[0], notes: "Prefer light traditional clothing" },
          { time: "09:00 AM", activity: "Main Sanctorum Seeghra Darshan Queue Entry", locationName: temples[0], notes: "Family security together" },
          { time: "12:30 PM", activity: "Participate in Sacred Annadanam dining feast", locationName: temples[d % temples.length] || temples[0], notes: "Absolutely free, satvik preparation" },
          { time: "04:00 PM", activity: "Local architectural study and custom souvenirs purchase", locationName: "Local bazaar and museum" },
          { time: "07:00 PM", event: "Grand Sandhya aarti viewing", locationName: temples[d % temples.length] || temples[0] }
        ]
      });
    }

    const calculatedCost = {
      travel: Math.round(budVal * 0.35),
      accommodation: Math.round(budVal * 0.3),
      prasadamFood: Math.round(150 * numFamily * totalDays),
      donationTickets: Math.round(300 * numFamily),
      total: 0
    };
    calculatedCost.total = calculatedCost.travel + calculatedCost.accommodation + calculatedCost.prasadamFood + calculatedCost.donationTickets;

    return {
      name: `${totalDays}-Day Pilgrimage to ${temples[0] ? temples[0].toUpperCase() : 'Sacred'} India`,
      days: totalDays,
      budget: budVal,
      familySize: numFamily,
      templeIds: temples,
      routeOrder: temples,
      totalDistance: `${Math.round(112 * totalDays)} km`,
      totalDuration: `${Math.round(2.5 * totalDays)} Hours total travel`,
      itinerary: dailyItinerary,
      costBreakdown: calculatedCost,
      isSimulated: true
    };
  };

  if (!ai) {
    const result = makeSimulatedPlan();
    return res.json(result);
  }

  try {
    const plannerPrompt = `Generate a comprehensive high-fidelity pilgrimage plan inside of India.
Plan Parameters:
- Total Budget: INR ${budget}
- Number of Days: ${days} days
- Family Size: ${familySize} people
- Target Temples: ${temples.join(", ")}
- Preferred Deities/Interests: ${preferredDeities || "None Specified"}

Provide a beautifully itemized plan in valid JSON format. The response must be strictly JSON conforming to the following sample typescript structure so that it is parsed and presented in a sleek UI:
{
  "name": "Sacred Path Itinerary",
  "days": number,
  "budget": number,
  "familySize": number,
  "templeIds": ["${temples.join('","')}"],
  "routeOrder": ["${temples.join('","')}"],
  "totalDistance": "string like 140 km",
  "totalDuration": "string like 4.5 Hours",
  "itinerary": [
    {
      "day": 1,
      "activities": [
        { "time": "08:00 AM", "activity": "Activity title", "locationName": "Location name", "notes": "tips" }
      ]
    }
  ],
  "costBreakdown": {
    "travel": number,
    "accommodation": number,
    "prasadamFood": number,
    "donationTickets": number,
    "total": number
  }
}

Ensure all prices sum up reasonably and reflect the requested budget limit of INR ${budget}. Response must be active, highly detailed, realistic, and contain zero markdown code block surrounding markers if possible or clean valid JSON only.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: plannerPrompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      }),
      15000 // 15 seconds timeout
    );

    const parsed = JSON.parse(response.text.trim());
    res.json({ ...parsed, isSimulated: false });
  } catch (err: any) {
    console.warn("Gemini Itinerary simulated fallback activated due to:", err?.message || err);
    res.json(makeSimulatedPlan());
  }
});

// 9. AI Temple Recommendation Engine
app.post("/api/gemini/recommend", (req, res) => {
  const { preferredDeity, preferredState, canTravelFar } = req.body;
  
  // Quick algorithmic matching for recommendations
  let scoredTemples = TEMPLES_DATA.map(t => {
    let score = 0;
    if (preferredDeity && t.deity.toLowerCase().includes(preferredDeity.toLowerCase())) score += 5;
    if (preferredState && t.state.toLowerCase() === preferredState.toLowerCase()) score += 4;
    if (t.isPopular) score += 2;
    return { temple: t, score };
  });

  scoredTemples.sort((a, b) => b.score - a.score);
  
  // Return top 2 recommendations
  const topMatches = scoredTemples.slice(0, 2).map(item => ({
    templeId: item.temple.id,
    name: item.temple.name,
    reason: `Highest match based on your devotion to ${item.temple.deity} located in the beautiful state of ${item.temple.state}. Features outstanding traditional ${item.temple.architecture} and perfect rating of ${item.temple.rating}.`
  }));

  res.json({
    success: true,
    recommendations: topMatches
  });
});


// -------------------------------------------------------------
// Serve static frontend files (HMR disabled in development)
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting Express + Vite Dev Middleware compiler on host 0.0.0.0:3000");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production static assets from root /dist directory.");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`===================================================`);
    console.log(` DarshanGuide Server actively bound to Port: ${PORT}`);
    console.log(` Access dashboard locally at http://localhost:${PORT}`);
    console.log(`===================================================`);
  });
}

startServer();

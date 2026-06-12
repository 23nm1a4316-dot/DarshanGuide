export interface TempleTimings {
  opening: string;
  closing: string;
  morningDarshan: string;
  eveningDarshan: string;
  specialDarshan: string;
}

export interface DressCode {
  men: string;
  women: string;
  restricted: string;
}

export interface Facilities {
  parking: boolean;
  restrooms: boolean;
  water: boolean;
  wheelchair: boolean;
  lockers: boolean;
  accommodation: boolean;
  medical: boolean;
}

export interface PrasadamItem {
  name: string;
  type: string;
  price: number;
  free: boolean;
  collectionPoint: string;
}

export interface FoodInfo {
  annadanamStatus: 'Available' | 'Limited' | 'Closed';
  annadanamTimings: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  capacity: number;
  diningHallLocation: string;
  prasadamList: PrasadamItem[];
}

export interface ContactInfo {
  phone: string;
  website: string;
  email: string;
}

export interface ScheduleEvent {
  time: string;
  event: string;
  type: 'seva' | 'darshan' | 'food' | 'general';
}

export interface CrowdTrend {
  hour: string;
  count: number; // Percentage representing occupancy
  text: string;
}

export interface TempleWeather {
  temp: number;
  text: string;
  forecast: string;
  warning: string | null;
}

export interface TempleFestival {
  name: string;
  date: string;
  countdown: string;
  description: string;
}

export interface NearbyService {
  name: string;
  type: 'Hotel' | 'Restaurant' | 'Hospital' | 'ATM' | 'Parking';
  rating: number;
  distance: string;
  address: string;
}

export interface Temple {
  id: string;
  name: string;
  originalName: string;
  deity: string;
  state: string;
  city: string;
  district: string;
  rating: number;
  isPopular: boolean;
  description: string;
  history: string;
  established: string;
  architecture: string;
  image: string;
  location: { lat: number; lng: number };
  timings: TempleTimings;
  dressCode: DressCode;
  facilities: Facilities;
  food: FoodInfo;
  contact: ContactInfo;
  timeline: ScheduleEvent[];
  crowdLevel: 'Low' | 'Medium' | 'High';
  crowdTrend: CrowdTrend[];
  weather: TempleWeather;
  festivals: TempleFestival[];
  nearbyServices: NearbyService[];
  liveStreamUrl: string;
}

export interface UserReview {
  id: string;
  templeId: string;
  userName: string;
  rating: number;
  text: string;
  date: string;
  photoUrl?: string;
  likes: number;
}

export interface PilgrimPlan {
  id: string;
  name: string;
  days: number;
  budget: number;
  familySize: number;
  templeIds: string[];
  routeOrder: string[];
  totalDistance: string;
  totalDuration: string;
  itinerary: Array<{
    day: number;
    activities: Array<{
      time: string;
      activity: string;
      locationName: string;
      notes?: string;
    }>;
  }>;
  costBreakdown: {
    travel: number;
    accommodation: number;
    prasadamFood: number;
    donationTickets: number;
    total: number;
  };
}

export interface UserState {
  fullName: string;
  email: string;
  mobile: string;
  isLoggedIn: boolean;
  savedTemples: string[];
  visitHistory: Array<{ templeId: string; date: string }>;
  reviewsWritten: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: 'opening' | 'aarti' | 'food' | 'festival' | 'crowd' | 'weather';
  timestamp: string;
  read: boolean;
}

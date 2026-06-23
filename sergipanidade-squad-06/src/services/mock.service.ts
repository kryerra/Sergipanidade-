import hotelsData from "@/constants/hotels.json";
import reviewsData from "@/constants/reviews.json";
import artistsData from "@/constants/artists.json";
import storiesData from "@/constants/stories.json";
import eventsData from "@/constants/events.json";
import { destinations } from "@/constants/destinations";

// ─── DTO / Entities ──────────────────────────────────────────

export interface Hotel {
  id: string;
  name: string;
  category: string;
  bairro: string;
  priceLevel: number;
  startingPrice: string;
  rating: number;
  reviews: string;
  image: string;
  amenities: string[];
  description?: string;
}

export interface PartnerReview {
  id: number;
  name: string;
  initials: string;
  rating: number;
  comment: string;
  date: string;
  replied: boolean;
  existingResponse: string | null;
}

export interface UserReview {
  id: string;
  place: string;
  rating: number;
  date: string;
  text: string;
  partnerResponse: string | null;
  partnerInitials: string | null;
}

export interface Artist {
  id: string;
  name: string;
  city: string;
  linguagem: string;
  bio: string;
  bioFull: string;
  photo: string;
  coverPhoto: string;
  awards: string;
  years: string;
  instagram: string;
  works: { title: string; year: string; img: string; desc: string; tecnica: string }[];
}

export interface Story {
  id: string;
  category: "FOLCLORE" | "TRADIÇÃO" | "PERSONALIDADE" | "GASTRONOMIA" | "PATRIMÔNIO IMATERIAL";
  title: string;
  intro: string;
  body: string[];
  author: string;
  date: string;
  img: string;
  imgCaption: string;
  relatedImg: string;
}

export interface CulturaEvent {
  id: string;
  name: string;
  type: string;
  day: string;
  month: string;
  local: string;
  city: string;
  desc: string;
  img: string;
  free: boolean;
  online: boolean;
  thisWeek: boolean;
}

export interface Itinerary {
  id: string;
  title: string;
  days: number;
  type: string;
  date: string;
  stops: number;
  img: string;
}

// ─── LocalStorage Persistence Helpers ──────────────────────────

const isBrowser = typeof window !== 'undefined';

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isBrowser) return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Failed to read key "${key}" from localStorage:`, error);
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write key "${key}" to localStorage:`, error);
  }
}

// Keys constants
const KEYS = {
  HOTELS: 'sergipanidade_mock_hotels',
  REVIEWS: 'sergipanidade_mock_reviews',
  ARTISTS: 'sergipanidade_mock_artists',
  STORIES: 'sergipanidade_mock_stories',
  EVENTS: 'sergipanidade_mock_events',
  FAVORITES: 'sergipanidade_mock_favorites',
  ITINERARIES: 'sergipanidade_mock_itineraries',
};

// ─── Ports (Repository Interfaces) ────────────────────────────

export interface IHotelRepository {
  getHotels(): Promise<Hotel[]>;
}

export interface IReviewRepository {
  getPartnerReviews(): Promise<PartnerReview[]>;
  getUserReviews(): Promise<UserReview[]>;
  addPartnerResponse(reviewId: number, responseText: string): Promise<void>;
  deleteUserReview(reviewId: string): Promise<void>;
  addUserReview(review: UserReview): Promise<void>;
}

export interface ICulturaRepository {
  getArtists(): Promise<Artist[]>;
  getStories(): Promise<Story[]>;
  getEvents(): Promise<CulturaEvent[]>;
}

export interface IFavoriteRepository {
  getFavorites(): Promise<typeof destinations>;
  addFavorite(destinationId: string): Promise<void>;
  removeFavorite(destinationId: string): Promise<void>;
  isFavorite(destinationId: string): Promise<boolean>;
}

export interface IItineraryRepository {
  getItineraries(): Promise<Itinerary[]>;
  saveItinerary(itinerary: Itinerary): Promise<void>;
  deleteItinerary(itineraryId: string): Promise<void>;
}

// ─── Adapters (Mock Implementations with LocalStorage) ──────────

class MockHotelRepository implements IHotelRepository {
  async getHotels(): Promise<Hotel[]> {
    const data = getStorageItem<Hotel[]>(KEYS.HOTELS, hotelsData as Hotel[]);
    return new Promise((resolve) => setTimeout(() => resolve(data), 50));
  }
}

class MockReviewRepository implements IReviewRepository {
  private getRawData(): typeof reviewsData {
    return getStorageItem<typeof reviewsData>(KEYS.REVIEWS, reviewsData);
  }

  async getPartnerReviews(): Promise<PartnerReview[]> {
    const data = this.getRawData();
    return new Promise((resolve) =>
      setTimeout(() => resolve(data.partnerReviews as PartnerReview[]), 50)
    );
  }

  async getUserReviews(): Promise<UserReview[]> {
    const data = this.getRawData();
    return new Promise((resolve) =>
      setTimeout(() => resolve(data.userReviews as UserReview[]), 50)
    );
  }

  async addPartnerResponse(reviewId: number, responseText: string): Promise<void> {
    const data = this.getRawData();
    const updatedPartner = (data.partnerReviews as PartnerReview[]).map((r) =>
      r.id === reviewId ? { ...r, replied: true, existingResponse: responseText } : r
    );
    const updatedUser = (data.userReviews as UserReview[]).map((r) =>
      Number(r.id) === reviewId ? { ...r, partnerResponse: responseText, partnerInitials: "M" } : r
    );
    
    setStorageItem(KEYS.REVIEWS, {
      partnerReviews: updatedPartner,
      userReviews: updatedUser,
    });
    return new Promise((resolve) => setTimeout(resolve, 50));
  }

  async deleteUserReview(reviewId: string): Promise<void> {
    const data = this.getRawData();
    const updatedUser = (data.userReviews as UserReview[]).filter((r) => r.id !== reviewId);
    setStorageItem(KEYS.REVIEWS, {
      ...data,
      userReviews: updatedUser,
    });
    return new Promise((resolve) => setTimeout(resolve, 50));
  }

  async addUserReview(review: UserReview): Promise<void> {
    const data = this.getRawData();
    const updatedUser = [review, ...data.userReviews];
    setStorageItem(KEYS.REVIEWS, {
      ...data,
      userReviews: updatedUser,
    });
    return new Promise((resolve) => setTimeout(resolve, 50));
  }
}

class MockCulturaRepository implements ICulturaRepository {
  async getArtists(): Promise<Artist[]> {
    const data = getStorageItem<Artist[]>(KEYS.ARTISTS, artistsData as Artist[]);
    return new Promise((resolve) => setTimeout(() => resolve(data), 50));
  }

  async getStories(): Promise<Story[]> {
    const data = getStorageItem<Story[]>(KEYS.STORIES, storiesData as unknown as Story[]);
    return new Promise((resolve) => setTimeout(() => resolve(data), 50));
  }

  async getEvents(): Promise<CulturaEvent[]> {
    const data = getStorageItem<CulturaEvent[]>(KEYS.EVENTS, eventsData as CulturaEvent[]);
    return new Promise((resolve) => setTimeout(() => resolve(data), 50));
  }
}

class MockFavoriteRepository implements IFavoriteRepository {
  private getDefaultFavorites(): typeof destinations {
    return destinations.slice(0, 6);
  }

  async getFavorites(): Promise<typeof destinations> {
    const data = getStorageItem<typeof destinations>(KEYS.FAVORITES, this.getDefaultFavorites());
    return new Promise((resolve) => setTimeout(() => resolve(data), 50));
  }

  async addFavorite(destinationId: string): Promise<void> {
    const current = getStorageItem<typeof destinations>(KEYS.FAVORITES, this.getDefaultFavorites());
    if (current.some(d => d.id === destinationId)) return;
    
    const target = destinations.find(d => d.id === destinationId);
    if (!target) return;

    setStorageItem(KEYS.FAVORITES, [...current, target]);
    return new Promise((resolve) => setTimeout(resolve, 50));
  }

  async removeFavorite(destinationId: string): Promise<void> {
    const current = getStorageItem<typeof destinations>(KEYS.FAVORITES, this.getDefaultFavorites());
    const updated = current.filter(d => d.id !== destinationId);
    setStorageItem(KEYS.FAVORITES, updated);
    return new Promise((resolve) => setTimeout(resolve, 50));
  }

  async isFavorite(destinationId: string): Promise<boolean> {
    const current = getStorageItem<typeof destinations>(KEYS.FAVORITES, this.getDefaultFavorites());
    return current.some(d => d.id === destinationId);
  }
}

class MockItineraryRepository implements IItineraryRepository {
  private readonly defaultItineraries: Itinerary[] = [
    {
      id: "1",
      title: "Aracaju",
      days: 3,
      type: "Casal",
      date: "Jan 2024",
      stops: 6,
      img: "https://images.unsplash.com/photo-1709133108199-424031785704?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    },
    {
      id: "2",
      title: "Litoral Norte",
      days: 1,
      type: "Solo",
      date: "Mar 2024",
      stops: 4,
      img: "https://images.unsplash.com/photo-1773407060124-c093ab4ff969?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    },
  ];

  async getItineraries(): Promise<Itinerary[]> {
    const data = getStorageItem<Itinerary[]>(KEYS.ITINERARIES, this.defaultItineraries);
    return new Promise((resolve) => setTimeout(() => resolve(data), 50));
  }

  async saveItinerary(itinerary: Itinerary): Promise<void> {
    const current = getStorageItem<Itinerary[]>(KEYS.ITINERARIES, this.defaultItineraries);
    const updated = current.some(i => i.id === itinerary.id)
      ? current.map(i => i.id === itinerary.id ? itinerary : i)
      : [...current, itinerary];

    setStorageItem(KEYS.ITINERARIES, updated);
    return new Promise((resolve) => setTimeout(resolve, 50));
  }

  async deleteItinerary(itineraryId: string): Promise<void> {
    const current = getStorageItem<Itinerary[]>(KEYS.ITINERARIES, this.defaultItineraries);
    const updated = current.filter(i => i.id !== itineraryId);
    setStorageItem(KEYS.ITINERARIES, updated);
    return new Promise((resolve) => setTimeout(resolve, 50));
  }
}

// ─── Service Singleton / Factory ──────────────────────────────

export class MockService {
  private static instance: MockService;

  public readonly hotels: IHotelRepository;
  public readonly reviews: IReviewRepository;
  public readonly cultura: ICulturaRepository;
  public readonly favorites: IFavoriteRepository;
  public readonly itineraries: IItineraryRepository;

  private constructor() {
    this.hotels = new MockHotelRepository();
    this.reviews = new MockReviewRepository();
    this.cultura = new MockCulturaRepository();
    this.favorites = new MockFavoriteRepository();
    this.itineraries = new MockItineraryRepository();
  }

  public static getInstance(): MockService {
    if (!MockService.instance) {
      MockService.instance = new MockService();
    }
    return MockService.instance;
  }
}

export const mockService = MockService.getInstance();

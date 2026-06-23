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

// ─── Ports (Repository Interfaces) ────────────────────────────

export interface IHotelRepository {
  getHotels(): Promise<Hotel[]>;
}

export interface IReviewRepository {
  getPartnerReviews(): Promise<PartnerReview[]>;
  getUserReviews(): Promise<UserReview[]>;
}

export interface ICulturaRepository {
  getArtists(): Promise<Artist[]>;
  getStories(): Promise<Story[]>;
  getEvents(): Promise<CulturaEvent[]>;
}

export interface IFavoriteRepository {
  getFavorites(): Promise<typeof destinations>;
}

export interface IItineraryRepository {
  getItineraries(): Promise<Itinerary[]>;
}

// ─── Adapters (Mock Implementations) ──────────────────────────

class MockHotelRepository implements IHotelRepository {
  async getHotels(): Promise<Hotel[]> {
    return new Promise((resolve) => setTimeout(() => resolve(hotelsData), 50));
  }
}

class MockReviewRepository implements IReviewRepository {
  async getPartnerReviews(): Promise<PartnerReview[]> {
    return new Promise((resolve) =>
      setTimeout(() => resolve(reviewsData.partnerReviews as PartnerReview[]), 50)
    );
  }

  async getUserReviews(): Promise<UserReview[]> {
    return new Promise((resolve) =>
      setTimeout(() => resolve(reviewsData.userReviews as UserReview[]), 50)
    );
  }
}

class MockCulturaRepository implements ICulturaRepository {
  async getArtists(): Promise<Artist[]> {
    return new Promise((resolve) => setTimeout(() => resolve(artistsData as Artist[]), 50));
  }

  async getStories(): Promise<Story[]> {
    return new Promise((resolve) =>
      setTimeout(() => resolve(storiesData as unknown as Story[]), 50)
    );
  }

  async getEvents(): Promise<CulturaEvent[]> {
    return new Promise((resolve) => setTimeout(() => resolve(eventsData as CulturaEvent[]), 50));
  }
}

class MockFavoriteRepository implements IFavoriteRepository {
  async getFavorites(): Promise<typeof destinations> {
    return new Promise((resolve) => setTimeout(() => resolve(destinations.slice(0, 6)), 50));
  }
}

class MockItineraryRepository implements IItineraryRepository {
  private itineraries: Itinerary[] = [
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
    return new Promise((resolve) => setTimeout(() => resolve(this.itineraries), 50));
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

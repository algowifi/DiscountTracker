import { type Activity, type User, type InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Activity methods
  getActivities(): Promise<Activity[]>;
  getActivityById(id: number): Promise<Activity | undefined>;
  toggleActivityDiscount(id: number): Promise<Activity>;

  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private activities: Map<number, Activity>;
  private users: Map<number, User>;
  private currentUserId: number;
  sessionStore: session.Store;

  constructor() {
    this.activities = new Map(mockActivities.map(a => [a.id, a]));
    this.users = new Map();
    this.currentUserId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Activity methods
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }

  async getActivityById(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async toggleActivityDiscount(id: number): Promise<Activity> {
    const activity = this.activities.get(id);
    if (!activity) throw new Error("Activity not found");

    const updated = { ...activity, isActive: !activity.isActive };
    this.activities.set(id, updated);
    return updated;
  }
}

const mockActivities: Activity[] = [
  {
    id: 1,
    name: "Mountain Biking Adventure",
    description: "Exciting mountain trails with professional guides",
    category: "Adventure",
    imageUrl: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368",
    originalPrice: 100,
    discountPercentage: 25,
    isActive: false
  },
  {
    id: 2,
    name: "Yoga Workshop",
    description: "Relaxing yoga sessions with certified instructors",
    category: "Wellness",
    imageUrl: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571",
    originalPrice: 50,
    discountPercentage: 20,
    isActive: false
  },
  {
    id: 3,
    name: "Cooking Class",
    description: "Learn to cook authentic Italian cuisine",
    category: "Education",
    imageUrl: "https://images.unsplash.com/photo-1540474211005-7c8a448f69e6",
    originalPrice: 80,
    discountPercentage: 15,
    isActive: false
  },
  {
    id: 4,
    name: "Theater Show",
    description: "Broadway-style musical performance",
    category: "Entertainment",
    imageUrl: "https://images.unsplash.com/photo-1540539234-c14a20fb7c7b",
    originalPrice: 120,
    discountPercentage: 30,
    isActive: false
  },
  {
    id: 5,
    name: "Art Gallery Tour",
    description: "Guided tour of contemporary art exhibits",
    category: "Arts",
    imageUrl: "https://images.unsplash.com/photo-1596066190600-3af9aadaaea1",
    originalPrice: 40,
    discountPercentage: 50,
    isActive: false
  },
  {
    id: 6,
    name: "Tennis Lessons",
    description: "Private tennis coaching sessions",
    category: "Sports",
    imageUrl: "https://images.unsplash.com/photo-1501604914713-3decf20bf804",
    originalPrice: 90,
    discountPercentage: 35,
    isActive: false
  },
  {
    id: 7,
    name: "City Food Tour",
    description: "Explore local cuisine and restaurants",
    category: "Dining",
    imageUrl: "https://images.unsplash.com/photo-1487113991643-86bfb4c9de2d",
    originalPrice: 70,
    discountPercentage: 40,
    isActive: false
  },
  {
    id: 8,
    name: "Photography Workshop",
    description: "Learn photography from professionals",
    category: "Education",
    imageUrl: "https://images.unsplash.com/photo-1476055090065-a605fefd840e",
    originalPrice: 150,
    discountPercentage: 45,
    isActive: false
  }
];

export const storage = new MemStorage();
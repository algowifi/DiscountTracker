import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

class MemStorage {
  constructor() {
    this.activities = new Map(mockActivities.map(a => [a.id, a]));
    this.users = new Map();
    this.currentUserId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser) {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getActivities() {
    return Array.from(this.activities.values());
  }

  async getActivityById(id) {
    return this.activities.get(id);
  }

  async toggleActivityDiscount(id) {
    const activity = this.activities.get(id);
    if (!activity) throw new Error("Activity not found");

    const updated = { ...activity, isActive: !activity.isActive };
    this.activities.set(id, updated);
    return updated;
  }
}

const mockActivities = [
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
  // ... (same mock activities as before)
];

export const storage = new MemStorage();
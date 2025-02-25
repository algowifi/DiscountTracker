import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Protected routes - require authentication
  app.use("/api/activities", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  });

  app.get("/api/activities", async (_req, res) => {
    const activities = await storage.getActivities();
    res.json(activities);
  });

  app.post("/api/activities/:id/toggle", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const activity = await storage.toggleActivityDiscount(id);
      res.json(activity);
    } catch (error) {
      res.status(404).json({ message: "Activity not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
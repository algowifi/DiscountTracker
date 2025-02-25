
import { createServer } from "http";
import { storage } from "./storage.js";
import { setupAuth } from "./auth.js";

export async function registerRoutes(app) {
  setupAuth(app);

  app.post("/api/user-exists", async (req, res) => {
    const { username } = req.body;
    const user = await storage.getUserByUsername(username);
    if (user) {
      res.status(200).json({ exists: true });
    } else {
      res.status(404).json({ exists: false });
    }
  });

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

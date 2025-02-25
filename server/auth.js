
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage.js";
import { log } from "./vite.js";

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  const hashedPassword = `${buf.toString("hex")}.${salt}`;
  log(`Password hashed with salt: ${salt}`);
  return hashedPassword;
}

async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  const matches = timingSafeEqual(hashedBuf, suppliedBuf);
  log(`Password comparison result: ${matches}`);
  return matches;
}

export function setupAuth(app) {
  const sessionSettings = {
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  app.use((req, _res, next) => {
    log(`Session ID: ${req.sessionID}`);
    log(`Is Authenticated: ${req.isAuthenticated()}`);
    next();
  });

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        log(`Login attempt for user: ${username}`);
        log(`User found: ${!!user}`);
        if (!user) {
          log(`Login failed - user not found: ${username}`);
          return done(null, false);
        }
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          log(`Login failed - invalid password for user: ${username}`);
          return done(null, false);
        }
        log(`Login successful for user: ${username}`);
        return done(null, user);
      } catch (error) {
        log(`Login error for user ${username}: ${error}`);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    log(`Serializing user: ${user.id}`);
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      log(`Deserialized user: ${id}, found: ${!!user}`);
      done(null, user);
    } catch (error) {
      log(`Deserialization error for user ${id}: ${error}`);
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      log(`Registration attempt for username: ${req.body.username}`);
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        log(`Registration failed - username exists: ${req.body.username}`);
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        username: req.body.username,
        password: hashedPassword,
      });

      log(`User created with ID: ${user.id}`);

      req.login(user, (err) => {
        if (err) {
          log(`Login error after registration: ${err}`);
          return next(err);
        }
        log(`User registered and logged in: ${user.id}`);
        res.status(201).json(user);
      });
    } catch (error) {
      log(`Registration error: ${error}`);
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    log(`Login request received for username: ${req.body.username}`);
    passport.authenticate("local", (err, user) => {
      if (err) {
        log(`Authentication error: ${err}`);
        return next(err);
      }
      if (!user) {
        log(`Authentication failed for user: ${req.body.username}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) {
          log(`Login session error: ${err}`);
          return next(err);
        }
        log(`User logged in: ${user.id}`);
        res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    const userId = req.user?.id;
    req.logout((err) => {
      if (err) return next(err);
      log(`User logged out: ${userId}`);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      log("Unauthorized /api/user access");
      return res.sendStatus(401);
    }
    log(`User data retrieved: ${req.user.id}`);
    res.json(req.user);
  });
}

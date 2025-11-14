import session from "express-session";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Extend express-session typings for TypeScript
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "dev-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    })
  );

  app.post("/api/login", async (req: any, res) => {
    try {
      const { email, firstName, lastName } = req.body || {};

      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email is required" });
      }

      const userId = email.toLowerCase();

      const user = await storage.upsertUser({
        id: userId,
        email: email.toLowerCase(),
        firstName: firstName || null,
        lastName: lastName || null,
      } as any);

      req.session.userId = user.id;

      res.json(user);
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/logout", (req: any, res) => {
    if (!req.session) {
      return res.json({ message: "Logged out" });
    }

    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  try {
    const userId = req.session?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Error in isAuthenticated:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

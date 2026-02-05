import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// JWT Secret from environment
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
      };
    }
  }
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  token: string;
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(userId: string): string {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: "7d" } // Token expires in 7 days
  );
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Setup authentication routes
 */
export function setupAuth(app: Express): void {
  // Register endpoint
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName }: RegisterRequest = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({ 
          message: "Email and password are required" 
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          message: "Password must be at least 6 characters long" 
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          message: "Please enter a valid email address" 
        });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email.toLowerCase());
      if (existingUser) {
        return res.status(409).json({ 
          message: "User with this email already exists" 
        });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const userId = email.toLowerCase();

      const user = await storage.createUser({
        id: userId,
        email: email.toLowerCase(),
        firstName: firstName || null,
        lastName: lastName || null,
        password: hashedPassword,
      });

      // Generate token
      const token = generateToken(user.id);

      const response: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token,
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password }: LoginRequest = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({ 
          message: "Email and password are required" 
        });
      }

      // Find user
      const user = await storage.getUserByEmail(email.toLowerCase());
      if (!user || !user.password) {
        return res.status(401).json({ 
          message: "Invalid email or password" 
        });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          message: "Invalid email or password" 
        });
      }

      // Generate token
      const token = generateToken(user.id);

      const response: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token,
      };

      res.json(response);
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Get current user (token validation)
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.substring(7); // Remove "Bearer " prefix
      const decoded = verifyToken(token);
      
      if (!decoded) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const user = await storage.getUser(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } catch (error) {
      console.error("Error getting current user:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Logout endpoint (client-side token removal)
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    // With JWT, logout is handled client-side by removing the token
    // This endpoint exists for API consistency
    res.json({ message: "Logged out successfully" });
  });
}

/**
 * Authentication middleware for protected routes
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const decoded = verifyToken(token);
    
    if (!decoded) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }

    // Attach user info to request (you could fetch full user here if needed)
    req.user = {
      id: decoded.userId,
      email: "", // Will be populated if needed
    };

    next();
  } catch (error) {
    console.error("Error in authentication middleware:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
}

/**
 * Optional: Middleware to attach full user object
 */
export async function attachUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const user = await storage.getUser(req.user.id);
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (error) {
    console.error("Error attaching user:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
}

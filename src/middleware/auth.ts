import { auth as betterAuth } from "../lib/auth";
import { NextFunction, Request, Response } from "express";
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

// 1. Keep your Global Declaration
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        emailVerified: boolean;
      };
    }
  }
}

// 2. The Completed Middleware
export const auth = (...requiredRoles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await betterAuth.api.getSession({
        headers: req.headers as any, // headers are compatible with Better Auth
      });

      // --- CHECK 1: Is the user logged in? ---
      if (!session) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized Access",
          error: "You must be logged in to view this resource",
        });
      }

      // --- CHECK 2: Is their email verified? ---
      // (Optional: You can remove this block if you allow unverified users)
      if (!session.user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Access Denied",
          error: "Please verify your email address to proceed.",
        });
      }

      // --- CHECK 3: Do they have the required role? ---
      // We safely cast the role to string since your Type expects a string
      const userRole = (session.user as any).role || "USER";

      // --- SUCCESS: Attach User to Request ---
      // We map the fields manually to match your specific Interface definition
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        emailVerified: session.user.emailVerified,
        role: userRole,
      };

      if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
          error: "You do not have the required permissions",
        });
      }

      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  };
};

import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { errorResponse } from "../utils/response";

export interface AuthRequest extends Request {
  userId?: string;
  email?: string;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return errorResponse(res, "No token provided", 401);
    }

    const payload = verifyToken(token);
    if (!payload) {
      return errorResponse(res, "Invalid or expired token", 401);
    }

    req.userId = payload.userId;
    req.email = payload.email;
    next();
  } catch (error) {
    return errorResponse(res, "Authentication failed", 401);
  }
}
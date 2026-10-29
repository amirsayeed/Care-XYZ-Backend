import jwt from "jsonwebtoken";
import { AuthPayload } from "../types";

const SECRET = process.env.JWT_SECRET || "default-secret-key";

export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET) as AuthPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function decodeToken(token: string): AuthPayload | null {
  try {
    return jwt.decode(token) as AuthPayload | null;
  } catch {
    return null;
  }
}
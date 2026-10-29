import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { getDB } from "../config/database";
import { successResponse, errorResponse } from "../utils/response";
import { generateToken, verifyToken } from "../utils/jwt";
import { registerSchema, loginSchema, RegisterInput, LoginInput } from "../utils/validators";
import bcryptjs from "bcryptjs";
import { ObjectId } from "mongodb";

export async function register(req: AuthRequest, res: Response) {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
        return errorResponse(res, validation.error.issues[0].message, 400);
    }

    const { name, email, contact, nid, password } = validation.data as RegisterInput;

    const db = await getDB();
    const usersCollection = db.collection("users");

    // Check if user exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return errorResponse(res, "Email already registered", 400);
    }

    // Hash password
    const passwordHash = await bcryptjs.hash(password, 10);

    // Create user
    const result = await usersCollection.insertOne({
      name,
      email,
      contact,
      nid,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const userId = result.insertedId.toString();
    const token = generateToken(userId, email);

    return successResponse(
      res,
      {
        user: { id: userId, name, email, contact },
        token,
      },
      "Registration successful",
      201
    );
  } catch (error) {
    return errorResponse(res, "Registration failed", 500, error);
  }
}

export async function login(req: AuthRequest, res: Response) {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
        return errorResponse(res, validation.error.issues[0].message, 400);
    }

    const { email, password } = validation.data as LoginInput;

    const db = await getDB();
    const usersCollection = db.collection("users");

    // Find user
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    // Verify password
    const isValid = await bcryptjs.compare(password, user.passwordHash);
    if (!isValid) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const userId = user._id.toString();
    const token = generateToken(userId, email);

    return successResponse(
      res,
      {
        user: { id: userId, name: user.name, email, contact: user.contact },
        token,
      },
      "Login successful"
    );
  } catch (error) {
    return errorResponse(res, "Login failed", 500, error);
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return errorResponse(res, "Unauthorized", 401);
    }

    const db = await getDB();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({
      _id: new ObjectId(req.userId),
    });

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      contact: user.contact,
      nid: user.nid,
    });
  } catch (error) {
    return errorResponse(res, "Failed to fetch user", 500, error);
  }
}
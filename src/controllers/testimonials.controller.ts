import { Request, Response } from "express";
import { getDB } from "../config/database";
import { successResponse, errorResponse } from "../utils/response";

export async function getTestimonials(req: Request, res: Response) {
  try {
    const db = await getDB();
    const testimonials = await db
      .collection("testimonials")
      .find({})
      .sort({ date: -1 })
      .limit(6)
      .toArray();

    return successResponse(res, testimonials, "Testimonials fetched");
  } catch (error) {
    return errorResponse(res, "Failed to fetch testimonials", 500, error);
  }
}
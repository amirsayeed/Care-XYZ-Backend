import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
} from "../controllers/bookings.controller";

const router = Router();

router.post("/", authMiddleware, createBooking);
router.get("/", authMiddleware, getUserBookings);
router.get("/:id", authMiddleware, getBookingById);
router.patch("/:id/cancel", authMiddleware, cancelBooking);

export default router;
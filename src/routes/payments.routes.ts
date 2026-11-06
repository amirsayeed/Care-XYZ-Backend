import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  createCheckout,
  getMyPayments,
} from "../controllers/payments.controller";

const router = Router();

router.get("/", authMiddleware, getMyPayments);
router.post("/checkout/:bookingId", authMiddleware, createCheckout);

export default router;
import { Router } from "express";
import { getTestimonials } from "../controllers/testimonials.controller";

const router = Router();

router.get("/", getTestimonials);

export default router;
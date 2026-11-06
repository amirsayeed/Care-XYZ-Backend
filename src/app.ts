import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import servicesRoutes from "./routes/services.routes";
import locationsRoutes from "./routes/locations.routes";
import bookingsRoutes from "./routes/bookings.routes";
import testimonialsRoutes from "./routes/testimonials.routes";
import paymentsRoutes from "./routes/payments.routes";
import { handleStripeWebhook } from "./controllers/payments.controller";

const app = express();

app.use(cors());

// Must stay above express.json(): Stripe verifies the raw request body
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/testimonials", testimonialsRoutes);
app.use("/api/payments", paymentsRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "✓ Backend running" });
});

export default app;
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectToDatabase } from "./config/database";
import authRoutes from "./routes/auth.routes";
import servicesRoutes from "./routes/services.routes";
import locationsRoutes from "./routes/locations.routes";
import bookingsRoutes from "./routes/bookings.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/bookings", bookingsRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "✓ Backend running" });
});

// Connect to database and start server
async function startServer() {
  try {
    await connectToDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
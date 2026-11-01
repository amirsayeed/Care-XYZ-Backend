import "dotenv/config";
import app from "./app";
import { connectToDatabase } from "./config/database";

const PORT = process.env.PORT || 5000;

async function start() {
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

start();
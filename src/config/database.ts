import { MongoClient, Db } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI not defined in .env");
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();
    cachedClient = client;
    cachedDb = client.db("care-xyz");
    console.log("✓ MongoDB connected");
    return cachedDb;
  } catch (error) {
    console.error("✗ MongoDB connection failed:", error);
    throw error;
  }
}

export async function getDB(): Promise<Db> {
  return connectToDatabase();
}

export async function closeDatabaseConnection(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}
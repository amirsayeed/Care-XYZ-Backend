import { MongoClient, Db } from "mongodb";

let clientPromise: Promise<MongoClient> | null = null;

export async function connectToDatabase(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (!clientPromise) {
    clientPromise = new MongoClient(uri).connect().catch((error) => {
      // Clear the cache so the next request retries
      clientPromise = null;
      throw error;
    });
  }

  const client = await clientPromise;
  return client.db("care-xyz");
}

export async function getDB(): Promise<Db> {
  return connectToDatabase();
}
import { MongoClient, MongoClientOptions } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const mongodb_uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
  serverSelectionTimeoutMS: 7000, // Timeout after 7s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  maxPoolSize: 10, // Maintain up to 10 socket connections
  retryWrites: true, // Retry failed writes
  writeConcern: { w: "majority" }, // Write concern
};

let client: MongoClient;
// Use a global variable in dev due to HMR
if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient;
  };
  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(mongodb_uri, options);
  }
  client = globalWithMongo._mongoClient;
} else {
  client = new MongoClient(mongodb_uri, options);
}
export async function testConnection() {
  try {
    console.log("Testing MongoDB connection...");
    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB connection successful");
    return true;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    return false;
  }
}

export async function initIndexes() {
  const db = client.db("real-estate-app");
  try {
    await db
      .collection("properties")
      .createIndex({ name: 1, "location.address": 1 }, { unique: true });

    await db.collection("agencies").createIndex({ name: 1 }, { unique: true });

    console.log("successfully setup indexes ");
  } catch (error) {
    console.error("error setting up indexes:", error);
  }
}
// initIndexes();
export default client;

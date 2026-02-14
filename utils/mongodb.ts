import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export async function getDb(): Promise<Db> {
  const connectedClient = await clientPromise;
  // Extract database name from the URI (e.g., mongodb://localhost:27017/oa_logs -> oa_logs)
  const dbName = new URL(uri!.replace("mongodb://", "http://")).pathname.slice(1) || "oa_logs";
  return connectedClient.db(dbName);
}

export async function getClient(): Promise<MongoClient> {
  return clientPromise;
}

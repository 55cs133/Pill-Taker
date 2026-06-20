import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let client: ReturnType<typeof postgres> | null = null;
let db: PostgresJsDatabase | null = null;

export function getDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (!client) {
    client = postgres(connectionString);
    db = drizzle(client);
  }

  return { db: db!, client: client! };
}

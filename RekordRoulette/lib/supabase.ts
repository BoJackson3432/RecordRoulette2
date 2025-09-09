// Database configuration for Vercel hosting
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';

// Database connection for API routes
let client: postgres.Sql<{}> | null = null;

export function getDatabase() {
  if (!client) {
    const connectionString = process.env.DATABASE_URL!;
    client = postgres(connectionString, {
      prepare: false,
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
    });
  }
  
  return drizzle(client, { schema });
}
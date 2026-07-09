import postgres from 'postgres';

// Using environment variable to prevent hardcoded credentials
const connectionString = process.env.DATABASE_URL || import.meta.env?.VITE_DATABASE_URL || '';

if (!connectionString) {
  console.warn("No DATABASE_URL environment variable found.");
}

export const sql = postgres(connectionString, { ssl: 'require' });

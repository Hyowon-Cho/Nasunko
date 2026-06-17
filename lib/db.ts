import { Pool, type QueryResultRow } from "pg";

const globalForPostgres = globalThis as unknown as {
  postgresPool?: Pool;
};

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Add your AWS PostgreSQL connection string to .env.local.");
  }

  const needsSsl =
    process.env.POSTGRES_SSL === "true" ||
    connectionString.includes("sslmode=require");

  return new Pool({
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  });
}

function getPool() {
  if (!globalForPostgres.postgresPool) {
    globalForPostgres.postgresPool = createPool();
  }

  return globalForPostgres.postgresPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
) {
  return getPool().query<T>(text, values);
}

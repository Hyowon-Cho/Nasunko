import { Pool, type QueryResultRow } from "pg";

const globalForPostgres = globalThis as unknown as {
  postgresPool?: Pool;
};

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Add your AWS PostgreSQL connection string to .env.local.");
  }

  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
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

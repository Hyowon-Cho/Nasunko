import { Pool, type QueryResultRow } from "pg";

const globalForPostgres = globalThis as unknown as {
  postgresPool?: Pool;
};

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Add your AWS PostgreSQL connection string to .env.local.");
  }

  if (
    connectionString.includes("AWS_RDS_HOST") ||
    connectionString.includes("USER:PASSWORD") ||
    connectionString.includes("DB_NAME")
  ) {
    throw new Error("DATABASE_URL still contains placeholder values. Replace USER, PASSWORD, AWS_RDS_HOST, and DB_NAME with your real PostgreSQL connection details.");
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

import { Pool, type QueryResultRow } from "pg";

const connectionString = process.env.POSTGRES_URL;

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    if (!connectionString) {
      throw new Error(
        "POSTGRES_URL environment variable is not set. Cannot connect to database."
      );
    }

    pool = new Pool({
      connectionString: connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on("error", (err) => {
      console.error("[DB] Unexpected PostgreSQL pool error:", err);
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: (string | number | boolean | null | Date | undefined)[]
): Promise<T[]> {
  const client = getPool();
  const result = await client.query<T>(text, params);
  return result.rows;
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: (string | number | boolean | null | Date | undefined)[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

export { getPool };
export { pool };
export default getPool;

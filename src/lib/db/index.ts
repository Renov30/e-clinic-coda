import mysql, { Pool, PoolConnection } from "mysql2/promise";
import { logger } from "@/lib/logger";

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    const host = process.env.DB_HOST || "127.0.0.1";
    const port = Number(process.env.DB_PORT || "3306");
    const user = process.env.DB_USER || "coda_user";
    const password = process.env.DB_PASSWORD || "coda_secret_password";
    const database = process.env.DB_NAME || "sik";

    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || "10"),
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      charset: "utf8mb4",
    });

    logger.info("MySQL connection pool initialized", {
      host,
      port,
      database,
    });
  }

  return pool;
}

export async function query<T = unknown>(
  sql: string,
  params: (string | number | boolean | Date | null | Buffer | undefined)[] = []
): Promise<T[]> {
  try {
    const currentPool = getDbPool();
    const [rows] = await currentPool.execute(sql, params as (string | number | boolean | Date | null | Buffer)[]);
    return rows as T[];
  } catch (error) {
    logger.error("Database query error", {
      sql,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function withTransaction<T>(
  callback: (connection: PoolConnection) => Promise<T>
): Promise<T> {
  const currentPool = getDbPool();
  const connection = await currentPool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    logger.error("Transaction rolled back due to error", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    connection.release();
  }
}

export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  message: string;
  latencyMs?: number;
}> {
  const startTime = Date.now();
  try {
    const currentPool = getDbPool();
    await currentPool.query("SELECT 1 AS health_check");
    return {
      connected: true,
      message: "Database MySQL terhubung",
      latencyMs: Date.now() - startTime,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      message: `Database belum terhubung: ${message}`,
      latencyMs: Date.now() - startTime,
    };
  }
}

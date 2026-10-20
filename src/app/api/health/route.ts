import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/db";
import { APP_CONFIG } from "@/config/app-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbHealth = await checkDatabaseHealth();

  return NextResponse.json(
    {
      app: APP_CONFIG.name,
      version: APP_CONFIG.version,
      status: "online",
      timestamp: new Date().toISOString(),
      database: dbHealth,
    },
    {
      status: dbHealth.connected ? 200 : 503,
    }
  );
}

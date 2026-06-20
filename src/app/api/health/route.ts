import { NextResponse } from "next/server";
import postgres from "postgres";

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return NextResponse.json(
      { status: "error", message: "DATABASE_URL is not configured" },
      { status: 503 }
    );
  }

  const client = postgres(databaseUrl);

  try {
    await client`SELECT 1 AS ok`;
    return NextResponse.json({
      status: "ok",
      message: "Database connection successful",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    return NextResponse.json(
      { status: "error", message },
      { status: 503 }
    );
  } finally {
    await client.end();
  }
}

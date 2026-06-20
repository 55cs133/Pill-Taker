import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";

import { getDatabase } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { treatments } from "@/lib/schema/treatments";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const { id } = await params;

  try {
    const { db } = getDatabase();
    const [deleted] = await db
      .delete(treatments)
      .where(and(eq(treatments.id, id), eq(treatments.userId, userId)))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Treatment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting treatment:", error);
    return NextResponse.json(
      { error: "An error has occurred" },
      { status: 500 }
    );
  }
}

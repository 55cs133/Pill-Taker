import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { getDatabase } from "@/lib/db";
import { users } from "@/lib/schema/users";
import { getSessionFromCookies } from "@/lib/auth";

export async function GET() {
  const session = await getSessionFromCookies();

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const { db } = getDatabase();

  const [user] = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}

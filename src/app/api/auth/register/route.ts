import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { getDatabase } from "@/lib/db";
import { users } from "@/lib/schema/users";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password and name are required" },
        { status: 400 }
      );
    }

    const { db } = getDatabase();

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const [user] = await db
      .insert(users)
      .values({ email, passwordHash, name })
      .returning({ id: users.id });

    const sessionToken = await createSessionToken(user.id);
    const cookie = setSessionCookie(sessionToken);

    const response = NextResponse.json(
      { message: `Welcome ${name}`, user: { name, email } },
      { status: 201 }
    );

    response.cookies.set(cookie);
    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}

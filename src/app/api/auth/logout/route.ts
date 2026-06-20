import { NextResponse } from "next/server";

import { COOKIE_NAME_EXPORT } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json(
    { message: "Logged out" },
    { status: 200 }
  );

  response.cookies.set({
    name: COOKIE_NAME_EXPORT,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  return response;
}

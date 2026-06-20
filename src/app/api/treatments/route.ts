import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { eq, desc } from "drizzle-orm";
import crypto from "node:crypto";

import { getDatabase } from "@/lib/db";
import { treatments, type Medicine } from "@/lib/schema/treatments";

function getUserId(request: NextRequest): string | null {
  return request.headers.get("x-user-id");
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { name, interval, medicines } = body as {
      name: string;
      interval: number;
      medicines: Medicine[];
    };

    if (!name || interval == null || !Array.isArray(medicines)) {
      return NextResponse.json(
        { error: "Missing required fields: name, interval, medicines" },
        { status: 400 }
      );
    }

    if (typeof interval !== "number" || interval <= 0) {
      return NextResponse.json(
        { error: "Interval must be a positive number (hours)" },
        { status: 400 }
      );
    }

    for (const med of medicines) {
      if (!med.name || !med.dosage || !med.quantity) {
        return NextResponse.json(
          {
            error:
              "Each medicine must include name, dosage, and quantity",
          },
          { status: 400 }
        );
      }
    }

    const slug = crypto.randomUUID();

    const { db } = getDatabase();
    const [treatment] = await db
      .insert(treatments)
      .values({
        name,
        interval,
        medicine: medicines,
        slug,
        userId,
      })
      .returning();

    return NextResponse.json(treatment, { status: 201 });
  } catch (error) {
    console.error("Error creating treatment:", error);
    return NextResponse.json(
      { error: "An error has occurred" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const { db } = getDatabase();
    const userTreatments = await db
      .select()
      .from(treatments)
      .where(eq(treatments.userId, userId))
      .orderBy(desc(treatments.createdAt));

    return NextResponse.json(userTreatments);
  } catch (error) {
    console.error("Error fetching treatments:", error);
    return NextResponse.json(
      { error: "An error has occurred" },
      { status: 500 }
    );
  }
}

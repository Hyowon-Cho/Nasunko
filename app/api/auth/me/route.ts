import { NextResponse } from "next/server";
import { databaseErrorResponse } from "@/lib/api-error";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}

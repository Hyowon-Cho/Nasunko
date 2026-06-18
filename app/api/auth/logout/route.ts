import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { databaseErrorResponse } from "@/lib/api-error";

export async function POST() {
  try {
    await clearSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMissionState } from "@/lib/mission";

export async function GET() {
  const supabase = createAdminClient();
  const state = await getMissionState(supabase);
  if (!state) {
    return NextResponse.json({ error: "No mission found" }, { status: 404 });
  }
  return NextResponse.json(state);
}

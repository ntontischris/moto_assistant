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

export async function PATCH(request: Request) {
  const body = await request.json();
  const supabase = createAdminClient();

  if (body.answer_id && body.answer_text !== undefined) {
    const { error } = await supabase
      .from("assistant_answers")
      .update({ answer_text: body.answer_text })
      .eq("id", body.answer_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

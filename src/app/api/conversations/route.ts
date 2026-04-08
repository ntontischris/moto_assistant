import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const supabase = createAdminClient();

  const { data: mission } = await supabase
    .from("assistant_mission")
    .select("id")
    .single();

  if (!mission) {
    return NextResponse.json({ error: "No mission" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("assistant_conversations")
    .insert({ mission_id: mission.id, status: "active", last_section: 0 })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.rpc("increment_mission_conversations", {
    mission_row_id: mission.id,
  });

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const supabase = createAdminClient();

  const updates: Record<string, unknown> = {};
  if (body.elevenlabs_conversation_id)
    updates.elevenlabs_conversation_id = body.elevenlabs_conversation_id;
  if (body.status) updates.status = body.status;
  if (body.last_section !== undefined) updates.last_section = body.last_section;
  if (body.sections_covered) updates.sections_covered = body.sections_covered;
  if (body.duration_seconds !== undefined)
    updates.duration_seconds = body.duration_seconds;

  const { error } = await supabase
    .from("assistant_conversations")
    .update(updates)
    .eq("id", body.conversation_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

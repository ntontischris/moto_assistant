import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAgentWebhook } from "@/lib/webhooks/verify";
import type { UpdateProgressPayload } from "@/types/agent";

export async function POST(request: Request) {
  if (!verifyAgentWebhook(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: UpdateProgressPayload = await request.json();
    const conversationId = body.conversation_id ?? body.session_id;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("assistant_sessions")
      .update({ progress_section: body.section_number })
      .eq("id", conversationId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAgentWebhook } from "@/lib/webhooks/verify";
import type { SaveAnswerPayload } from "@/types/agent";

export async function POST(request: Request) {
  if (!verifyAgentWebhook(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: SaveAnswerPayload = await request.json();
    const conversationId = body.conversation_id ?? body.session_id;
    const supabase = createAdminClient();

    const { error } = await supabase.from("assistant_answers").upsert(
      {
        session_id: conversationId,
        section_number: body.section_number,
        section_name: body.section_name,
        question_key: body.question_key,
        answer_text: body.answer_text,
        ...(body.answer_structured
          ? { answer_structured: body.answer_structured }
          : {}),
      },
      {
        onConflict: "session_id,question_key",
        ignoreDuplicates: false,
      },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

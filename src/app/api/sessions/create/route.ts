import { NextResponse } from "next/server";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";

const createSessionSchema = z.object({
  client_name: z.string().min(1, "Client name is required"),
  client_email: z.string().email("Invalid email address"),
  client_company: z.string().optional(),
  mode: z.enum(["discovery", "support"]),
});

const updateConversationSchema = z.object({
  session_id: z.string().uuid("Invalid session ID"),
  elevenlabs_conversation_id: z.string().min(1, "Conversation ID is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("assistant_sessions")
      .insert({
        client_name: parsed.data.client_name,
        client_email: parsed.data.client_email,
        client_company: parsed.data.client_company ?? null,
        mode: parsed.data.mode,
        status: "active",
        progress_section: 1,
        progress_total: 14,
      })
      .select("id, resume_token")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = updateConversationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("assistant_sessions")
      .update({
        elevenlabs_conversation_id: parsed.data.elevenlabs_conversation_id,
      })
      .eq("id", parsed.data.session_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

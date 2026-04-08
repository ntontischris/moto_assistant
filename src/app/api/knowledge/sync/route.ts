import { NextResponse } from "next/server";
import { z } from "zod";

import { syncKnowledgeToElevenLabs } from "@/lib/elevenlabs/knowledge-sync";
import { createClient } from "@/lib/supabase/server";

const syncSchema = z.object({
  knowledge_id: z.string().min(1, "knowledge_id is required"),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = syncSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const { data: entry, error: fetchError } = await supabase
      .from("assistant_knowledge")
      .select("id, title, content")
      .eq("id", parsed.data.knowledge_id)
      .single();

    if (fetchError || !entry) {
      return NextResponse.json(
        { error: "Knowledge entry not found" },
        { status: 404 },
      );
    }

    const docId = await syncKnowledgeToElevenLabs(entry.title, entry.content);

    const { error: updateError } = await supabase
      .from("assistant_knowledge")
      .update({ elevenlabs_doc_id: docId })
      .eq("id", entry.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";

import { syncKnowledgeToElevenLabs } from "@/lib/elevenlabs/knowledge-sync";
import { createClient } from "@/lib/supabase/server";

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.enum([
    "project_spec",
    "how_to",
    "faq",
    "release_notes",
    "client_profile",
  ]),
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
    const parsed = uploadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const { title, content, category } = parsed.data;

    // Sync to ElevenLabs first
    let elevenlabsDocId: string | null = null;
    try {
      elevenlabsDocId = await syncKnowledgeToElevenLabs(title, content);
    } catch (err) {
      console.error("[knowledge/upload] ElevenLabs sync failed:", err);
      // Continue — we still store the entry, sync can be retried later
    }

    const { data, error } = await supabase
      .from("assistant_knowledge")
      .insert({
        title,
        content,
        category,
        source: "manual" as const,
        status: "active" as const,
        elevenlabs_doc_id: elevenlabsDocId,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

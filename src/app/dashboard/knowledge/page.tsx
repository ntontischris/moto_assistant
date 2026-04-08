import { KnowledgeManager } from "@/components/dashboard/knowledge-manager";
import { KnowledgeUpload } from "@/components/dashboard/knowledge-upload";
import { createClient } from "@/lib/supabase/server";
import type { AssistantKnowledge } from "@/types/database";

export default async function KnowledgePage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("assistant_knowledge")
    .select(
      "id, category, title, content, source, source_session_id, elevenlabs_doc_id, status, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  const entries: AssistantKnowledge[] = data ?? [];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold" style={{ color: "var(--gray-100)" }}>
        Knowledge Base
      </h1>

      <KnowledgeUpload />

      <KnowledgeManager entries={entries} />
    </div>
  );
}

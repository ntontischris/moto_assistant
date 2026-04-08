import { UnansweredQueue } from "@/components/dashboard/unanswered-queue";
import { createClient } from "@/lib/supabase/server";
import type { AssistantUnanswered } from "@/types/database";

interface UnansweredWithSession extends AssistantUnanswered {
  session?: { client_name: string } | null;
}

export default async function UnansweredPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("assistant_unanswered")
    .select(
      "id, session_id, question, context, answer, status, knowledge_entry_id, created_at, assistant_sessions(client_name)",
    )
    .order("created_at", { ascending: false });

  const questions: UnansweredWithSession[] = (data ?? []).map((row) => {
    const { assistant_sessions, ...rest } = row as Record<string, unknown>;
    const sessionData = assistant_sessions as {
      client_name: string;
    } | null;
    return {
      ...(rest as unknown as AssistantUnanswered),
      session: sessionData ? { client_name: sessionData.client_name } : null,
    };
  });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold" style={{ color: "var(--gray-100)" }}>
        Αναπάντητες Ερωτήσεις
      </h1>

      <UnansweredQueue questions={questions} />
    </div>
  );
}
